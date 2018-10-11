# React Canvas Draw

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

> A simple yet powerful canvas-drawing component for React ([Demo](https://mbeierl.github.io/react-canvas-draw/)).

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

```javascript
import React from "react";
import ReactDOM from "react-dom";
import CanvasDraw from "react-canvas-draw";

ReactDOM.render(
  <CanvasDraw />,
  document.getElementById('root')
);
```

For more examples, like saving and loading a drawing ==> look into the [`/demo/src` folder](https://github.com/mBeierl/react-canvas-draw/tree/master/demo/src).

Even more examples are coming, check back soon!

### Props

```javascript
static defaultProps = {
  loadTimeOffset: 5,
  brushSize: 6,
  brushColor: "#444",
  canvasWidth: 400,
  canvasHeight: 400,
  disabled: false,
  imgSrc: ""
};
```

### Functions

Useful functions that you can call, e.g. when having a reference to this component:

- `getSaveData()` returns the drawing's save-data as stringified JSON
- `loadSaveData(saveData: String, immediate: Boolean)` loads a previously saved drawing using the saveData string, as well as an optional boolean flag to load it immediately, instead of live-drawing it.
- `clear()` clears the canvas completely
- `undo()` removes the latest change to the drawing. This includes everything drawn since the last MouseDown event.
- `drawLine(line)` to draw a line. This can be useful if you want to automate drawing. The line parameter is an object of the following form:

```javascript
const line = {
  color: this.props.brushColor,
  size: this.props.brushSize,
  startX: this.x,
  startY: this.y,
  endX: newX,
  endY: newY
};
```

## Local Development

This repo was kickstarted by nwb's awesome [react-component starter](https://github.com/insin/nwb/blob/master/docs/guides/ReactComponents.md#developing-react-components-and-libraries-with-nwb).

You just need to clone it, yarn it & start it!

## Tips

If you want to save large strings, like the stringified JSON of a drawing, I recommend you to use [pieroxy/lz-string](https://github.com/pieroxy/lz-string) for compression. It's LZ compression will bring down your long strings to only ~10% of it's original size.

## License

MIT, see [LICENSE](https://github.com/mBeierl/react-canvas-draw/blob/master/LICENSE) for details.

[build-badge]: https://img.shields.io/travis/mBeierl/react-canvas-draw/master.png?style=flat-square
[build]: https://travis-ci.org/mBeierl/react-canvas-draw
[npm-badge]: https://img.shields.io/npm/v/react-canvas-draw.png?style=flat-square
[npm]: https://www.npmjs.org/package/react-canvas-draw
[coveralls-badge]: https://img.shields.io/coveralls/mBeierl/react-canvas-draw/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/mBeierl/react-canvas-draw
