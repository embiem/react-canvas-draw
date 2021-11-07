/**
 * @type {ViewPoint}
 */
const NULL_VIEW_POINT = Object.freeze({
  x: 0, y: 0, untransformedX: 0, untransformedY: 0
});

/**
 * @type {CanvasBounds}
 */
const NULL_BOUNDS = Object.freeze({
  canvasWidth: 0, canvasHeight: 0,
  left: 0, top: 0, right: 0, bottom: 0,
  viewMin: NULL_VIEW_POINT, viewMax: NULL_VIEW_POINT,
});

/**
 * The identity matrix (a transform that results in view coordinates that are
 * identical to relative client coordinates).
 * @type {Matrix}
 */
export const IDENTITY = Object.freeze({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });

function valueOrDefault(value, defaultValue) {
  if (value === null || (typeof value) === "undefined") {
    return defaultValue;
  } else {
    return value;
  }
}

/**
 * Facilitates calculation and manipulation of a zoom-and-pannable view within a
 * canvas.
 */
export default class CoordinateSystem {
  /**
   * @typedef Extents
   * @property {number} min the minimal value in the range
   * @property {number} max the maximal value in the range
   */

  /**
   * @typedef Size
   * @property {number} width the span of the element's horizontal axis
   * @property {number} height the span of the element's vertical axis
   */

  /**
   * @param {Object} parameters the initialization parameters for this instance.
   * @param {Extents} parameters.scaleExtents the minimum and maximum allowable scale factor.
   * @param {Sizee} parameters.documentSize the width and height of the document, in client space.
   */
  constructor({ scaleExtents, documentSize }) {
    this._scaleExtents = scaleExtents;
    this._documentSize = documentSize;
  }

  /**
   * @type {Extents}
   */
  _scaleExtents;

  /**
   * @type {Size}
   */
  _documentSize;

  /**
   * @typedef Canvas
   * @property {number} width the canvas's width
   * @property {number} height the canvas's height
   * @property {() => Object} getBoundingClientRect returns the client bounds
   */

  /**
   * @type {Canvas}
   * @private
   */
  _canvas = null;

  /**
   * @typedef View
   * @property {number} scale the zoom factor
   * @property {number} x the current x offset
   * @property {number} y the current y offset
   */

  /**
   * @type {View}
   * @private
   */
  _view = { scale: 1.0, x: 0, y: 0 };

  /**
   * Describes a callback function that receives info about view changes
   * @typedef {(update: { view: View, transform: Matrix }) => void} ViewListener
   */

   /**
    * @type {ViewListener[]}
    * @private
    */
   _viewChangeListeners = new Set();

  /**
   * @returns {Canvas} the canvas currently associated with this instance.
   */
  get canvas() {
    return this._canvas;
  }

  /**
   * Updates the canvas for this coordinate system and recalculates the view.
   * @param {Canvas} canvas the new canvas to associate with this instance.
   */
  set canvas(canvas) {
    this._canvas = canvas;
    this.setView();
  }

  /**
   * @returns {number} the current zoom factor
   */
  get scale() {
    return this._view.scale;
  }

  /**
   * Sets the zoom factor (clamped by the scale extents) and updates the view.
   * @param {number} the new zoom factor
   */
  setScale = (scale) => {
    this.setView({ scale });
  };

  /**
   * @returns {number} the horizontal component of the current pan offset
   */
  get x() {
    return this._view.x;
  }

  /**
   * Sets the horizontal pan offset (clamped by the document extents) and
   * updates the view.
   * @param {number} x the new offset
   */
  set x(x) {
    this.setView({ x });
  }

  /**
   * @retruns {number} the vertical component of the current pan offset
   */
  get y() {
    return this._view.y;
  }

  /**
   * Sets the vertical pan offset (clamped by the document extents) and
   * updates the view.
   * @param {number} y the new offset
   */
  set y(y) {
    this.setView({ y });
  }

  /**
   * @returns {View} a copy of this instance's current view state.
   */
  get view() {
    return { ...this._view };
  }

  /**
   * @returns {Extents} a copy of the scale extents currently applied to this
   * instance.
   */
  get scaleExtents() {
    return { ...this._scaleExtents };
  }

