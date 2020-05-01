class Canvas {
  constructor(domElement) {
    this.domElement = domElement;
  }

  resize(x, y) {
    this.domElement.width = x;
    this.domElement.height = y;
  }

  get dataUrl() {
    return this.domElement.toDataURL();
  }

  get context() {
    return this.domElement.getContext('2d');
  }

  clear() {
    this.context.clearRect(0, 0, this.domElement.width, this.domElement.height);
  }

  set onMouseDown(handler) { this.domElement.onmousedown = handler; }
  set onMouseMove(handler) { this.domElement.onmousemove = handler; }
  set onMouseUp(handler) { this.domElement.onmouseup = handler; }

  static createNew(width, height) {
    const domElem = document.createElement('CANVAS');
    domElem.width = width;
    domElem.height = height;

    return new Canvas(domElem);
  }
}
