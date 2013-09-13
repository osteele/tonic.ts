chai = require 'chai'
chai.should()

Layout = require '../lib/layout'
{
  PaperSizes
  box
  with_book
  with_graphics_context
} = Layout

describe "box", ->
  b = box width: 10, height: 20

  it "should default the width, height, ascent, descent, and descent", ->
    bb = box()
    bb.width.should.equal 0
    bb.height.should.equal 0
    bb.ascent.should.equal 0
    bb.descent.should.equal 0

  it "should default the ascent and descent when the height is provided", ->
    bb = box height: 15
    bb.height.should.equal 15
    bb.ascent.should.equal 15
    bb.descent.should.equal 0

  it "should default the height and descent when the ascent is provided", ->
    bb = box ascent: 0
    bb.height.should.equal 0
    bb.ascent.should.equal 0
    bb.descent.should.equal 0

  it "should default the height and descent when the descent is provided", ->
    bb = box descent: 5
    bb.height.should.equal 5
    bb.ascent.should.equal 0
    bb.descent.should.equal 5

  it "should default the height when the ascent and descent are provided", ->
    bb = box ascent: 10, descent: 5
    bb.height.should.equal 15
    bb.ascent.should.equal 10
    bb.descent.should.equal 5

  it "should default the ascent when the height and descent are provided", ->
    bb = box height: 15, descent: 5
    bb.height.should.equal 15
    bb.ascent.should.equal 10
    bb.descent.should.equal 5

  it "should default the descent when the height and ascent are provided", ->
    bb = box height: 15, ascent: 10
    bb.height.should.equal 15
    bb.ascent.should.equal 10
    bb.descent.should.equal 5

  it "should initialize the width and height", ->
    b.width.should.equal 10
    b.height.should.equal 20

describe "hbox", ->
  b1 = box width: 10, height: 20
  b2 = box width: 12, height: 22
  b3 = box width: 13,
  b = hbox b1, b2

  it "width should sum to the widths of its components", ->
    b.width.should.equal 10 + 12

  it "height should be the sum of the max ascent plus the max descent", ->
    b.ascent.should.equal 22
    b.descent.

# vbox should stack
# hbox should work with spring
# grid should work

make_test_book = ->
  with_book "Test", size: PaperSizes.letter, (book) ->
    book.with_page {}, (page) ->
      page.box
        width: 100
        height: 100
        draw: (ctx) ->
          ctx.fillStyle = 'red'
          ctx.fillRect 0, 0, 100, -100
      page.box
        width: 50
        height: 50
        draw: (ctx) ->
          ctx.fillStyle = 'green'
          ctx.fillRect 0, 0, 50, -50

# make_test_book()
