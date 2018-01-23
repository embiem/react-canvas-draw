# React Canvas Draw

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

**WIP**

I decided against a controlled component for better performance.
The `/demo` folder contains examples, e.g. how customize everything or implement loading & saving.

## Ideas / TODOs

* testing. Especially save, load, clear and drawing

* canvas customization to only display drawings, by passing along the linesArray and settings a props "editDisabled" to true. Combined with the draw-load animation this might be very interesting.

* modular brushes to build up a brush library. all brushes should implement their own draw function.

# Actual README begins here [WIP]

Draw anything! A simple but powerful canvas component for React (Demo).

*A small gif to show it off*

## Installation

Install via NPM:
```
npm install react-canvas-draw --save
```
or YARN:
```
yarn add react-canvas-draw
```

No additional dependencies needed.


## Usage

*most basic default usage*

*customization options (color, width, general styles)*

*onChange callback, getSaveData func as well as loadSaveData func*

*use the mentioned funcs in a save/load example*

## Contributing Development

*basic nwb setup, explain folder structure*

*contribution rules in CONTRIBUTION.md (look for github guidelines)*

## License

MIT, see LICENSE.md for details.


[build-badge]: https://img.shields.io/travis/mBeierl/react-canvas-draw/master.png?style=flat-square
[build]: https://travis-ci.org/mBeierl/react-canvas-draw

[npm-badge]: https://img.shields.io/npm/v/react-canvas-draw.png?style=flat-square
[npm]: https://www.npmjs.org/package/react-canvas-draw

[coveralls-badge]: https://img.shields.io/coveralls/mBeierl/react-canvas-draw/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/mBeierl/react-canvas-draw