  /**
   * Updates the minimum and maximum scale and resets the view transform if it
   * is outside the new extents.
   * @param {Extents} extents the new scale extents.
   */
  set scaleExtents({ min, max }) {
    this._scaleExtents = { min, max };
    this.setView();
  }

  /**
   * @returns {Size} the current document size (used to constrain the pan
   * offset).
   */
  get documentSize() {
    return { ...this._documentSize };
  }

  /**
   * Sets the document size and recalculates the view if it is outside the new
   * bounds.
   * @param {Size} size the new document size.
   */
  set documentSize({ width, height }) {
    this._documentSize = { width, height };
    this.setView();
  }

  /**
   * A view matrix expressing a series of transformations.
   * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform
   * @typedef Matrix
   * @property {number} a horizontal scaling factor (1 == unscaled)
   * @property {number} b vertical skewing factor (0 == unskewed)
   * @property {number} c horizontal skewing factor (0 == unskewed)
   * @property {number} d vertical scaling factor (1 == unscaled)
   * @property {number} e horizontal translation (0 == untranslated)
   * @property {number} f vertical translation (0 == untranslated)
   */

  /**
   * @returns {Matrix} this coordinate system's current transformation matrix
   */
  get transformMatrix() {
    //
    return {
      a: this._view.scale, // horizontal scaling
      b: 0, // vertical skewing
      c: 0, // horizontal skewing
      d: this._view.scale, // vertical scaling
      e: this._view.x,
      f: this._view.y,
    };
  }

  /**
   * An object expressing the bounds of a canvas object in terms of the
   * coordinate system.
   * @typedef CanvasBounds
   * @property {number} left the left edge of the canvas in client space
   * @property {number} right the right edge of the canvas in client space
   * @property {number} top the top edge of the canvas in client space
   * @property {number} bottom the bottom edge of the canvas in client space
   * @property {number} canvasWidth the width of the canvas in client space
   * @property {number} canvasHeight the height of the canvas in client space
   * @property {ViewPoint} viewMin the top-left corner of the canvas in view space
   * @property {ViewPoint} viewMax the bottom-right corner of the canvas in view space
   */

  /**
   * @returns {CanvasBounds | undefined} the boundaries of the canvas linked to
   * this coordinate system, or undefined if no canvas is set.
   */
  get canvasBounds() {
    if (this._canvas) {
      const { left, top, right, bottom } = this._canvas.getBoundingClientRect();
      return {
        viewMin: this.clientPointToViewPoint({ clientX: left, clientY: top }),
        viewMax: this.clientPointToViewPoint({ clientX: right, clientY: bottom }),
        left, top, right, bottom,
        canvasWidth: this._canvas.width,
        canvasHeight: this._canvas.height,
      };
    } else {
      return undefined;
    }
  }

  /**
   * @private
   * @return {{left: number, top: number} | undefined}
   */
  get canvasRect() {
    if (this.canvas) {
      return this.canvas.getBoundingClientRect();
    } else {
      return undefined;
    }
  }

  /**
   * Calculates a variant of the given view clamped according to the scale and
   * document bounds. Does not modify this instance.
   * @param {View} view the view constraints to clamp.
   * @returns {View} a new view object representing the constrained input.
   */
  clampView = ({ scale, x, y }) => {
    const { min, max } = this.scaleExtents;
    const { width, height } = this.documentSize;
    const { left, top, right, bottom } = this.canvasRect || NULL_BOUNDS;

    const canvasWidth = right - left;
    const canvasHeight = bottom - top;

    const maxx = canvasWidth / 2;
    const minx = -(width * this._view.scale - canvasWidth / 2);
    const maxy = canvasHeight / 2;
    const miny = -(height * this._view.scale - canvasHeight / 2);

    // Clamp values to acceptible range.
    return {
      scale: Math.min(Math.max(scale, min), max),
      x: Math.min(Math.max(x, minx), maxx),
      y: Math.min(Math.max(y, miny), maxy),
    };
  };

  /**
   * Resets the view transform to its default state.
   */
  resetView = () => {
    this.setView({ scale: 1.0, x: 0, y: 0 });
  };

