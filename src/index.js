import React, { PureComponent } from "react";
import { LazyBrush } from "lazy-brush";
import { Catenary } from "catenary-curve";

import ResizeObserver from "resize-observer-polyfill";

import drawImage from "./drawImage";

const LAZY_RADIUS = 60;
const BRUSH_RADIUS = 12.5;

function midPointBtw(p1, p2) {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2
  };
}

const canvasStyle = {
  display: "block",
  position: "absolute"
};

const canvasTypes = [
  {
    name: "interface",
    zIndex: 15
  },
  {
    name: "drawing",
    zIndex: 10
  },
  {
    name: "temp",
    zIndex: 12
  },
  {
    name: "grid",
    zIndex: 14
  }
];

export default class extends PureComponent {
  static defaultProps = {
    loadTimeOffset: 5,
    brushSize: 6,
    brushColor: "#444",
    canvasWidth: 400,
    canvasHeight: 400,
    disabled: false,
    imgSrc: ""
  };

  constructor(props) {
    super(props);

    this.canvas = {};
    this.ctx = {};

    this.catenary = new Catenary();

    this.lazy = new LazyBrush({
      radius: LAZY_RADIUS,
      enabled: true,
      initialPoint: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      }
    });

    this.points = [];

    this.mouseHasMoved = true;
    this.valuesChanged = true;
    this.isDrawing = false;
    this.isPressing = false;

    this.brushRadius = BRUSH_RADIUS;
    this.chainLength = LAZY_RADIUS;

