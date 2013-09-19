ChordDiagram = require './chord_diagram'
Layout = require './layout'
FretboardModel = require('./fretboard_model')
{chordFingerings} = require('./fretboard_logic')


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
      cache[scaleName] or= Scale.find(scaleName).chords()

app.controller 'ChordDetailsCtrl', ($scope, $routeParams) ->
  chord = Chord.find($routeParams.chordName)
  instrument = FretboardModel.DefaultInstrument
  $scope.instrument = instrument
  $scope.chord = chord
  $scope.fingerings = chordFingerings(chord, instrument)

# console.info 'DefaultInstrument', FretboardModel.DefaultInstrument
DefaultChordDiagramDimensions =
  # width: ChordDiagram.width(FretboardModel.DefaultInstrument)
  # height: ChordDiagram.height(FretboardModel.DefaultInstrument)
  width: 100
  height: 100
# console.info 'DefaultChordDiagramDimensions', DefaultChordDiagramDimensions

app.directive 'chord', ->
  restrict: 'CE'
  replace: true
  template: ->
    "<canvas width='#{DefaultChordDiagramDimensions.width}' height='#{DefaultChordDiagramDimensions.height}'/>"
  scope: {chord: '=', fingering: '=?'}
  link: (scope, element, attrs) ->
    canvas = element[0]
    instrument = FretboardModel.DefaultInstrument
    render = ->
      {chord, fingering} = scope
      fingerings = chordFingerings(chord, instrument)
      fingering or= fingerings[0]
      return unless fingering
      ctx = canvas.getContext('2d')
      ctx.clearRect 0, 0, 90, 100
      ChordDiagram.draw ctx, instrument, fingering.positions, barres: fingering.barres
    render()

app.filter 'raiseAccidentals', ->
  (name) ->
    name.replace(/([♯♭])/, '<sup>$1</sup>')