  /**
   * Updates the view, ensuring that it is within the document and scale bounds.
   * @param {View} view
   *    the new view state. Any view property not specified will remain
   *    unchanged.
   * @return {View}
   *    a copy of the view state after having been constrained and applied.
   */
  setView = (view) => {
    const newView = this.clampView({ ...this._view, ...(view || {}) });
    const { scale, x, y } = this._view;

    // Only trigger if the view actually changed.
    if (newView.scale !== scale || newView.x !== x || newView.y !== y) {
      this._view = newView;
      this._viewChangeListeners.forEach(listener => listener && listener(newView));
    }

    return { ...this._view };
  };

  /**
   * Updates the current view scale while attempting to keep the given point
   * fixed within the canvas.
   *
   * @param {number} deltaScale the amount by which to change the current scale factor.
   * @param {ClientPoint} clientPoint the origin of the zoom, in client space.
   *
   * @returns {View} the newly computed view.
   */
  scaleAtClientPoint = (deltaScale, clientPoint) => {
    const viewPt = this.clientPointToViewPoint(clientPoint);
    const newView = this.clampView({ ...this._view, scale: this._view.scale + deltaScale });
    const clientPtPostScale = this.viewPointToClientPoint(viewPt, newView);

    newView.x = this._view.x - (clientPtPostScale.clientX - clientPoint.clientX);
    newView.y = this._view.y - (clientPtPostScale.clientY - clientPoint.clientY);

    return this.setView(newView);
  };

  /**
   * Describes a point in view space (client space after the viewport transform
   * has been applied).
   * @typedef ViewPoint
   * @property {number} x
   *    the x-coordinate in view space
   * @property {number} y
   *    the y-coordinate in view space
   * @property {number} relativeClientX
   *    the x-coordinate of the point in client space, relative to the top-left
   *    corner of the canvas
   * @property {number} relativeClientY
   *    the y-coordinate of the point in client space, relative to the top-left
   *    corner of the canvas
   */

  /**
   * @param {ClientPoint} point the point to transform in client space
   * @param {View} view the view transform to apply (defaults to the current view)
   * @returns {ViewPoint} the result of converting the given client coordinate
   * to view space. If there is no canvas set, a top-left corner of (0, 0) is
   * assumed.
   */
  clientPointToViewPoint = ({ clientX, clientY }, view = this._view) => {
    const { left, top } = this.canvasRect || NULL_BOUNDS;
    const relativeClientX = clientX - left;
    const relativeClientY = clientY - top;

    return {
      x: (relativeClientX - view.x) / view.scale,
      y: (relativeClientY - view.y) / view.scale,
      relativeClientX,
      relativeClientY,
    };
  };

  /**
   * @typedef ClientPoint
   * @property {number} clientX
   *    the x-coordinate in client space
   * @property {number} clientY
   *    the y-coordinate in client space
   * @property {number} x
   *    an alias for clientX
   * @property {number} y
   *    an alias for clientY
   * @property {number} relativeX
   *    the x-coordinate in client space, relative to the top-left corner of the
   *    canvas
   * @property {number} relativeY
   *    the y-coordinate in client space, relative to the top-left corner of the
   *    canvas
   */

   /**
    * @param {ViewPoint} point the point to transform in view space
    * @param {number} point.x the point's x-coordinate
    * @param {number} point.y the point's y-coordinate
    * @param {View} view the view transform to apply (defaults to the current view)
    * @returns {ClientPoint} the result of converting the given coordinate to
    * client space. If there is no canvas set, a top-left corner of (0, 0) is
    * assumed.
    */
  viewPointToClientPoint = ({ x, y }, view = this._view) => {
    const { left, top } = this.canvasRect || NULL_BOUNDS;
    const relativeX = x * view.scale + view.x;
    const relativeY = y * view.scale + view.y;
    const clientX = relativeX + left;
    const clientY = relativeY + top;

    return { clientX, clientY, relativeX, relativeY, x: clientX, y: clientY };
  };

  /**
   * Adds a new callback function that will be invoked each time the view
   * transform changes.
   * @param {ViewListener} listener the callback to execute.
   */
  attachViewChangeListener = (listener) => {
    this._viewChangeListeners.add(listener);
  };
}
