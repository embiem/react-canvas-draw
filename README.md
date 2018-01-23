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

```
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

## Local Development

This repo was kickstarted by nwb's awesome [react-component starter](https://github.com/insin/nwb/blob/master/docs/guides/ReactComponents.md#developing-react-components-and-libraries-with-nwb).

You just need to clone it, yarn it & start it!

## License

MIT, see LICENSE.md for details.

[build-badge]: https://img.shields.io/travis/mBeierl/react-canvas-draw/master.png?style=flat-square
[build]: https://travis-ci.org/mBeierl/react-canvas-draw
[npm-badge]: https://img.shields.io/npm/v/react-canvas-draw.png?style=flat-square
[npm]: https://www.npmjs.org/package/react-canvas-draw
[coveralls-badge]: https://img.shields.io/coveralls/mBeierl/react-canvas-draw/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/mBeierl/react-canvas-draw
