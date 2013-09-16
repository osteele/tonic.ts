ChordDiagram = require './chord_diagram'
Layout = require './layout'

{
  best_fingering_for
  fingerings_for
  finger_positions_on_chord
} = require('./fretboard_logic')

{
  Chords
  Scale
  Scales
} = require('./theory')


# requirejs necessitates this
angular.element(document).ready ->
  angular.bootstrap(document, ['FretboardApp'])

app = angular.module 'FretboardApp', []

app.controller 'ChordCtrl', ($scope) ->
  $scope.scaleChords = # (scaleName) ->
    Scale.find('E').chords()

app.directive 'chord', ->
  restrict: 'CE'
  replace: true
  template: '<canvas width="90" height="100"/>'
  transclude: true
  scope: {name: '@'}
  link: (scope, element, attrs) ->
    canvas = element[0]
    attrs.$observe 'name', (chordName) ->
      chord = Chords.Major.at(chordName)
      fingerings = fingerings_for chord
      fingering = fingerings[0]
      ctx = canvas.getContext('2d')
      ChordDiagram.draw ctx, fingering.positions, barres: fingering.barres
