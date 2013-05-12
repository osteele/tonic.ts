# Overview

This is a side project to generate various fretboard and fretboard diagrams that I'm using to learn guitar.

This isn't intended to be useful to anyone but me in its current form, but it's slowly evolving towards a library of reusable functions since I like to code that way.

Shoot me a note if you use this or would like to, and I'll use that to guide what to make or keep stable.


# Installation

To install `node-canvas` on Mac, I needed the `PKG_CONFIG_PATH` setting below.
Note that `cairo.pc` is also present in `/usr/local/Cellar/cairo/1.12.14/lib/pkgconfig/cairo`; setting `PKG_CONFIG_PATH` to this directory did *not* work for me.
Given this, I don't know whether `brew install cairo` is actually necessary.

    brew install node cairo
    PKG_CONFIG_PATH=/opt/X11/lib/pkgconfig npm install
npm install canvas


# Usage

I keep modifying `intervals.coffee` to generate whatever output I'm working on at the moment.

Edit the bottom of that file, and run `coffee intervals.coffee` to create a file in the `build` directory.


# License

MIT and BSD, of course.
