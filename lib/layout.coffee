fs = require('fs')
_ = require 'underscore'
Canvas = require('canvas')


#
# Drawing
#

canvas = null
ctx = null

erase_background = ->
  ctx.fillStyle = 'white'
  ctx.fillRect 0, 0, canvas.width, canvas.height

measure_text = (text, {font}={}) ->
  ctx.font = font if font
  ctx.measureText(text)

draw_text = (text, options={}) ->
  options = text if _.isObject(text)
  {font, fillStyle, x, y, gravity, width} = options
  gravity ||= ''
  if options.choices
    for choice in options.choices
      text = choice if _.isString(choice)
      {font} = choice if _.isObject(choice)
      break if measure_text(text, font: font).width <= options.width
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

CurrentPage = null
CurrentBook = null
Mode = null

with_page = (options, draw_page) ->
  throw new Error "Already inside a page" if CurrentPage

  defaults = {width: 100, height: 100, page_margin: 10}
  {width, height, page_margin} = _.extend defaults, options
  canvas ||= new Canvas width + 2 * page_margin, height + 2 * page_margin, Mode
  ctx = canvas.getContext('2d')
  ctx.textDrawingMode = 'glyph' if Mode == 'pdf'

  try
    CurrentPage = page =
      left_margin: page_margin
      top_margin: page_margin
      width: canvas.width
      height: canvas.height
      context: ctx

    erase_background()

    with_graphics_context (ctx) ->
      ctx.translate page_margin, page_margin
      CurrentBook?.header? page
      CurrentBook?.footer? page
      draw_page page

    switch Mode
      when 'pdf' then ctx.addPage()
      else
        filename = "#{DefaultFilename or 'test'}.png"
        fs.writeFile BuildDirectory + filename, canvas.toBuffer()
        console.info "Saved #{filename}"
  finally
    CurrentPage = null


with_grid = (options, cb) ->
  defaults = {gutter_width: 10, gutter_height: 10, header_height: 0}
  {cols, rows, cell_width, cell_height, header_height, gutter_width, gutter_height} = options = _.extend defaults, options
  options.width ||= cols * cell_width + (cols - 1) * gutter_width
  options.height ||=  header_height + rows * cell_height + (rows - 1) * gutter_height
  overflow = []
  with_page options, (page) ->
    cb
      context: page.context
      rows: rows
      cols: cols
      row: 0
      col: 0
      add_cell: (draw_fn) ->
        [col, row] = [@col, @row]
        if row >= rows
          overflow.push {col, row, draw_fn}
        else
          with_graphics_context (ctx) ->
            ctx.translate col * (cell_width + gutter_width), header_height + row * (cell_height + gutter_height)
            draw_fn()
        [col, row] = [col + 1, row]
        [col, row] = [0, row + 1] if col >= @cols
        [@col, @row] = [col, row]
      start_row: ->
        [@col, @row] = [0, @row + 1] if @col > 0
  while overflow.length
    cell.row -= rows for cell in overflow
    with_page options, (page) ->
      for {col, row, draw_fn} in _.select(overflow, (cell) -> cell.row < rows)
        with_graphics_context (ctx) ->
          ctx.translate col * (cell_width + gutter_width), header_height + row * (cell_height + gutter_height)
          draw_fn()
    overflow = (cell for cell in overflow when cell.row >= rows)

with_book = (filename, options, cb) ->
  throw new Error "Already inside book" if CurrentBook
  [options, cb] = [{}, options] if _.isFunction(options)
  page_limit = options.pages
  page_count = 0
  page_header = null
  try
    Mode = 'pdf'
    CurrentBook = book = {}
    cb
      page_header: (header) -> book.header = header
      page_footer: (footer) -> book.footer = footer
      with_page: (options, draw_page) ->
        [options, draw_page] = [{}, options] if _.isFunction(options)
        return if @done
        page_count += 1
        if CurrentPage
          draw_page()
        else
          with_page options, draw_page
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
  finally
    canvas = null
    ctx = null
    CurrentBook = null
    Mode = null

module.exports = {
  with_book
  with_grid
  with_page
  draw_text
  measure_text
  directory
  filename
  with_graphics_context
}
