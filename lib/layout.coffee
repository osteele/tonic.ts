util = require 'util'
fs = require 'fs'
_ = require 'underscore'
Canvas = require 'canvas'


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
  ctx.measureText text

draw_text = (text, options={}) ->
  options = text if _.isObject text
  {font, fillStyle, x, y, gravity, width} = options
  gravity ||= ''
  if options.choices
    for choice in options.choices
      text = choice if _.isString choice
      {font} = choice if _.isObject choice
      break if measure_text(text, font: font).width <= options.width
  ctx.font = font if font
  ctx.fillStyle = fillStyle if fillStyle
  m = ctx.measureText text
  x ||= 0
  y ||= 0
  x -= m.width / 2 if gravity.match(/^(top|center|middle|centerbottom)$/i)
  x -= m.width if gravity.match(/^(right|topRight|botRight)$/i)
  y -= m.emHeightDescent if gravity.match(/^(bottom|botLeft|botRight)$/i)
  y += m.emHeightAscent if gravity.match(/^(top|topLeft|topRight)$/i)
  ctx.fillText text, x, y

with_graphics_context = (fn) ->
  ctx.save()
  try
    fn ctx
  finally
    ctx.restore()

with_alignment = (options, cb) ->
  align = options.align
  bounds = options.measured
  return cb() unless align
  with_graphics_context (ctx) ->
    dx = dy = 0
    measured_height = bounds.bottom - bounds.top
    dx = align.x - bounds.left if align.x?
    dy = align.y - bounds.bottom if align.y?
    ctx.translate dx, dy
    cb()
    if bounds
      bounds = _.extend {}, bounds
      bounds.left += dx
      bounds.right += dx
      bounds.top += dy
      bounds.bottom += dy
  return bounds


#
# Block-based Declarative Layout
#

block = (options) -> options

pad_block = (block, options) ->
  block.height += options.bottom if options.bottom
  block.descent = ((block.descent ? 0) + options.bottom) if options.bottom
  block

text_block = (text, options) ->
  options = _.extend {}, options, gravity: false
  measure = measure_text text, options
  block
    width: measure.width
    height: measure.emHeightAscent + measure.emHeightDescent
    descent: measure.emHeightDescent
    draw: -> draw_text text, options

above = (b1, b2) ->
  width = Math.max b1.width, b2.width
  block
    width: width
    height: b1.height + b2.height
    draw: ->
      with_graphics_context (ctx) ->
        ctx.translate (width - b1.width) / 2, b1.height - (b1.descent ? 0)
        b1.draw()
      with_graphics_context (ctx) ->
        ctx.translate (width - b2.width) / 2, b1.height + b2.height - (b2.descent ? 0)
        b2.draw()

labeled = (text, block) ->
  options =
    font: '12px Times'
    fillStyle: 'black'
  above text_block(text, options), block

with_grid_blocks = (options, generator) ->
  options = _.extend {header_height: 0, gutter_width: 10, gutter_height: 10}, options

  header = null
  cells = []
  generator
    header: (block) -> header = block
    start_row: () -> cells.push {width: 0, height: 0, linebreak: true, draw: ->}
    add_cell: (block) -> cells.push block

  max_width = Math.max _.pluck(cells, 'width')...
  max_height = Math.max _.pluck(cells, 'height')...

  _.extend options
    , header_height: header.height
    , cell_width: max_width
    , cell_height: max_height
    , cols: Math.max 1, Math.floor(options.paper_size.width / (max_width + options.gutter_width))
    # , rows: Math.max 1, Math.floor((options.paper_size.height - options.header_height) / (max_height + options.gutter_height))

  with_grid options, (grid) ->
    if header
      with_graphics_context (ctx) ->
        ctx.translate 0, header.height - (header.descent ? 0)
        header?.draw()
    cells.forEach (block) ->
      grid.start_row() if block.linebreak?
      unless block.linebreak?
        grid.add_cell -> block.draw()


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
# Paper Sizes
#

PaperSizes =
  folio: '12in x 15in'
  quarto: '9.5in x 12in'
  octavo: '6in x 9in'
  duodecimo: '5in x 7.375in'
  # ANSI sizes
  'ANSI A': '8.5in × 11in'
  'ANSI B': '11in x 17in'
  letter: 'ANSI A'
  ledger: 'ANSI B landscape'
  tabloid: 'ANSI B portrait'
  'ANSI C': '17in × 22in'
  'ANSI D': '22in × 34in'
  'ANSI E': '34in × 44in'

get_page_size_dimensions = (size, orientation=null) ->
  parseMeasure = (measure) ->
    return measure if typeof measure == 'number'
    unless measure.match /^(\d+(?:\.\d*)?)\s*(.+)$/
      throw new Error "Unrecognized measure #{util.inspect measure} in #{util.inspect size}"
    [n, units] = [Number(RegExp.$1), RegExp.$2]
    switch units
      when "" then n
      when "in" then n * 72
      else throw new Error "Unrecognized units #{util.inspect units} in #{util.inspect size}"

  {width, height} = size
  while _.isString(size)
    [size, orientation] = [RegExp.$1, RegExp.R2] if size.match /^(.+)\s+(landscape|portrait)$/
    break unless size of PaperSizes
    size = PaperSizes[size]
    {width, height} = size
  if _.isString(size)
    throw new Error "Unrecognized book size format #{util.inspect size}" unless size.match /^(.+?)\s*[x×]\s*(.+)$/
    [width, height] = [RegExp.$1, RegExp.$2]

  [width, height] = [parseMeasure(width), parseMeasure(height)]
  switch orientation or ''
    when 'landscape' then [width, height] = [height, width] unless width > height
    when 'portrait' then [width, height] = [height, width] if width > height
    when '' then null
    else throw new Error "Unknown orientation #{util.inspect orientation}"
  {width, height}

do ->
  for name, value of PaperSizes
    PaperSizes[name] = get_page_size_dimensions value


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
  ctx = canvas.getContext '2d'
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
  options = _.extend defaults, options
  {cols, rows, cell_width, cell_height, header_height, gutter_width, gutter_height} = options
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
        col += 1
        [col, row] = [0, row + 1] if col >= cols
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
    CurrentBook = book =
      page_options: {}
    size = options.size
    if size
      {width, height} = get_page_size_dimensions size
      _.extend book.page_options, {width, height}
      canvas ||= new Canvas width, height, Mode
      ctx = canvas.getContext '2d'
      ctx.textDrawingMode = 'glyph' if Mode == 'pdf'
    cb
      page_header: (header) -> book.header = header
      page_footer: (footer) -> book.footer = footer
      with_page: (options, draw_page) ->
        [options, draw_page] = [{}, options] if _.isFunction(options)
        return if @done
        options = _.extend {}, book.page_options, options
        page_count += 1
        if CurrentPage
          draw_page CurrentPage
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
  PaperSizes
  with_book
  with_grid
  with_grid_blocks
  with_page
  draw_text
  block
  pad_block
  labeled
  measure_text
  directory
  filename
  with_alignment
  with_graphics_context
}
