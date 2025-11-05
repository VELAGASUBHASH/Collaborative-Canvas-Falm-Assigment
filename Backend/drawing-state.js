class DrawingState {
  constructor() {
    this.strokes = [];
    this.undone = [];
  }

  addStroke(stroke) {
    this.strokes.push(stroke);
    this.undone = [];
  }

  undo() {
    if (this.strokes.length > 0) {
      const removed = this.strokes.pop();
      this.undone.push(removed);
    }
  }

  redo() {
    if (this.undone.length > 0) {
      const restored = this.undone.pop();
      this.strokes.push(restored);
    }
  }

  getStrokes() {
    return this.strokes;
  }
}

module.exports = DrawingState;
