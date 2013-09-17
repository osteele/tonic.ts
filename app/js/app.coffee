ChordDiagram = require './chord_diagram'
Layout = require './layout'

{
  best_fingering_for
  fingerings_for
  finger_positions_on_chord
} = require('./fretboard_logic')

{
  Chord
  Chords
  Scale
  Scales
} = require('./theory')


# requirejs necessitates this
angular.element(document).ready ->
  angular.bootstrap(document, ['FretboardApp'])

app = angular.module 'FretboardApp', []

app.config ($locationProvider, $routeProvider) ->
  $routeProvider
    .when('/', controller: 'ChordTableCtrl', templateUrl: 'templates/chord-table.html')
    .when('/chord/:chordName', controller: 'ChordDetailsCtrl', templateUrl: 'templates/chord-details.html')
    .otherwise(redirectTo: '/')

app.controller 'ChordTableCtrl', ($scope) ->
  $scope.tonics = ['E', 'F', 'G', 'A', 'B', 'C', 'D']

  $scope.getScaleChords = do ->
    cache = {}
    (scaleName) ->
      cache[scaleName] or= Scale.find(scaleName).chords()#.map (chord) -> chord.name

app.controller 'ChordDetailsCtrl', ($scope, $routeParams) ->
  chord = Chord.find($routeParams.chordName)
  $scope.chord = chord
  $scope.fingerings = fingerings_for(chord)

app.directive 'chord', ->
  restrict: 'CE'
  replace: true
  template: ->
    "<canvas width='#{ChordDiagram.width}' height='#{ChordDiagram.height}'/>"
  scope: {chord: '=', fingering: '=?'}
  link: (scope, element, attrs) ->
    canvas = element[0]
    render = ->
      {chord, fingering} = scope
      fingerings = fingerings_for(chord)
      fingering or= fingerings[0]
      return unless fingering
      ctx = canvas.getContext('2d')
      ctx.clearRect 0, 0, 90, 100
      ChordDiagram.draw ctx, fingering.positions, barres: fingering.barres
    render()

app.filter 'raiseAccidentals', ->
  (name) ->
    name.replace(/([♯♭])/, '<sup>$1</sup>')
