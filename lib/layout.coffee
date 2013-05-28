fs = require('fs')
_ = require 'underscore'
Canvas = require('canvas')

DefaultFooterTextOptions =
  font: '4pt Times'
  fillStyle: 'black'
  gravity: 'botLeft'

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
  x ||= 0
  y ||= 0
  x -= m.width / 2 if gravity.match(/^(top|center|bottom)$/i)
  x -= m.width if gravity.match(/^(right|topRight|botRight)$/i)
  y -= m.emHeightDescent if gravity.match(/^(bottom|botLeft|botRight)$/i)
  y += m.emHeightAscent if gravity.match(/^(top|topLeft|topRight)$/i)
  ctx.fillText text, x, y

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

pdf = false

set_page_footer = (options) -> page_footer = options

with_page = (options, cb) ->
  defaults = {width: 100, height: 100, page_margin: 10}
  {width, height, page_margin} = _.extend defaults, options
  canvas ||= new Canvas(width + 2 * page_margin, height + 2 * page_margin, pdf and 'pdf')
  ctx = canvas.getContext('2d')
  ctx.textDrawingMode = 'glyph' if pdf
  erase_background()

  ctx.save()
  ctx.translate page_margin, page_margin
  cb
    context: ctx
  ctx.restore()

  if page_footer
    options = _.extend page_footer, DefaultFooterTextOptions
    options = _.extend {x: page_margin, y: canvas.height}, options
    draw_title page_footer.text, options

  unless pdf
    filename = "#{DefaultFilename or 'test'}.png"
    fs.writeFile BuildDirectory + filename, canvas.toBuffer()
    console.info "Saved #{filename}"

with_grid = (options, cb) ->
  defaults = {gutter_width: 10, gutter_height: 10, header_height: 0}
  {cols, rows, cell_width, cell_height, header_height, gutter_width, gutter_height} = _.extend defaults, options
  options.width ||= cols * cell_width + (cols - 1) * gutter_width
  options.height ||=  header_height + rows * cell_height + (rows - 1) * gutter_height
  with_page options, (page) ->
    i = 0
    cb
      context: page.context
      add_cell: (draw_fn) ->
        return if i >= cols * rows
        [col, row] = [i % cols, Math.floor(i / cols)]
        ctx.save()
        ctx.translate col * (cell_width + gutter_width), header_height + row * (cell_height + gutter_height)
        draw_fn()
        ctx.restore()
        i += 1

with_book = (filename, options, cb) ->
  [options, cb] = [{}, options] if _.isFunction(options)
  pdf = true
  page_limit = options.pages
  page_count = 0
  cb
    with_page: (options, draw_page) ->
      return if @done
      page_count += 1
      if _.isFunction(draw_page)
        with_page options, draw_page
      else
        draw_page = options
        draw_page()
      ctx.addPage()
      @done = true if page_limit and page_limit <= page_count
  unless canvas
    console.warn "No pages"
    return
  pathname = BuildDirectory + filename + ".pdf"
  fs.writeFile pathname, canvas.toBuffer(), (err) ->
    if err
      console.error "Error #{err.code} writing to #{err.path}"
    else
      console.info "Saved #{pathname}"
  canvas = null
  ctx = null

module.exports = {
  with_book
  with_grid
  with_page
  draw_title
  directory
  filename
  set_page_footer
  with_graphics_context
}
