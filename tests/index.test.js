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
      expect(node.innerHTML).toContain(`width: 400px`);
      expect(node.innerHTML).toContain(`height: 500px`);
    });
  });
});
