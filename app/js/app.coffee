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

  $scope.getScaleChords = (scaleName) ->
    Scale.find(scaleName).chords().map (chord) -> chord.name

app.controller 'ChordDetailsCtrl', ($scope, $routeParams) ->
  chord = Chord.find($routeParams.chordName)
  $scope.chord = chord
  $scope.chordName = chord.name
  fingerings = fingerings_for(chord)
  $scope.fingeringIndices = [0...fingerings.length]

app.directive 'chord', ->
  restrict: 'CE'
  replace: true
  template: ->
    "<canvas width='#{ChordDiagram.width}' height='#{ChordDiagram.height}'/>"
  scope: {name: '@', fingering: '@'}
  link: (scope, element, attrs) ->
    canvas = element[0]
    render = ->
      {name, fingering} = attrs
      chord = Chord.find(name)
      fingerings = fingerings_for(chord)
      index = Number(fingering) or 0
      fingering = fingerings[index]
      return unless fingering
      ctx = canvas.getContext('2d')
      ctx.clearRect 0, 0, 90, 100
      ChordDiagram.draw ctx, fingering.positions, barres: fingering.barres
    attrs.$observe 'fingering', -> render()
    attrs.$observe 'name', -> render()

app.filter 'raiseAccidentals', ->
  (name) ->
    name.replace(/([♯♭])/, '<sup>$1</sup>')
