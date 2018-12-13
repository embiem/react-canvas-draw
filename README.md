# React Canvas Draw

[![Travis][build-badge]][build]

[![npm package][npm-badge]][npm]

[![Coveralls][coveralls-badge]][coveralls]

> A simple yet powerful canvas-drawing component for React ([Demo](https://embiem.github.io/react-canvas-draw/)).

[![Edit 6lv410914w](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/6lv410914w)

## Installation

Install via NPM:

```
npm install react-canvas-draw --save
```

or YARN:

```
yarn add react-canvas-draw
```

## Usage

```javascript
import React from "react";
import ReactDOM from "react-dom";
import CanvasDraw from "react-canvas-draw";

ReactDOM.render(<CanvasDraw />, document.getElementById("root"));
```

For more examples, like saving and loading a drawing ==> look into the [`/demo/src` folder](https://github.com/embiem/react-canvas-draw/tree/master/demo/src).

### Props

These are the defaultProps of CanvasDraw. You can pass along any of these props to customize the CanvasDraw component. Examples of how to use the props are also shown in the [`/demo/src` folder](https://github.com/embiem/react-canvas-draw/tree/master/demo/src).

```javascript
  static defaultProps = {
    loadTimeOffset: 5,
    lazyRadius: 30,
    brushRadius: 12,
    brushColor: "#444",
    catenaryColor: "#0a0302",
    gridColor: "rgba(150,150,150,0.17)",
    hideGrid: false,
    canvasWidth: 400,
    canvasHeight: 400,
    disabled: false,
    imgSrc: "",
    saveData: null,
    immediateLoading: false
  };
```

### Functions

Useful functions that you can call, e.g. when having a reference to this component:

- `getSaveData()` returns the drawing's save-data as a stringified object
- `loadSaveData(saveData: String, immediate: Boolean)` loads a previously saved drawing using the saveData string, as well as an optional boolean flag to load it immediately, instead of live-drawing it.
- `clear()` clears the canvas completely
- `undo()` removes the latest change to the drawing. This includes everything drawn since the last MouseDown event.

## Local Development

This repo was kickstarted by nwb's awesome [react-component starter](https://github.com/insin/nwb/blob/master/docs/guides/ReactComponents.md#developing-react-components-and-libraries-with-nwb).

You just need to clone it, yarn it & start it!

## Tips

If you want to save large strings, like the stringified JSON of a drawing, I recommend you to use [pieroxy/lz-string](https://github.com/pieroxy/lz-string) for compression. It's LZ compression will bring down your long strings to only ~10% of it's original size.

## Acknowledgement

The [lazy-brush](https://github.com/dulnan/lazy-brush) project as well as its demo app by [dulnan](https://github.com/dulnan) have been a heavy influence.

I borrowed a lot of the logic and actually used lazy-brush during the push to v1 of react-canvas-draw. Without it, react-canvas-draw would most likely still be pre v1 and wouldn't feel as good.

## License

MIT, see [LICENSE](https://github.com/embiem/react-canvas-draw/blob/master/LICENSE) for details.

[build-badge]: https://img.shields.io/travis/embiem/react-canvas-draw/master.png?style=flat-square
[build]: https://travis-ci.org/embiem/react-canvas-draw
[npm-badge]: https://img.shields.io/npm/v/react-canvas-draw.png?style=flat-square
[npm]: https://www.npmjs.org/package/react-canvas-draw
[coveralls-badge]: https://img.shields.io/coveralls/embiem/react-canvas-draw/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/embiem/react-canvas-draw
