fs = require('fs')
_ = require 'underscore'
Canvas = require('canvas')

DefaultFooterTextOptions =
  font: '4pt Times'
  fillStyle: 'black'
  gravity: 'bottom'

page_footer = null

#
# Drawing
#

canvas = null
ctx = null

erase_background = ->
  ctx.fillStyle = 'white'
  ctx.fillRect 0, 0, canvas.width, canvas.height

draw_title = (text, {font, fillStyle, x, y, gravity}={}) ->
  gravity ||= ''
  ctx.font = font if font
  ctx.fillStyle = fillStyle if fillStyle
  m = ctx.measureText(text)
  # x -= m.width / 2
  y -= m.emHeightDescent if gravity.match(/^bottom$/)
  y += m.emHeightAscent if gravity.match(/^top|topLeft|topRight$/)
  ctx.fillText text, x or 0, y or 0

with_graphics_context = (fn) ->
  ctx.save()
  fn ctx
  ctx.restore()


#
# File Saving
#

BuildDirectory = '.'
DefaultFilename = null

directory = (path) -> BuildDirectory = path
filename = (name) -> DefaultFilename = name

save_canvas_to_png = (canvas, fname) ->
  out = fs.createWriteStream(BuildDirectory + fname)
  stream = canvas.pngStream()
  stream.on 'data', (chunk) -> out.write(chunk)
  stream.on 'end', () -> console.info "Saved #{fname}"


#
# Layout
#

mode = null
pdf = false

set_page_footer = (options) -> page_footer = options

with_page = (options, draw_page) ->
  defaults = {width: 100, height: 100, page_margin: 10}
  {width, height, page_margin} = _.extend(defaults, options)
  canvas ||= new Canvas(width + 2 * page_margin, height + 2 * page_margin, pdf and 'pdf')
  ctx = canvas.getContext('2d')
  ctx.textDrawingMode = 'glyph' if pdf
  erase_background()

  ctx.save()
  ctx.translate page_margin, page_margin
  draw_page()
  ctx.restore()

  if page_footer
    options = _.extend(page_footer, DefaultFooterTextOptions)
    options = _.extend({x: page_margin, y: canvas.height}, options)
    draw_title page_footer.text, options

  unless pdf
    filename = "#{DefaultFilename or 'test'}.png"
    fs.writeFile BuildDirectory + filename, canvas.toBuffer()
    console.info "Saved #{filename}"

with_grid = (options, draw_page) ->
  {cols, rows, cell_width, cell_height, header_height} = options
  {gutter_width, gutter_height} = options
  header_height ||= 0
  gutter_width ||= 10
  gutter_height ||= 10
  options.width ||= cols * cell_width + (cols - 1) * gutter_width
  options.height ||=  header_height + rows * cell_height + (rows - 1) * gutter_height
  with_page  options, ->
    i = 0
    draw_page (draw_cell) ->
      return if i >= cols * rows
      [col, row] = [i % cols, Math.floor(i / cols)]
      ctx.save()
      ctx.translate col * (cell_width + gutter_width), header_height + row * (cell_height + gutter_height)
      draw_cell()
      ctx.restore()
      i += 1

with_book = (filename, options, draw_book) ->
  draw_book = options if typeof options == 'function'
  pdf = true
  mode = 'draw'
  page_limit = options.pages
  page_count = 0
  draw_book (draw_page) ->
    return if page_limit and page_limit <= page_count
    page_count += 1
    draw_page()
    ctx.addPage()
  pathname = BuildDirectory + filename + ".pdf"
  fs.writeFile pathname, canvas.toBuffer(), (err) ->
    if err
      console.error "Error #{err.code} writing to #{err.path}"
    else
      console.info "Saved #{pathname}"
  canvas = null
  ctx = null

module.exports =
  with_book: with_book
  with_grid: with_grid
  with_page: with_page
  draw_title: draw_title
  directory: directory
  filename: filename
  set_page_footer: set_page_footer
  with_graphics_context: with_graphics_context