    this.dpi = 1;
  }

  componentDidMount() {
    const observeCanvas = new ResizeObserver((entries, observer) =>
      this.handleCanvasResize(entries, observer)
    );
    observeCanvas.observe(this.canvasContainer);

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
      this.clearCanvas();
    }, 100);
  }

  handleTouchStart = e => {
    const { x, y } = this.getPointerPos(e);
    this.lazy.update({ x: x, y: y }, { both: true });
    this.handleMouseDown(e);

    this.mouseHasMoved = true;
  };

  handleTouchMove = e => {
    e.preventDefault();
    const { x, y } = this.getPointerPos(e);
    this.handlePointerMove(x, y);
  };

  handleTouchEnd = e => {
    this.handleMouseUp(e);
    const brush = this.lazy.getBrushCoordinates();
    this.lazy.update({ x: brush.x, y: brush.y }, { both: true });
    this.mouseHasMoved = true;
  };

  handleMouseDown = e => {
    e.preventDefault();
    this.isPressing = true;
  };

  handleMouseMove = e => {
    const { x, y } = this.getPointerPos(e);
    this.handlePointerMove(x, y);
  };

  handleMouseUp = e => {
    e.preventDefault();
    this.isDrawing = false;
    this.isPressing = false;
    this.points.length = 0;

    const dpi = window.innerWidth > 1024 ? 1 : window.devicePixelRatio;
    const width = this.canvas.temp.width / dpi;
    const height = this.canvas.temp.height / dpi;

    this.ctx.drawing.drawImage(this.canvas.temp, 0, 0, width, height);
    this.ctx.temp.clearRect(0, 0, width, height);
  };

  handleContextMenu = e => {
    e.preventDefault();
    if (e.button === 2) {
      this.clearCanvas();
    }
  };

  handleCanvasResize = (entries, observer) => {
    this.dpi = window.devicePixelRatio;

    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      this.setCanvasSize(this.canvas.interface, width, height, 1.25);
      this.setCanvasSize(this.canvas.drawing, width, height, 1);
      this.setCanvasSize(this.canvas.temp, width, height, 1);
      this.setCanvasSize(this.canvas.grid, width, height, 2);

      this.drawGrid(this.ctx.grid);
      this.loop({ once: true });
    }
  };

  setCanvasSize = (canvas, width, height, maxDpi = 4) => {
    let dpi = this.dpi;

    // reduce canvas size for hidpi desktop screens
    if (window.innerWidth > 1024) {
      dpi = Math.min(this.dpi, maxDpi);
    }

    canvas.width = width * dpi;
    canvas.height = height * dpi;
    canvas.style.width = width;
    canvas.style.height = height;
    canvas.getContext("2d").scale(dpi, dpi);
  };

  getPointerPos = e => {
    const rect = this.canvas.interface.getBoundingClientRect();

    // use cursor pos as default
    let clientX = e.clientX;
    let clientY = e.clientY;

    // use first touch if available
    if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    }

    // return mouse/touch position inside canvas
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  handlePointerMove = (x, y) => {
    const hasChanged = this.lazy.update({ x, y });
    const isDisabled = !this.lazy.isEnabled();

    this.ctx.temp.lineJoin = "round";
    this.ctx.temp.lineCap = "round";
    this.ctx.temp.strokeStyle = this.props.brushColor;

    if (
      (this.isPressing && hasChanged && !this.isDrawing) ||
      (isDisabled && this.isPressing)
    ) {
      this.isDrawing = true;
      this.points.push(this.lazy.brush.toObject());
    }

    if (this.isDrawing && (this.lazy.brushHasMoved() || isDisabled)) {
      this.ctx.temp.clearRect(
        0,
        0,
        this.ctx.temp.canvas.width,
        this.ctx.temp.canvas.height
      );
      this.ctx.temp.lineWidth = this.brushRadius * 2;
      this.points.push(this.lazy.brush.toObject());

      var p1 = this.points[0];
      var p2 = this.points[1];

      this.ctx.temp.moveTo(p2.x, p2.y);
      this.ctx.temp.beginPath();

      for (var i = 1, len = this.points.length; i < len; i++) {
        // we pick the point between pi+1 & pi+2 as the
        // end point and p1 as our control point
        var midPoint = midPointBtw(p1, p2);
        this.ctx.temp.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
        p1 = this.points[i];
        p2 = this.points[i + 1];
      }
      // Draw last line as a straight line while
      // we wait for the next point to be able to calculate
      // the bezier control point
      this.ctx.temp.lineTo(p1.x, p1.y);
      this.ctx.temp.stroke();
    }

    this.mouseHasMoved = true;
  };

  clearCanvas = () => {
    this.valuesChanged = true;
    this.ctx.drawing.clearRect(
      0,
      0,
      this.canvas.drawing.width,
      this.canvas.drawing.height
    );
    this.ctx.temp.clearRect(
      0,
      0,
      this.canvas.temp.width,
      this.canvas.temp.height
    );
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

  drawGrid = ctx => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.beginPath();
    ctx.setLineDash([5, 1]);
    ctx.setLineDash([]);
    // ctx.strokeStyle = styleVariables.colorInterfaceGrid
    ctx.strokeStyle = "rgba(150,150,150,0.17)";
    ctx.lineWidth = 0.5;

    const gridSize = 25;

    let countX = 0;
    while (countX < ctx.canvas.width) {
      countX += gridSize;
      ctx.moveTo(countX, 0);
      ctx.lineTo(countX, ctx.canvas.height);
    }
    ctx.stroke();

    let countY = 0;
    while (countY < ctx.canvas.height) {
      countY += gridSize;
      ctx.moveTo(0, countY);
      ctx.lineTo(ctx.canvas.width, countY);
    }
    ctx.stroke();
  };

  drawInterface = (ctx, pointer, brush) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw brush preview
    ctx.beginPath();
    ctx.fillStyle = this.props.brushColor;
    ctx.arc(brush.x, brush.y, this.brushRadius, 0, Math.PI * 2, true);
    ctx.fill();

    // Draw mouse point (the one directly at the cursor)
    ctx.beginPath();
    ctx.fillStyle = "#0a0302";
    ctx.arc(pointer.x, pointer.y, 4, 0, Math.PI * 2, true);
    ctx.fill();

    // Draw catenary
    if (this.lazy.isEnabled()) {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = "#0a0302";
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
    ctx.fillStyle = "#222";
    ctx.arc(brush.x, brush.y, 2, 0, Math.PI * 2, true);
    ctx.fill();
  };

  render() {
    return (
      <div
        style={{
          display: "block",
          background: "#fff",
          touchAction: "none",
          width: this.props.canvasWidth,
          height: this.props.canvasHeight,
          ...this.props.style
        }}
        ref={container => {
          if (container) {
            this.canvasContainer = container;
          }
        }}
      >
        {canvasTypes.map(({ name, zIndex }) => {
          const isInterface = name === "interface";
          return (
            <canvas
              key={name}
              ref={canvas => {
                if (canvas) {
                  this.canvas[name] = canvas;
                  this.ctx[name] = canvas.getContext("2d");
                }
              }}
              style={{ ...canvasStyle, zIndex }}
              onMouseDown={isInterface ? this.handleMouseDown : undefined}
              onMouseUp={isInterface ? this.handleMouseUp : undefined}
              onMouseMove={isInterface ? this.handleMouseMove : undefined}
              onContextMenu={isInterface ? this.handleContextMenu : undefined}
              onTouchStart={isInterface ? this.handleTouchStart : undefined}
              onTouchEnd={isInterface ? this.handleTouchEnd : undefined}
              onTouchMove={isInterface ? this.handleTouchMove : undefined}
            />
          );
        })}
      </div>
    );
  }
}
