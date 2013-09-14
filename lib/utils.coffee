Function::define ||= (name, desc) ->
  Object.defineProperty @prototype, name, desc

Function::cached_getter ||= (name, fn) ->
  Object.defineProperty @prototype, name, get: ->
    cache = @_getter_cache ||= {}
    return cache[name] if name of cache
    cache[name] = fn.call(this)

hsv2rgb = ({h, s, v}) ->
  h /= 360
  c = v * s
  x = c * (1 - Math.abs((h * 6) % 2 - 1))
  components = switch Math.floor(h * 6) % 6
    when 0 then [c, x, 0]
    when 1 then [x, c, 0]
    when 2 then [0, c, x]
    when 3 then [0, x, c]
    when 4 then [x, 0, c]
    when 5 then [c, 0, x]
  [r, g, b] = (component + v - c for component in components)
  {r, g, b}

rgb2css = ({r, g, b}) ->
  [r, g, b] = (Math.floor(255 * c) for c in [r, g, b])
  "rgb(#{r}, #{g}, #{b})"

hsv2css = (hsv) -> rgb2css hsv2rgb(hsv)

module.exports = {
  hsv2css
  hsv2rgb
  rgb2css
}
