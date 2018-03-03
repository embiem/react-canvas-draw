import expect from "expect";
import Enzyme, { shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import React from "react";
import { render, unmountComponentAtNode } from "react-dom";

import DrawCanvas from "src/";

describe("DrawCanvas", () => {
  before(() => {
    Enzyme.configure({ adapter: new Adapter() });
  });

  let node;

  beforeEach(() => {
    node = document.createElement("div");
  });

  afterEach(() => {
    unmountComponentAtNode(node);
  });

  it("displays a canvas element", () => {
    render(<DrawCanvas />, node, () => {
      expect(node.innerHTML).toContain("<canvas");
    });
  });

  it("changes width and height", () => {
    const drawCanvas = <DrawCanvas canvasWidth={400} canvasHeight={500} />;
    render(drawCanvas, node, () => {
      expect(node.innerHTML).toContain(`width="400"`);
      expect(node.innerHTML).toContain(`height="500"`);
    });
  });

  it("returns an empty lines array", () => {
    const wrapper = shallow(
      <DrawCanvas canvasWidth={400} canvasHeight={500} />
    );
    expect(wrapper.instance().getSaveData()).toEqual(
      `{"linesArray":[],"width":400,"height":500}`
    );
  });

  it("loads a data array", () => {
    const savedDataString = `{"linesArray":[{"color":"#785193","size":6,"startX":146,"startY":108.03125,"endX":147,"endY":109.03125},{"color":"#785193","size":6,"startX":147,"startY":109.03125,"endX":146,"endY":109.03125},{"color":"#785193","size":6,"startX":146,"startY":109.03125,"endX":138,"endY":116.03125},{"color":"#74b25f","size":6,"startX":386,"startY":322.03125,"endX":386,"endY":323.03125}],"width":400,"height":400}`;
    const wrapper = shallow(<DrawCanvas />);
    wrapper.instance().loadSaveData(savedDataString);
    expect(wrapper.instance().getSaveData()).toEqual(savedDataString);
  });
});
