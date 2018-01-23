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

  it("returns an empty data array", () => {
    const wrapper = shallow(<DrawCanvas />);
    expect(wrapper.instance().getSaveData()).toEqual("[]");
  });

  it("loads a data array", () => {
    const savedDataString = `[{"color":"#444","size":10,"startX":275.609375,"startY":103.046875,"endX":275.609375,"endY":103.046875},{"color":"#444","size":10,"startX":275.609375,"startY":103.046875,"endX":276.609375,"endY":104.046875},{"color":"#444","size":10,"startX":276.609375,"startY":104.046875,"endX":274.609375,"endY":103.046875},{"color":"#444","size":10,"startX":274.609375,"startY":103.046875,"endX":271.609375,"endY":108.046875},{"color":"#444","size":10,"startX":271.609375,"startY":108.046875,"endX":263.609375,"endY":117.046875},{"color":"#444","size":10,"startX":263.609375,"startY":117.046875,"endX":244.609375,"endY":135.046875},{"color":"#444","size":10,"startX":244.609375,"startY":135.046875,"endX":217.609375,"endY":157.046875},{"color":"#444","size":10,"startX":217.609375,"startY":157.046875,"endX":189.609375,"endY":184.046875},{"color":"#444","size":10,"startX":189.609375,"startY":184.046875,"endX":173.609375,"endY":204.046875},{"color":"#444","size":10,"startX":173.609375,"startY":204.046875,"endX":168.609375,"endY":215.046875},{"color":"#444","size":10,"startX":168.609375,"startY":215.046875,"endX":168.609375,"endY":224.046875},{"color":"#444","size":10,"startX":168.609375,"startY":224.046875,"endX":171.609375,"endY":233.046875},{"color":"#444","size":10,"startX":171.609375,"startY":233.046875,"endX":179.609375,"endY":246.046875},{"color":"#444","size":10,"startX":179.609375,"startY":246.046875,"endX":196.609375,"endY":269.046875},{"color":"#444","size":10,"startX":196.609375,"startY":269.046875,"endX":224.609375,"endY":302.046875},{"color":"#444","size":10,"startX":224.609375,"startY":302.046875,"endX":253.609375,"endY":331.046875},{"color":"#444","size":10,"startX":253.609375,"startY":331.046875,"endX":274.609375,"endY":344.046875},{"color":"#444","size":10,"startX":274.609375,"startY":344.046875,"endX":281.609375,"endY":345.046875},{"color":"#444","size":10,"startX":419.609375,"startY":120.046875,"endX":419.609375,"endY":120.046875},{"color":"#444","size":10,"startX":419.609375,"startY":120.046875,"endX":420.609375,"endY":121.046875},{"color":"#444","size":10,"startX":420.609375,"startY":121.046875,"endX":419.609375,"endY":122.046875},{"color":"#444","size":10,"startX":419.609375,"startY":122.046875,"endX":425.609375,"endY":129.046875},{"color":"#444","size":10,"startX":425.609375,"startY":129.046875,"endX":438.609375,"endY":141.046875},{"color":"#444","size":10,"startX":438.609375,"startY":141.046875,"endX":464.609375,"endY":166.046875},{"color":"#444","size":10,"startX":464.609375,"startY":166.046875,"endX":491.609375,"endY":198.046875},{"color":"#444","size":10,"startX":491.609375,"startY":198.046875,"endX":511.609375,"endY":230.046875},{"color":"#444","size":10,"startX":511.609375,"startY":230.046875,"endX":518.609375,"endY":260.046875},{"color":"#444","size":10,"startX":518.609375,"startY":260.046875,"endX":516.609375,"endY":287.046875},{"color":"#444","size":10,"startX":516.609375,"startY":287.046875,"endX":500.609375,"endY":312.046875},{"color":"#444","size":10,"startX":500.609375,"startY":312.046875,"endX":469.609375,"endY":334.046875},{"color":"#444","size":10,"startX":469.609375,"startY":334.046875,"endX":430.609375,"endY":343.046875},{"color":"#444","size":10,"startX":430.609375,"startY":343.046875,"endX":427.609375,"endY":343.046875}]`;
    const wrapper = shallow(<DrawCanvas />);
    wrapper.instance().loadSaveData(savedDataString);
    expect(wrapper.instance().getSaveData()).toEqual(savedDataString);
  });
});
