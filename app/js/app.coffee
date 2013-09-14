ChordDiagram = require './chord_diagram'

# requirejs necessitates this
angular.element(document).ready ->
  angular.bootstrap(document, ['FretboardApp'])

app = angular.module 'FretboardApp', []

app.controller 'ChordCtrl', ($scope) ->
  console.info 'init controller'

app.directive 'chord', ->
  restrict: 'CE'
  replace: true
  template: '<canvas width="90" height="100"/>'
  transclude: true
  scope: {name: '@'}
  link: (scope, element, attrs) ->
    canvas = element[0]
    attrs.$observe 'name', (chordName) ->
      console.info 'chord', chordName
