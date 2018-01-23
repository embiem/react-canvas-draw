import React, { Component } from "react";
import { render } from "react-dom";

import CanvasDraw from "../../src";
import "./index.css";

class Demo extends Component {
  state = {
    color: "#ffc600"
  };
  componentDidMount() {
    // let's change the color randomly every 2 seconds. fun!
    window.setInterval(() => {
      this.setState({
        color: "#" + Math.floor(Math.random() * 16777215).toString(16)
      });
    }, 2000);
  }
  render() {
    return (
      <div>
        <h1>React Canvas Draw</h1>
        <h2>default</h2>
        <p>
          This is a simple <span>{`<CanvasDraw />`}</span> component with
          default values.
        </p>
        <p>Try it out! Draw on this white canvas:</p>
        <CanvasDraw />
        <h2>Custom Brush-Color</h2>
        <p>
          Let's spice things up by using custom brush colors{" "}
          <span>{`<CanvasDraw brushColor={this.state.color} />`}</span>. We
          randomly change them every 2 seconds. But you could easily use a
          color-picker!
        </p>
        <div>
          Current color:{" "}
          <div
            style={{
              display: "inline-block",
              width: "24px",
              height: "24px",
              backgroundColor: this.state.color,
              border: "1px solid #272727"
            }}
          />
        </div>
        <CanvasDraw brushColor={this.state.color} />
        <h2>Save & Load</h2>
        <p>
          This part got me most excited. Very easy to use saving and loading of
          drawings. It even comes with a customizable loading speed to control
          whether your drawing should load instantly (loadTimeOffset = 0) or
          appear after some time (loadTimeOffset > 0){" "}
          <span>{`<CanvasDraw loadTimeOffset={10} />`}</span>
        </p>
        <p>Try it out! Draw something, hit "Save" and then "Load".</p>
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
        <CanvasDraw
          brushColor={this.state.color}
          ref={canvasDraw => (this.saveableCanvas = canvasDraw)}
        />
        <p>
          That's it for now! Take a look at the{" "}
          <a href="https://github.com/mBeierl/react-canvas-draw/tree/master/demo/src">
            source code of these examples
          </a>.
        </p>
      </div>
    );
  }
}

render(<Demo />, document.querySelector("#demo"));
