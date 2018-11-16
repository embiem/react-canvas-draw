import React, { PureComponent } from "react";
import { LazyBrush } from "lazy-brush";
import { Catenary } from "catenary-curve";

import ResizeObserver from "resize-observer-polyfill";

import drawImage from "./drawImage";

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
    zIndex: 11
  },
  {
    name: "temp",
    zIndex: 12
  },
  {
    name: "grid",
    zIndex: 10
  }
];

export default class extends PureComponent {
  static defaultProps = {
    loadTimeOffset: 5,
    lazyRadius: 30,
    brushRadius: 12,
    brushColor: "#444",
    gridColor: "rgba(150,150,150,0.17)",
    hideGrid: false,
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
      radius: props.lazyRadius,
      enabled: true,
      initialPoint: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      }
    });

    this.points = [];
    this.lines = [];

    this.mouseHasMoved = true;
    this.valuesChanged = true;
    this.isDrawing = false;
    this.isPressing = false;

    this.chainLength = props.lazyRadius;

    this.dpi = 1;
  }

  componentDidMount() {
    const observeCanvas = new ResizeObserver((entries, observer) =>
      this.handleCanvasResize(entries, observer)
    );
    observeCanvas.observe(this.canvasContainer);

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
      this.clearCanvas();
    }, 100);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.lazyRadius !== this.props.lazyRadius) {
      // Set new values
      this.chainLength = this.props.lazyRadius;
      this.lazy.setRadius(this.props.lazyRadius);
    }

    if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
      // Signal this.loop function that values changed
      this.valuesChanged = true;
    }
  }

  drawImage = () => {
    if (!this.props.imgSrc) return;

    this.image = new Image();
    this.image.src = this.props.imgSrc;
    this.image.onload = () =>
      drawImage({ ctx: this.ctx.grid, img: this.image });
  };

  getSaveData = () => {
    const saveData = {
      lines: this.lines,
      width: this.props.canvasWidth,
      height: this.props.canvasHeight
    };
    return saveData;
  };

  loadSaveData = (saveData, immediate) => {
    if (typeof saveData !== "object") {
      throw new Error("saveData needs to be of type object!");
    }

    const { lines, width, height } = saveData;

    if (!lines || typeof lines.push !== "function") {
      throw new Error("saveData.lines needs to be an array!");
    }

    this.clearCanvas();

    if (
      width === this.props.canvasWidth &&
      height === this.props.canvasHeight
    ) {
      this.lines = lines;
    } else {
      // we need to rescale the lines based on saved & current dimensions
      const scaleX = this.props.canvasWidth / width;
      const scaleY = this.props.canvasHeight / height;
      const scaleAvg = (scaleX + scaleY) / 2;

      this.lines = lines.map(line => ({
        ...line,
        points: line.points.map(p => ({
          x: p.x * scaleX,
          y: p.y * scaleY
        })),
        brushRadius: line.brushRadius * scaleAvg
      }));
    }

    // Simulate live-drawing of the loaded lines
    let curTime = 0,
      timeoutGap = immediate ? 0 : this.props.loadTimeOffset;

    this.lines.forEach(line => {
      curTime += timeoutGap;
      window.setTimeout(() => {
        this.handleMouseDown(new Event(""));
      }, curTime);

      line.points.forEach(p => {
        curTime += timeoutGap;
        window.setTimeout(() => {
          // Add new point
          this.points.push(p);

          if (this.points.length > 1) {
            // Draw current points
            this.drawPoints({
              points: this.points,
              brushColor: line.brushColor,
              brushRadius: line.brushRadius
            });
          }
        }, curTime);
      });

      curTime += timeoutGap;
      window.setTimeout(() => {
        this.handleMouseUp(new Event(""));
      }, curTime);
    });
  };

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

    // Save as new line
    this.lines.push({
      points: [...this.points],
      brushColor: this.props.brushColor,
      brushRadius: this.props.brushRadius
    });

    // Reset points array
    this.points.length = 0;

    const dpi = window.innerWidth > 1024 ? 1 : window.devicePixelRatio;
    const width = this.canvas.temp.width / dpi;
    const height = this.canvas.temp.height / dpi;

    this.ctx.drawing.drawImage(this.canvas.temp, 0, 0, width, height);
    this.ctx.temp.clearRect(0, 0, width, height);
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
    if (this.props.disabled) return;

    const hasChanged = this.lazy.update({ x, y });
    const isDisabled = !this.lazy.isEnabled();

    if (
      (this.isPressing && hasChanged && !this.isDrawing) ||
      (isDisabled && this.isPressing)
    ) {
      // Start drawing and add point
      this.isDrawing = true;
      this.points.push(this.lazy.brush.toObject());
    }

    if (this.isDrawing && (this.lazy.brushHasMoved() || isDisabled)) {
      // Add new point
      this.points.push(this.lazy.brush.toObject());

      // Draw current points
      this.drawPoints({
        points: this.points,
        brushColor: this.props.brushColor,
        brushRadius: this.props.brushRadius
      });
    }

    this.mouseHasMoved = true;
  };

  drawPoints = ({ points, brushColor, brushRadius }) => {
    this.ctx.temp.lineJoin = "round";
    this.ctx.temp.lineCap = "round";
    this.ctx.temp.strokeStyle = brushColor;

    this.ctx.temp.clearRect(
      0,
      0,
      this.ctx.temp.canvas.width,
      this.ctx.temp.canvas.height
    );
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
    if (this.props.hideGrid) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.beginPath();
    ctx.setLineDash([5, 1]);
    ctx.setLineDash([]);
    ctx.strokeStyle = this.props.gridColor;
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
    ctx.arc(brush.x, brush.y, this.props.brushRadius, 0, Math.PI * 2, true);
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
