import React, { Component } from "react";

import classes from "./index.css";

export default class extends Component {
  static defaultProps = {
    loadTimeOffset: 5,
    brushSize: 10,
    brushColor: "#444",
    canvasWidth: 800,
    canvasHeight: 600
  };

  constructor(props) {
    super(props);

    this.isMouseDown = false;
    this.linesArray = [];
  }

  componentDidMount() {
    this.canvas.width = this.props.canvasWidth;
    this.canvas.height = this.props.canvasHeight;
  }

  getSaveData = () => {
    return JSON.stringify(this.linesArray);
  };

  loadSaveData = saveData => {
    this.clear();
    this.linesArray = JSON.parse(saveData);
    this.linesArray.forEach((line, idx) => {
      // draw the line with a time offset
      // creates the cool drawing-animation effect
      window.setTimeout(
        () => this.drawLine(line),
        idx * this.props.loadTimeOffset
      );
    });
  };

  getMousePos = e => {
    const rect = this.canvas.getBoundingClientRect();

    // calculate mouse position inside canvas
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  clear = () => {
    this.ctx.clearRect(0, 0, this.props.canvasWidth, this.props.canvasHeight);
    this.linesArray = [];
  };

  drawLine = line => {
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
    e.clientX += 1;
    e.clientY += 1;
    this.draw(e);
  };

  drawEnd = () => {
    this.isMouseDown = false;
  };

  draw = e => {
    if (!this.isMouseDown) return;

    // calculate the current x, y coords
    const { x, y } = this.getMousePos(e);
    const newX = x;
    const newY = y;

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
        className={classes.canvas}
        style={{
          background: "#fff",
          margin: "0.9rem",
          ...this.props.style
        }}
        ref={canvas => {
          this.canvas = canvas;
          this.ctx = canvas.getContext("2d");
        }}
        onMouseDown={this.drawStart}
        onClick={() => false}
        onMouseUp={this.drawEnd}
        onMouseOut={this.drawEnd}
        onMouseMove={this.draw}
      />
    );
  }
}
