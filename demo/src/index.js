import React, { Component } from "react";
import { render } from "react-dom";

import CanvasDraw from "../../src";
import "./index.css";

class Demo extends Component {
  render() {
    return (
      <div>
        <h1>"react-canvas-draw" React Component</h1>
        <h2>default</h2>
        <CanvasDraw />
        <h2>Custom Brush-Color</h2>
        <CanvasDraw brushColor="#ffc600" />
        <h2>Save & Load</h2>
        <button
          onClick={() => {
            localStorage.setItem(
              "savedDrawing",
              this.saveableCanvas.getSaveData()
            );
          }}
        >
          Save
        </button>
        <button
          onClick={() => {
            this.saveableCanvas.loadSaveData(
              localStorage.getItem("savedDrawing")
            );
          }}
        >
          Load
        </button>
        <button
          onClick={() => {
            this.saveableCanvas.clear();
          }}
        >
          Clear
        </button>
        <CanvasDraw ref={canvasDraw => (this.saveableCanvas = canvasDraw)} />
      </div>
    );
  }
}

render(<Demo />, document.querySelector("#demo"));
