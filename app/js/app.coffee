ChordDiagram = require './chord_diagram'
Layout = require './layout'
Instruments = require './instruments'
{chordFingerings} = require './fingerings'


{
  Chord
  Chords
  Scale
  Scales
} = require('./theory')


# requirejs necessitates this
angular.element(document).ready ->
  angular.bootstrap(document, ['FretboardApp'])

app = angular.module 'FretboardApp', ['ngAnimate', 'ngRoute', 'ngSanitize']

app.config ($locationProvider, $routeProvider) ->
  $routeProvider
    .when('/', controller: 'ChordTableCtrl', templateUrl: 'templates/chord-table.html')
    .when('/chord/:chordName', controller: 'ChordDetailsCtrl', templateUrl: 'templates/chord-details.html')
    .otherwise(redirectTo: '/')

app.controller 'ChordTableCtrl', ($scope) ->
  $scope.tonics = ['E', 'F', 'G', 'A', 'B', 'C', 'D']

  $scope.getScaleChords = do ->
    # The cache is necessary to prevent a digest iteration error
    cache = {}
    (scaleName, sevenths) ->
      cache[[scaleName, sevenths]] or= Scale.find(scaleName).chords(sevenths: sevenths)

_.mixin reverse: (array) -> [].concat(array).reverse()

app.controller 'ChordDetailsCtrl', ($scope, $routeParams) ->
  chordName = $routeParams.chordName
  chordName = chordName.replace('&#9839;', '#')
  chord = Chord.find(chordName)
  instrument = Instruments.Default

  $scope.instrument = instrument
  $scope.chord = chord
  $scope.fingerings = chordFingerings(chord, instrument)

  $scope.orderBy = (key) ->
    $scope.sortKey = key
    fingerings = $scope.fingerings
    values = _.compact(fingerings.map (f) -> f.properties[key])
    privative = values[0] == true or values[0] == false
    fingerings = _.reverse(fingerings) if privative
    fingerings = _.sortBy(fingerings, (f) -> f.properties[key] or 0)
    fingerings = _.reverse(fingerings) if privative
    for fingering in fingerings
      labels = fingering.labels.filter (label) -> label.name == key
      fingering.labels = labels.concat(_.difference(fingering.labels, labels)) if labels.length
    $scope.fingerings = fingerings

  for fingering in $scope.fingerings
    labels = []
    for name, badge of fingering.properties
      badge = null if badge == true
      labels.push {name, badge}
    fingering.labels = labels.sort()

app.directive 'chord', ->
  restrict: 'CE'
  replace: true
  template: ->
    instrument = Instruments.Default
    dimensions = {width: ChordDiagram.width(instrument), height: ChordDiagram.height(instrument)}
    "<canvas width='#{dimensions.width}' height='#{dimensions.height}'/>"
  scope: {chord: '=', fingering: '=?'}
  link: (scope, element, attrs) ->
    canvas = element[0]
    ctx = canvas.getContext('2d')
    instrument = Instruments.Default
    render = ->
      {chord, fingering} = scope
      fingerings = chordFingerings(chord, instrument)
      fingering or= fingerings[0]
      return unless fingering
      ctx.clearRect 0, 0, canvas.width, canvas.height
      ChordDiagram.draw ctx, instrument, fingering.positions, barres: fingering.barres
    render()

app.filter 'raiseAccidentals', ->
  (name) ->
    name.replace(/([♯♭])/, '<sup>$1</sup>')
