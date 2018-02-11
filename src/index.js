import React, { Component } from "react";

export default class extends Component {
  static defaultProps = {
    loadTimeOffset: 5,
    brushSize: 6,
    brushColor: "#444",
    canvasWidth: 400,
    canvasHeight: 400
  };

  constructor(props) {
    super(props);

    this.isMouseDown = false;
    this.linesArray = [];
  }

  getSaveData = () => {
    return JSON.stringify(this.linesArray);
  };

  loadSaveData = saveData => {
    try {
      if (typeof saveData !== "string") {
        throw new Error("saveData needs to be a stringified array!");
      }
      // parse first to catch any possible errors before clear()
      const parsedSaveData = JSON.parse(saveData);

      if (typeof parsedSaveData.push !== "function") {
        throw new Error("parsedSaveData needs to be an array!");
      }

      // start the load-process
      this.clear();
      this.linesArray = parsedSaveData;
      this.linesArray.forEach((line, idx) => {
        // draw the line with a time offset
        // creates the cool drawing-animation effect
        window.setTimeout(
          () => this.drawLine(line),
          idx * this.props.loadTimeOffset
        );
      });
    } catch (err) {
      throw(err);
    }
  };

  getMousePos = e => {
    const rect = this.canvas.getBoundingClientRect();

    // use cursor pos as default
    let clientX = e.clientX;
    let clientY = e.clientY;

    // use first touch if available
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    // return mouse/touch position inside canvas
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  clear = () => {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.props.canvasWidth, this.props.canvasHeight);
    }
    this.linesArray = [];
  };

  drawLine = line => {
    if (!this.ctx) return;

    this.ctx.strokeStyle = line.color;
    this.ctx.lineWidth = line.size;
    this.ctx.lineCap = "round";
    this.ctx.beginPath();
    this.ctx.moveTo(line.startX, line.startY);
    this.ctx.lineTo(line.endX, line.endY);
    this.ctx.stroke();
  };

  drawStart = e => {
    this.isMouseDown = true;

    const { x, y } = this.getMousePos(e);
    this.x = x;
    this.y = y;

    // make sure we start painting, useful to draw simple dots
    this.draw(e);
  };

  drawEnd = () => {
    this.isMouseDown = false;
  };

  draw = e => {
    if (!this.isMouseDown) return;

    // calculate the current x, y coords
    const { x, y } = this.getMousePos(e);

    // Offset by 1 to ensure drawing a dot on click
    const newX = x + 1;
    const newY = y + 1;

    // create current line object
    const line = {
      color: this.props.brushColor,
      size: this.props.brushSize,
      startX: this.x,
      startY: this.y,
      endX: newX,
      endY: newY
    };

    // actually draw the line
    this.drawLine(line);

    // push it to our array of lines
    this.linesArray.push(line);

    // notify parent that a new line was added
    if (typeof this.props.onChange === "function") {
      this.props.onChange(this.linesArray);
    }

    // set current x, y coords
    this.x = newX;
    this.y = newY;
  };

  render() {
    return (
      <canvas
        width={this.props.canvasWidth}
        height={this.props.canvasHeight}
        style={{
          display: "block",
          background: "#fff",
          touchAction: "none",
          ...this.props.style
        }}
        ref={canvas => {
          if (canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext("2d");
          }
        }}
        onMouseDown={this.drawStart}
        onClick={() => false}
        onMouseUp={this.drawEnd}
        onMouseOut={this.drawEnd}
        onMouseMove={this.draw}
        onTouchStart={this.drawStart}
        onTouchMove={this.draw}
        onTouchEnd={this.drawEnd}
        onTouchCancel={this.drawEnd}
      />
    );
  }
}
