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

app = angular.module 'FretboardApp', ['ngRoute', 'ngSanitize']

app.config ($locationProvider, $routeProvider) ->
  $routeProvider
    .when('/', controller: 'ChordTableCtrl', templateUrl: 'templates/chord-table.html')
    .when('/chord/:chordName', controller: 'ChordDetailsCtrl', templateUrl: 'templates/chord-details.html')
    .otherwise(redirectTo: '/')

app.controller 'ChordTableCtrl', ($scope) ->
  $scope.tonics = ['E', 'F', 'G', 'A', 'B', 'C', 'D']

  $scope.getScaleChords = do ->
    cache = {}
    (scaleName, sevenths) ->
      cache[[scaleName, sevenths]] or= Scale.find(scaleName).chords(sevenths: sevenths)

app.controller 'ChordDetailsCtrl', ($scope, $routeParams) ->
  chord = Chord.find($routeParams.chordName)
  instrument = FretboardModel.DefaultInstrument
  $scope.instrument = instrument
  $scope.chord = chord
  $scope.fingerings = chordFingerings(chord, instrument)

app.directive 'chord', ->
  restrict: 'CE'
  replace: true
  template: ->
    instrument = FretboardModel.DefaultInstrument
    dimensions = {width: ChordDiagram.width(instrument), height: ChordDiagram.height(instrument)}
    "<canvas width='#{dimensions.width}' height='#{dimensions.height}'/>"
  scope: {chord: '=', fingering: '=?'}
  link: (scope, element, attrs) ->
    canvas = element[0]
    ctx = canvas.getContext('2d')
    instrument = FretboardModel.DefaultInstrument
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
