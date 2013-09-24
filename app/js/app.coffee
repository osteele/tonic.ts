#
# Imports
#

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


#
# Extensions
#

# requirejs necessitates this
angular.element(document).ready ->
  angular.bootstrap(document, ['FretboardApp'])

_.mixin reverse: (array) -> [].concat(array).reverse()


#
# Application
#

app = angular.module 'FretboardApp', ['ngAnimate', 'ngRoute', 'ngSanitize']

app.config ($locationProvider, $routeProvider) ->
  $routeProvider
    .when('/', controller: 'ChordTableCtrl', templateUrl: 'templates/chord-table.html')
    .when('/chord/:chordName', controller: 'ChordDetailsCtrl', templateUrl: 'templates/chord-details.html')
    .otherwise(redirectTo: '/')


#
# Chord Table
#

app.controller 'ChordTableCtrl', ($scope) ->
  $scope.tonics = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

  $scope.getScaleChords = do ->
    # The cache is necessary to prevent a digest iteration error
    cache = {}
    (scaleName, sevenths) ->
      cache[[scaleName, sevenths]] or= Scale.find(scaleName).chords(sevenths: sevenths)


#
# Chord Details
#

app.controller 'ChordDetailsCtrl', ($scope, $routeParams) ->
  chordName = $routeParams.chordName.replace('&#9839;', '#')
  $scope.chord = Chord.find(chordName)
  $scope.instrument = Instruments.Default
  $scope.fingerings = chordFingerings($scope.chord, $scope.instrument, allPositions: true)

  #
  # Labels
  #

  for fingering in $scope.fingerings
    labels = []
    sortKeys = {}
    for name, value of fingering.properties
      sortKeys[name] = value
      sortKeys[name] = !value if typeof value == 'boolean'
      badge = value
      badge = null if value == true
      labels.push {name, badge} if value
    fingering.labels = labels.sort()
    fingering.sortKeys = sortKeys

  #
  # Sorting
  #

  $scope.keys = _.chain($scope.fingerings).pluck('properties').map(_.keys).flatten().uniq().value()
  $scope.sortKey = ''

  $scope.orderBy = (sortKey) ->
    $scope.sortKey = sortKey
    $('#voicings').isotope(sortBy: sortKey)
    # values = _.compact(fingerings.map (f) -> f.properties[sortKey])
    fingerings = $scope.fingerings
    for fingering in fingerings
      labels = fingering.labels.filter (label) -> label.name == sortKey
      fingering.labels = labels.concat(_.difference(fingering.labels, labels)) if labels.length


#
# Directives
#

app.directive 'isotopeContainer', ->
  restrict: 'CAE'
  link:
    post: (scope, element, attrs) ->
      sortData = {}
      scope.keys.map (key) ->
        sortData[key] = ($elem) ->
          return angular.element($elem).scope().fingering.sortKeys[key]
      $(element).isotope
        animationEngineString: 'css'
        itemSelector: '[isotope-item]'
        layoutMode: 'fitRows'
        getSortData: sortData

app.directive 'isotopeItem', ($timeout) ->
  restrict: 'AE'
  link: (scope, element, attrs) ->
    return unless scope.$last
    $element = $(element)
    element.ready ->
      $container = $element.parent('.isotope')
      $container.isotope('reloadItems').isotope(sortBy: 'barres').css('visibility', 'inherit')

app.directive 'chord', ->
  restrict: 'CE'
  replace: true
  template: ->
    instrument = Instruments.Default
    dimensions = {width: ChordDiagram.width(instrument), height: ChordDiagram.height(instrument)}
    "<div><span class='fretNumber' ng:show='topFretNumber'>{{topFretNumber}}</span>" +
      "<canvas width='#{dimensions.width}' height='#{dimensions.height}'/></div>"
  scope: {chord: '=', fingering: '=?'}
  link: (scope, element, attrs) ->
    canvas = element[0].querySelector('canvas')
    ctx = canvas.getContext('2d')
    instrument = Instruments.Default
    do ->
      {chord, fingering} = scope
      fingerings = chordFingerings(chord, instrument)
      fingering or= fingerings[0]
      return unless fingering
      ctx.clearRect 0, 0, canvas.width, canvas.height
      {topFret} = ChordDiagram.draw ctx, instrument, fingering.positions, barres: fingering.barres
      scope.topFretNumber = topFret if topFret > 0

app.filter 'raiseAccidentals', ->
  (name) ->
    name.replace(/([♯♭])/, '<sup>$1</sup>')
