import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { LazyBrush } from "lazy-brush";
import { Catenary } from "catenary-curve";

import ResizeObserver from "resize-observer-polyfill";

import CoordinateSystem, { IDENTITY } from "./coordinateSystem";
import drawImage from "./drawImage";
import { DefaultState } from "./interactionStateMachine";
import makePassiveEventOption from "./makePassiveEventOption";

function midPointBtw(p1, p2) {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2,
  };
}

const canvasStyle = {
  display: "block",
  position: "absolute",
};

// The order of these is important: grid > drawing > temp > interface
const canvasTypes = ["grid", "drawing", "temp", "interface"];

const dimensionsPropTypes = PropTypes.oneOfType([
  PropTypes.number,
  PropTypes.string,
]);

const boundsProp = PropTypes.shape({
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
});

export default class CanvasDraw extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func,
    loadTimeOffset: PropTypes.number,
    lazyRadius: PropTypes.number,
    brushRadius: PropTypes.number,
    brushColor: PropTypes.string,
    catenaryColor: PropTypes.string,
    gridColor: PropTypes.string,
    backgroundColor: PropTypes.string,
    hideGrid: PropTypes.bool,
    canvasWidth: dimensionsPropTypes,
    canvasHeight: dimensionsPropTypes,
    disabled: PropTypes.bool,
    imgSrc: PropTypes.string,
    saveData: PropTypes.string,
    immediateLoading: PropTypes.bool,
    hideInterface: PropTypes.bool,
    gridSizeX: PropTypes.number,
    gridSizeY: PropTypes.number,
    gridLineWidth: PropTypes.number,
    hideGridX: PropTypes.bool,
    hideGridY: PropTypes.bool,
    enablePanAndZoom: PropTypes.bool,
    mouseZoomFactor: PropTypes.number,
    zoomExtents: boundsProp,
    clampLinesToDocument: PropTypes.bool,
  };

  static defaultProps = {
    onChange: null,
    loadTimeOffset: 5,
    lazyRadius: 12,
    brushRadius: 10,
    brushColor: "#444",
    catenaryColor: "#0a0302",
    gridColor: "rgba(150,150,150,0.17)",
    backgroundColor: "#FFF",
    hideGrid: false,
    canvasWidth: 400,
    canvasHeight: 400,
    disabled: false,
    imgSrc: "",
    saveData: "",
    immediateLoading: false,
    hideInterface: false,
    gridSizeX: 25,
    gridSizeY: 25,
    gridLineWidth: 0.5,
    hideGridX: false,
    hideGridY: false,
    enablePanAndZoom: false,
    mouseZoomFactor: 0.01,
    zoomExtents: { min: 0.33, max: 3 },
    clampLinesToDocument: false,
  };

  ///// public API /////////////////////////////////////////////////////////////

  constructor(props) {
    super(props);

    this.canvas = {};
    this.ctx = {};

    this.catenary = new Catenary();

    this.points = [];
    this.lines = [];
    this.erasedLines = [];

    this.mouseHasMoved = true;
    this.valuesChanged = true;
    this.isDrawing = false;
    this.isPressing = false;
    this.deferRedrawOnViewChange = false;

    this.interactionSM = new DefaultState();
    this.coordSystem = new CoordinateSystem({
      scaleExtents: props.zoomExtents,
      documentSize: { width: props.canvasWidth, height: props.canvasHeight },
    });
    this.coordSystem.attachViewChangeListener(this.applyView.bind(this));
  }

  undo = () => {
    let lines = [];
    if (this.lines.length) {
      lines = this.lines.slice(0, -1);
    } else if (this.erasedLines.length) {
      lines = this.erasedLines.pop();
    }
    this.clearExceptErasedLines();
    this.simulateDrawingLines({ lines, immediate: true });
    this.triggerOnChange();
  };

  eraseAll = () => {
    this.erasedLines.push([...this.lines]);
    this.clearExceptErasedLines();
    this.triggerOnChange();
  };

  clear = () => {
    this.erasedLines = [];
    this.clearExceptErasedLines();
    this.resetView();
  };

  resetView = () => {
    return this.coordSystem.resetView();
  };

  setView = (view) => {
    return this.coordSystem.setView(view);
  };

  getSaveData = () => {
    // Construct and return the stringified saveData object
    return JSON.stringify({
      lines: this.lines,
      width: this.props.canvasWidth,
      height: this.props.canvasHeight,
    });
  };

  /**
   * Combination of work by Ernie Arrowsmith and emizz
   * References:
   * https://stackoverflow.com/questions/32160098/change-html-canvas-black-background-to-white-background-when-creating-jpg-image
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL

   * This function will export the canvas to a data URL, which can subsequently be used to share or manipulate the image file.
   * @param {string} fileType Specifies the file format to export to. Note: should only be the file type, not the "image/" prefix.
   *  For supported types see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
   * @param {bool} useBgImage Specifies whether the canvas' current background image should also be exported. Default is false.
   * @param {string} backgroundColour The desired background colour hex code, e.g. "#ffffff" for white.
   */
  getDataURL = (fileType, useBgImage, backgroundColour) => {
    // Get a reference to the "drawing" layer of the canvas
    let canvasToExport = this.canvas.drawing;

    let context = canvasToExport.getContext("2d");

    //cache height and width
    let width = canvasToExport.width;
    let height = canvasToExport.height;

    //get the current ImageData for the canvas
    let storedImageData = context.getImageData(0, 0, width, height);

    //store the current globalCompositeOperation
    var compositeOperation = context.globalCompositeOperation;

    //set to draw behind current content
    context.globalCompositeOperation = "destination-over";

    // If "useBgImage" has been set to true, this takes precedence over the background colour parameter
    if (useBgImage) {
      if (!this.props.imgSrc) return "Background image source not set";

      // Write the background image
      this.drawImage();
    } else if (backgroundColour != null) {
      //set background color
      context.fillStyle = backgroundColour;

      //fill entire canvas with background colour
      context.fillRect(0, 0, width, height);
    }

    // If the file type has not been specified, default to PNG
    if (!fileType) fileType = "png";

    // Export the canvas to data URL
    let imageData = canvasToExport.toDataURL(`image/${fileType}`);

    //clear the canvas
    context.clearRect(0, 0, width, height);

    //restore it with original / cached ImageData
    context.putImageData(storedImageData, 0, 0);

    //reset the globalCompositeOperation to what it was
    context.globalCompositeOperation = compositeOperation;

    return imageData;
  };

  loadSaveData = (saveData, immediate = this.props.immediateLoading) => {
    if (typeof saveData !== "string") {
      throw new Error("saveData needs to be of type string!");
    }

    const { lines, width, height } = JSON.parse(saveData);

    if (!lines || typeof lines.push !== "function") {
      throw new Error("saveData.lines needs to be an array!");
    }

    this.clear();

    if (
      width === this.props.canvasWidth &&
      height === this.props.canvasHeight
    ) {
      this.simulateDrawingLines({
        lines,
        immediate,
      });
    } else {
      // we need to rescale the lines based on saved & current dimensions
      const scaleX = this.props.canvasWidth / width;
      const scaleY = this.props.canvasHeight / height;
      const scaleAvg = (scaleX + scaleY) / 2;

      this.simulateDrawingLines({
        lines: lines.map((line) => ({
          ...line,
          points: line.points.map((p) => ({
            x: p.x * scaleX,
            y: p.y * scaleY,
          })),
          brushRadius: line.brushRadius * scaleAvg,
        })),
        immediate,
      });
    }
  };

  ///// private API ////////////////////////////////////////////////////////////

  ///// React Lifecycle

  componentDidMount() {
    this.lazy = new LazyBrush({
      radius: this.props.lazyRadius * window.devicePixelRatio,
      enabled: true,
      initialPoint: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      },
    });
    this.chainLength = this.props.lazyRadius * window.devicePixelRatio;

    this.canvasObserver = new ResizeObserver((entries, observer) =>
      this.handleCanvasResize(entries, observer)
    );
    this.canvasObserver.observe(this.canvasContainer);

    this.drawImage();
    this.loop();

    window.setTimeout(() => {
      const initX = window.innerWidth / 2;
      const initY = window.innerHeight / 2;
      this.lazy.update(
        { x: initX - this.chainLength / 4, y: initY },
        { both: true }
      );
      this.lazy.update(
        { x: initX + this.chainLength / 4, y: initY },
        { both: false }
      );
      this.mouseHasMoved = true;
      this.valuesChanged = true;
      this.clearExceptErasedLines();

      // Load saveData from prop if it exists
      if (this.props.saveData) {
        this.loadSaveData(this.props.saveData);
      }
    }, 100);

    // Attach our wheel event listener here instead of in the render so that we can specify a non-passive listener.
    // This is necessary to prevent the default event action on chrome.
    // https://github.com/facebook/react/issues/14856
    this.canvas.interface &&
      this.canvas.interface.addEventListener(
        "wheel",
        this.handleWheel,
        makePassiveEventOption()
      );
  }

  componentDidUpdate(prevProps) {
    if (prevProps.lazyRadius !== this.props.lazyRadius) {
      // Set new lazyRadius values
      this.chainLength = this.props.lazyRadius * window.devicePixelRatio;
      this.lazy.setRadius(this.props.lazyRadius * window.devicePixelRatio);
    }

    if (prevProps.saveData !== this.props.saveData) {
      this.loadSaveData(this.props.saveData);
    }

    if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
      // Signal this.loop function that values changed
      this.valuesChanged = true;
    }

    this.coordSystem.scaleExtents = this.props.zoomExtents;
    if (!this.props.enablePanAndZoom) {
      this.coordSystem.resetView();
    }

    if (prevProps.imgSrc !== this.props.imgSrc) {
      this.drawImage();
    }
  }

  componentWillUnmount = () => {
    this.canvasObserver.unobserve(this.canvasContainer);
    this.canvas.interface &&
      this.canvas.interface.removeEventListener("wheel", this.handleWheel);
  };

  render() {
    return (
      <div
        className={this.props.className}
        style={{
          display: "block",
          background: this.props.backgroundColor,
          touchAction: "none",
          width: this.props.canvasWidth,
          height: this.props.canvasHeight,
          ...this.props.style,
        }}
        ref={(container) => {
          if (container) {
            this.canvasContainer = container;
          }
        }}
      >
        {canvasTypes.map((name) => {
          const isInterface = name === "interface";
          return (
            <canvas
              key={name}
              ref={(canvas) => {
                if (canvas) {
                  this.canvas[name] = canvas;
                  this.ctx[name] = canvas.getContext("2d");
                  if (isInterface) {
                    this.coordSystem.canvas = canvas;
                  }
                }
              }}
              style={{ ...canvasStyle }}
              onMouseDown={isInterface ? this.handleDrawStart : undefined}
              onMouseMove={isInterface ? this.handleDrawMove : undefined}
              onMouseUp={isInterface ? this.handleDrawEnd : undefined}
              onMouseOut={isInterface ? this.handleDrawEnd : undefined}
              onTouchStart={isInterface ? this.handleDrawStart : undefined}
              onTouchMove={isInterface ? this.handleDrawMove : undefined}
              onTouchEnd={isInterface ? this.handleDrawEnd : undefined}
              onTouchCancel={isInterface ? this.handleDrawEnd : undefined}
            />
          );
        })}
      </div>
    );
  }

  ///// Event Handlers

  handleWheel = (e) => {
    this.interactionSM = this.interactionSM.handleMouseWheel(e, this);
  };

  handleDrawStart = (e) => {
    this.interactionSM = this.interactionSM.handleDrawStart(e, this);
    this.mouseHasMoved = true;
  };

  handleDrawMove = (e) => {
    this.interactionSM = this.interactionSM.handleDrawMove(e, this);
    this.mouseHasMoved = true;
  };

  handleDrawEnd = (e) => {
    this.interactionSM = this.interactionSM.handleDrawEnd(e, this);
    this.mouseHasMoved = true;
  };

  applyView = () => {
    if (!this.ctx.drawing) {
      return;
    }

    canvasTypes
      .map((name) => this.ctx[name])
      .forEach((ctx) => {
        this.clearWindow(ctx);
        const m = this.coordSystem.transformMatrix;
        ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
      });

    if (!this.deferRedrawOnViewChange) {
      this.drawGrid(this.ctx.grid);
      this.redrawImage();
      this.loop({ once: true });

      const lines = this.lines;
      this.lines = [];
      this.simulateDrawingLines({ lines, immediate: true });
    }
  };

  handleCanvasResize = (entries) => {
    const saveData = this.getSaveData();
    this.deferRedrawOnViewChange = true;
    try {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.setCanvasSize(this.canvas.interface, width, height);
        this.setCanvasSize(this.canvas.drawing, width, height);
        this.setCanvasSize(this.canvas.temp, width, height);
        this.setCanvasSize(this.canvas.grid, width, height);

        this.coordSystem.documentSize = { width, height };
        this.drawGrid(this.ctx.grid);
        this.drawImage();
        this.loop({ once: true });
      }
      this.loadSaveData(saveData, true);
    } finally {
      this.deferRedrawOnViewChange = false;
    }
  };

  ///// Helpers

  clampPointToDocument = (point) => {
    if (this.props.clampLinesToDocument) {
      return {
        x: Math.max(Math.min(point.x, this.props.canvasWidth), 0),
        y: Math.max(Math.min(point.y, this.props.canvasHeight), 0),
      };
    } else {
      return point;
    }
  };

  redrawImage = () => {
    this.image &&
      this.image.complete &&
      drawImage({ ctx: this.ctx.grid, img: this.image });
  };

  simulateDrawingLines = ({ lines, immediate }) => {
    // Simulate live-drawing of the loaded lines
    // TODO use a generator
    let curTime = 0;
    let timeoutGap = immediate ? 0 : this.props.loadTimeOffset;

    lines.forEach((line) => {
      const { points, brushColor, brushRadius } = line;

      // Draw all at once if immediate flag is set, instead of using setTimeout
      if (immediate) {
        // Draw the points
        this.drawPoints({
          points,
          brushColor,
          brushRadius,
        });

        // Save line with the drawn points
        this.points = points;
        this.saveLine({ brushColor, brushRadius });
        return;
      }

      // Use timeout to draw
      for (let i = 1; i < points.length; i++) {
        curTime += timeoutGap;
        window.setTimeout(() => {
          this.drawPoints({
            points: points.slice(0, i + 1),
            brushColor,
            brushRadius,
          });
        }, curTime);
      }

      curTime += timeoutGap;
      window.setTimeout(() => {
        // Save this line with its props instead of this.props
        this.points = points;
        this.saveLine({ brushColor, brushRadius });
      }, curTime);
    });
  };

  setCanvasSize = (canvas, width, height) => {
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width;
    canvas.style.height = height;
  };

  drawPoints = ({ points, brushColor, brushRadius }) => {
    this.ctx.temp.lineJoin = "round";
    this.ctx.temp.lineCap = "round";
    this.ctx.temp.strokeStyle = brushColor;

    this.clearWindow(this.ctx.temp);
    this.ctx.temp.lineWidth = brushRadius * 2;

    let p1 = points[0];
    let p2 = points[1];

    this.ctx.temp.moveTo(p2.x, p2.y);
    this.ctx.temp.beginPath();

    for (var i = 1, len = points.length; i < len; i++) {
      // we pick the point between pi+1 & pi+2 as the
      // end point and p1 as our control point
      var midPoint = midPointBtw(p1, p2);
      this.ctx.temp.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
      p1 = points[i];
      p2 = points[i + 1];
    }
    // Draw last line as a straight line while
    // we wait for the next point to be able to calculate
    // the bezier control point
    this.ctx.temp.lineTo(p1.x, p1.y);
    this.ctx.temp.stroke();
  };

  saveLine = ({ brushColor, brushRadius } = {}) => {
    if (this.points.length < 2) return;

    // Save as new line
    this.lines.push({
      points: [...this.points],
      brushColor: brushColor || this.props.brushColor,
      brushRadius: brushRadius || this.props.brushRadius,
    });

    // Reset points array
    this.points.length = 0;

    // Copy the line to the drawing canvas
    this.inClientSpace([this.ctx.drawing, this.ctx.temp], () => {
      this.ctx.drawing.drawImage(
        this.canvas.temp,
        0,
        0,
        this.canvas.drawing.width,
        this.canvas.drawing.height
      );
    });

    // Clear the temporary line-drawing canvas
    this.clearWindow(this.ctx.temp);

    this.triggerOnChange();
  };

  triggerOnChange = () => {
    this.props.onChange && this.props.onChange(this);
  };

  clearWindow = (ctx) => {
    this.inClientSpace([ctx], () =>
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    );
  };

  clearExceptErasedLines = () => {
    this.lines = [];
    this.valuesChanged = true;
    this.clearWindow(this.ctx.drawing);
    this.clearWindow(this.ctx.temp);
  };

  loop = ({ once = false } = {}) => {
    if (this.mouseHasMoved || this.valuesChanged) {
      const pointer = this.lazy.getPointerCoordinates();
      const brush = this.lazy.getBrushCoordinates();

      this.drawInterface(this.ctx.interface, pointer, brush);
      this.mouseHasMoved = false;
      this.valuesChanged = false;
    }

    if (!once) {
      window.requestAnimationFrame(() => {
        this.loop();
      });
    }
  };

  inClientSpace = (ctxs, action) => {
    ctxs.forEach((ctx) => {
      ctx.save();
      ctx.setTransform(
        IDENTITY.a,
        IDENTITY.b,
        IDENTITY.c,
        IDENTITY.d,
        IDENTITY.e,
        IDENTITY.f
      );
    });

    try {
      action();
    } finally {
      ctxs.forEach((ctx) => ctx.restore());
    }
  };

  ///// Canvas Rendering

  drawImage = () => {
    if (!this.props.imgSrc) return;

    // Load the image
    this.image = new Image();

    // Prevent SecurityError "Tainted canvases may not be exported." #70
    this.image.crossOrigin = "anonymous";

    // Draw the image once loaded
    this.image.onload = this.redrawImage;
    this.image.src = this.props.imgSrc;
  };

  drawGrid = (ctx) => {
    if (this.props.hideGrid) return;

    this.clearWindow(ctx);

    const gridSize = 25;
    const { viewMin, viewMax } = this.coordSystem.canvasBounds;
    const minx = Math.floor(viewMin.x / gridSize - 1) * gridSize;
    const miny = Math.floor(viewMin.y / gridSize - 1) * gridSize;
    const maxx = viewMax.x + gridSize;
    const maxy = viewMax.y + gridSize;

    ctx.beginPath();
    ctx.setLineDash([5, 1]);
    ctx.setLineDash([]);
    ctx.strokeStyle = this.props.gridColor;
    ctx.lineWidth = this.props.gridLineWidth;

    if (!this.props.hideGridX) {
      let countX = minx;
      const gridSizeX = this.props.gridSizeX;
      while (countX < maxx) {
        countX += gridSizeX;
        ctx.moveTo(countX, miny);
        ctx.lineTo(countX, maxy);
      }
      ctx.stroke();
    }

    if (!this.props.hideGridY) {
      let countY = miny;
      const gridSizeY = this.props.gridSizeY;
      while (countY < maxy) {
        countY += gridSizeY;
        ctx.moveTo(minx, countY);
        ctx.lineTo(maxx, countY);
      }
      ctx.stroke();
    }
  };

  drawInterface = (ctx, pointer, brush) => {
    if (this.props.hideInterface) return;

    this.clearWindow(ctx);

    // Draw brush preview
    ctx.beginPath();
    ctx.fillStyle = this.props.brushColor;
    ctx.arc(brush.x, brush.y, this.props.brushRadius, 0, Math.PI * 2, true);
    ctx.fill();

    // Draw mouse point (the one directly at the cursor)
    ctx.beginPath();
    ctx.fillStyle = this.props.catenaryColor;
    ctx.arc(pointer.x, pointer.y, 4, 0, Math.PI * 2, true);
    ctx.fill();

    // Draw catenary
    if (this.lazy.isEnabled()) {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = this.props.catenaryColor;
      this.catenary.drawToCanvas(
        this.ctx.interface,
        brush,
        pointer,
        this.chainLength
      );
      ctx.stroke();
    }

    // Draw brush point (the one in the middle of the brush preview)
    ctx.beginPath();
    ctx.fillStyle = this.props.catenaryColor;
    ctx.arc(brush.x, brush.y, 2, 0, Math.PI * 2, true);
    ctx.fill();
  };
}
