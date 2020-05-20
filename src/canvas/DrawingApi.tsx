
type Vertex = {
  posX: number;
  posY: number;
  selected: boolean;
}

export class DrawingObject {
  type = -1; // arrow, ray, extended, trend, pitch fork, text, channel
  color = 'white';
  text = '';
  fontFamily = 'Arial';
  fontSize = 15;
  selected = false;
  lineColor = 'white';
  lineWidth = 0;
  lineStyle = -1; // ctx.setLineDash([4, 2]);
  vertexLen = 0; // maximum vertex count
  vertices: Vertex[] = []; // vertices list

  constructor(
    { type, color, selected, lineColor, lineWidth, lineStyle, vertexLen, vertices } = {
      type: 0,
      color: 'white',
      selected: false,
      lineColor: 'white',
      lineWidth: 1,
      lineStyle: 0,
      vertexLen: 1,
      vertices: [{ posX: 0, posY: 0 }],
    },
  ) {
    this.type = type;
    this.color = color;
    this.selected = selected;
    this.lineColor = lineColor;
    this.lineWidth = lineWidth;
    this.lineStyle = lineStyle;
    this.vertexLen = vertexLen;
    // @ts-ignore
    this.vertices = vertices;
  }

  /**
   * functions for getting intersection between panel and line
   */
  getIntersectionWithPanel = (X1: any, X2: any, chartRect: any) => {
    const deltaX = (X2 as any).posX - (X1 as any).posX;
    const deltaY = (X1 as any).posY - (X2 as any).posY;
    const offsetX = (deltaX / deltaY) * (chartRect.height - (X2 as any).posY);
    const X3 = {
      posX: (X2 as any).posX - offsetX,
      posY: chartRect.height,
    };
    const X4 = {
      posX: (X2 as any).posX + (deltaX / deltaY) * (X2 as any).posY,
      posY: 0,
    };
    return [X3, X4];
  };

  /**
   * copy keys of values that are not functions from other object
   */
  copyProperties = (other: any) => {
    const applied = {};
    Object.keys({ ...other }).forEach((key: string) => {
      if (typeof other[key] !== 'function' && other[key]) {
        (this as any)[key] = other[key];
        (applied as any)[key] = other[key];
      }
    });
    return applied;
  };

  /**
   * functions for drawing objects
   */
  drawVertex = (cx: any, drawingRect: any) => {
    // drawing ellipse around vertices
    if (this.selected) {
      let minTime = 100000000000;
      let maxTime = 0;
      let minVal = 100000000000;
      let maxVal = 0;
      this.vertices.forEach((vertex: any) => {
        const minLineWidth = this.lineWidth < 5 ? 5 : this.lineWidth;
        const radius = vertex.selected ? minLineWidth + 3 : minLineWidth + 1;
        cx.beginPath();
        cx.fillStyle = 'white';
        cx.ellipse(vertex.posX, vertex.posY, radius, radius, 0, 0, 2 * Math.PI);
        cx.fill();
        cx.beginPath();
        cx.fillStyle = 'black';
        cx.ellipse(vertex.posX, vertex.posY, radius - 2, radius - 2, 0, 0, 2 * Math.PI);
        cx.fill();

        if (this.type !== 7 && this.type !== 10 && vertex.selected) {
          // draw cross lines
          cx.lineWidth = 0.5;
          cx.setLineDash([5, 5]);
          cx.strokeStyle = 'white';
          cx.moveTo(vertex.posX, vertex.posY);
          cx.lineTo(drawingRect.width, vertex.posY);
          cx.moveTo(vertex.posX, vertex.posY);
          cx.lineTo(vertex.posX, drawingRect.height);
          cx.stroke();
          cx.setLineDash([]);
        }

        // get position of labels
        minTime = minTime < vertex.posX ? minTime : vertex.posX;
        maxTime = maxTime > vertex.posX ? maxTime : vertex.posX;
        minVal = minVal < vertex.posY ? minVal : vertex.posY;
        maxVal = maxVal > vertex.posY ? maxVal : vertex.posY;
      });
    }
  };

  fillRegion = (vertices: any, color: string, cx: any) => {
    cx.beginPath();
    if (this.lineStyle) {
      cx.setLineDash([4, 2]);
    } else {
      cx.setLineDash([]);
    }
    cx.fillStyle = color;
    cx.globalAlpha = 0.2;
    cx.moveTo(vertices[0].posX, vertices[0].posY);
    for (let index = 1; index < vertices.length; index++) {
      cx.lineTo(vertices[index].posX, vertices[index].posY);
    }
    cx.closePath();
    cx.fill();
    cx.globalAlpha = 1;
  };

  getPitchforkDrawPoints = (X1: any, X2: any, X3: any, chartRect: any) => {
    // get points for drawing lines
    const X4 = {
      posX: ((X2 as any).posX + (X3 as any).posX) / 2,
      posY: ((X2 as any).posY + (X3 as any).posY) / 2,
    };
    const X5 = {
      posX: ((X3 as any).posX + (X4 as any).posX) / 2,
      posY: ((X3 as any).posY + (X4 as any).posY) / 2,
    };
    const X6 = {
      posX: ((X2 as any).posX + (X4 as any).posX) / 2,
      posY: ((X2 as any).posY + (X4 as any).posY) / 2,
    };
    const X7 = {
      posX: (X5 as any).posX + ((X5 as any).posX - (X1 as any).posX),
      posY: (X5 as any).posY - ((X1 as any).posY - (X5 as any).posY),
    };
    const X8 = {
      posX: (X2 as any).posX + ((X4 as any).posX - (X1 as any).posX),
      posY: (X2 as any).posY - ((X1 as any).posY - (X4 as any).posY),
    };
    const X9 = {
      posX: (X7 as any).posX + ((X5 as any).posX - (X3 as any).posX),
      posY: (X7 as any).posY + ((X5 as any).posY - (X3 as any).posY),
    };
    const X10 = {
      posX: (X8 as any).posX - ((X2 as any).posX - (X6 as any).posX),
      posY: (X8 as any).posY - ((X2 as any).posY - (X6 as any).posY),
    };

    // get points for filling region
    const intersection1 = this.getIntersectionWithPanel(X3, X7, chartRect);
    const X11 = (X1 as any).posY > (X4 as any).posY ? intersection1[1] : intersection1[0];
    const intersection2 = this.getIntersectionWithPanel(X2, X8, chartRect);
    const X12 = (X1 as any).posY > (X4 as any).posY ? intersection2[1] : intersection2[0];

    return { X4, X5, X6, X7, X8, X9, X10, X11, X12 };
  };

  getChannelDrawPoints = (X1: any, X2: any, X3: any) => {
    const w1 = X3.posX - X1.posX;
    const h1 = X1.posY - X3.posY;
    const w2 = X2.posX - X1.posX;
    const h2 = X1.posY - X2.posY;
    if (w2 === 0) {
      return { X4: X3, X5: X3 };
    }
    const b = h1 - (w1 / w2) * h2;
    const X4 = {
      posX: X1.posX,
      posY: X1.posY - b,
    };
    const X5 = {
      posX: X2.posX,
      posY: X2.posY - b,
    };

    return { X4, X5 };
  };

  drawSegmentObject = (vertices: any, lineWidth: number, dashed: number, cx: any) => {
    if (dashed) {
      cx.setLineDash([4, 2]);
    } else {
      cx.setLineDash([]);
    }
    cx.beginPath();
    cx.strokeStyle = this.lineColor;
    cx.lineWidth = lineWidth;

    const X1 = vertices[0];
    const X2 = vertices[1];
    cx.moveTo((X1 as any).posX, (X1 as any).posY);
    cx.lineTo((X2 as any).posX, (X2 as any).posY);
    cx.stroke();
  };

  drawTrendLineObject = (cx: any, chartRect: any) => {
    if (this.lineStyle) {
      cx.setLineDash([4, 2]);
    } else {
      cx.setLineDash([]);
    }
    cx.beginPath();
    cx.strokeStyle = this.lineColor;
    cx.lineWidth = this.lineWidth;

    const X1 = this.vertices[0];
    const X2 = this.vertices[1];
    const intersection = this.getIntersectionWithPanel(X1, X2, chartRect);
    const X3 = intersection[0];
    const X4 = intersection[1];
    cx.moveTo((X3 as any).posX, (X3 as any).posY);
    cx.lineTo((X4 as any).posX, (X4 as any).posY);
    cx.stroke();
  };

  drawRayLineObject = (vertices: any, cx: any, chartRect: any) => {
    if (this.lineStyle) {
      cx.setLineDash([4, 2]);
    } else {
      cx.setLineDash([]);
    }
    cx.beginPath();
    cx.strokeStyle = this.lineColor;
    cx.lineWidth = this.lineWidth;

    const X1 = vertices[0];
    const X2 = vertices[1];
    const intersection = this.getIntersectionWithPanel(X1, X2, chartRect);
    const X3 = intersection[0];
    const X4 = intersection[1];
    cx.moveTo((X1 as any).posX, (X1 as any).posY);
    if ((X2 as any).posY < (X1 as any).posY) {
      cx.lineTo((X4 as any).posX, (X4 as any).posY);
    } else {
      cx.lineTo((X3 as any).posX, (X3 as any).posY);
    }
    cx.stroke();
  };

  drawArrowObject = (cx: any) => {
    if (this.lineStyle) {
      cx.setLineDash([4, 2]);
    } else {
      cx.setLineDash([]);
    }
    cx.beginPath();
    cx.strokeStyle = this.lineColor;
    cx.lineWidth = this.lineWidth;

    const X1 = this.vertices[0];
    const X2 = this.vertices[1];
    const arrowLen = 20;
    const deltaX = (X2 as any).posX - (X1 as any).posX;
    const deltaY = (X1 as any).posY - (X2 as any).posY;
    const degree1 = Math.atan(deltaY / deltaX);
    const degree2 = Math.PI / 8;
    const direction = (X1 as any).posX < (X2 as any).posX ? 1 : -1;
    const X3 = {
      posX: (X2 as any).posX - direction * arrowLen * Math.cos(degree1 + degree2),
      posY: (X2 as any).posY + direction * arrowLen * Math.sin(degree1 + degree2),
    };
    const X4 = {
      posX: (X2 as any).posX - direction * arrowLen * Math.cos(degree1 - degree2),
      posY: (X2 as any).posY + direction * arrowLen * Math.sin(degree1 - degree2),
    };

    // draw segment
    cx.moveTo((X1 as any).posX, (X1 as any).posY);
    cx.lineTo((X2 as any).posX, (X2 as any).posY);
    // draw arrow
    cx.moveTo((X2 as any).posX, (X2 as any).posY);
    cx.lineTo((X3 as any).posX, (X3 as any).posY);
    cx.moveTo((X2 as any).posX, (X2 as any).posY);
    cx.lineTo((X4 as any).posX, (X4 as any).posY);
    cx.stroke();
  };

  drawPolygonObject = (cx: CanvasRenderingContext2D) => {
    if (this.lineStyle) {
      cx.setLineDash([4, 2]);
    } else {
      cx.setLineDash([]);
    }
    cx.beginPath();
    cx.strokeStyle = this.lineColor;
    cx.lineWidth = this.lineWidth;
    cx.moveTo((this.vertices[0] as any).posX, (this.vertices[0] as any).posY);
    for (let i = 1; i < this.vertices.length; i++) {
      const vertex: any = this.vertices[i];
      cx.lineTo(vertex.posX, vertex.posY);
    }
    // make the object closed
    cx.closePath();
    cx.stroke();
    cx.fillStyle = '#E5EEFF';
    cx.fill();

    // drawing ellipse around vertices
    if (this.selected) {
      for (const vertex of this.vertices) {
        const radius = (vertex as any).selected ? this.lineWidth * 2 : this.lineWidth * 2 - 2;
        cx.beginPath();
        cx.fillStyle = 'white';
        cx.ellipse((vertex as any).posX, (vertex as any).posY, radius, radius, 0, 0, 2 * Math.PI);
        cx.fill();
        cx.beginPath();
        cx.fillStyle = 'black';
        cx.ellipse((vertex as any).posX, (vertex as any).posY, radius - 2, radius - 2, 0, 0, 2 * Math.PI);
        cx.fill();
      }
    }
  };

  drawPitchforkObject = (cx: any, chartRect: any) => {
    const curVertexLen = this.vertices.length;
    if (curVertexLen < 3) {
      this.drawRayLineObject(this.vertices, cx, chartRect);
    } else {
      // draw lines
      const X1 = this.vertices[0];
      const X2 = this.vertices[1];
      const X3 = this.vertices[2];
      const { X4, X5, X6, X7, X8, X9, X10, X11, X12 } = this.getPitchforkDrawPoints(X1, X2, X3, chartRect);
      this.drawSegmentObject([X2, X3], this.lineWidth, this.lineStyle, cx);
      this.drawRayLineObject([X1, X4], cx, chartRect);
      this.drawRayLineObject([X3, X7], cx, chartRect);
      this.drawRayLineObject([X2, X8], cx, chartRect);
      this.drawRayLineObject([X5, X9], cx, chartRect);
      this.drawRayLineObject([X6, X10], cx, chartRect);

      // fill region
      this.fillRegion([X3, X2, X12, X11], this.lineColor, cx);
    }
  };

  drawTextObject = (cx: any) => {
    const pos = this.vertices[0];
    cx.textBaseline = 'top';
    cx.fillStyle = this.color;
    cx.font = `${this.fontSize}px ${this.fontFamily}`;
    cx.fillText(this.text, (pos as any).posX, (pos as any).posY);
  };

  drawChannel = (cx: any) => {
    cx.setLineDash([]);
    cx.beginPath();
    cx.strokeStyle = this.lineColor;
    cx.lineWidth = this.lineWidth;
    const X1 = this.vertices[0] as any;
    const X2 = this.vertices[1] as any;
    this.drawSegmentObject([X1, X2], this.lineWidth, this.lineStyle, cx);
    if (this.vertices.length === 3) {
      const X3 = this.vertices[2] as any;
      const { X4, X5 } = this.getChannelDrawPoints(X1, X2, X3);
      X3.posX = (X4.posX + X5.posX) / 2;
      X3.posY = (X4.posY + X5.posY) / 2;
      this.drawSegmentObject([X4, X5], this.lineWidth, this.lineStyle, cx);
      this.fillRegion([X1, X2, X5, X4], this.lineColor, cx);
    }
  };

  drawFibonacci = (cx: any) => {
    cx.setLineDash([]);
    cx.beginPath();
    cx.fillStyle = this.color;
    cx.font = `12px ${this.fontFamily}`;
    const X1 = this.vertices[0] as any;
    const X2 = this.vertices[1] as any;
    const X3 = {
      posX: X2.posX,
      posY: X1.posY,
    };
    const X4 = {
      posX: X1.posX,
      posY: X2.posY,
    };
    const h = X1.posY - X2.posY;
    const minVal = Math.min(X1.pair.realVal, X2.pair.realVal);
    const maxVal = Math.max(X1.pair.realVal, X2.pair.realVal);
    const yRatioArr = [0.236, 0.382, 0.5, 0.618, 0.764];
    const colorArr = ['#E9C9C9', '#DEE9C9', '#C9E9DE', '#C9DEE9', '#DEE9C9', '#E9C9C9'];
    let prevX = {};
    let prevY = {};
    yRatioArr.forEach((yRatio: number, index: number) => {
      const curX = {
        posX: X1.posX,
        posY: X2.posY + yRatio * h,
      };
      const curY = {
        posX: X2.posX,
        posY: X2.posY + yRatio * h,
      };
      this.drawSegmentObject([curX, curY], 1, 0, cx);
      if (index === 0) {
        this.fillRegion([X2, X4, curX, curY], colorArr[index], cx);
      } else {
        this.fillRegion([prevY, prevX, curX, curY], colorArr[index], cx);
      }
      if (index === yRatioArr.length - 1) {
        this.fillRegion([X3, X1, curX, curY], colorArr[0], cx);
      }

      // draw labels around temp points
      const applyRatio = X1.posY > X2.posY ? yRatio : 1 - yRatio;
      const val = maxVal - (maxVal - minVal) * applyRatio;
      cx.fillText(`${yRatio.toFixed(3)} (${val.toFixed(2)})`, Math.min(curX.posX, curY.posX) - 100, curX.posY);

      prevX = curX;
      prevY = curY;
    });
    // draw labels around main points
    cx.fillText('1', Math.min(X1.posX, X3.posX) - 50, X1.posY);
    cx.fillText('0', Math.min(X4.posX, X2.posX) - 50, X2.posY);

    this.drawSegmentObject([X1, X2], 1, 1, cx);
    cx.lineWidth = this.lineWidth;
    this.drawSegmentObject([X1, X3], this.lineWidth, 0, cx);
    this.drawSegmentObject([X4, X2], this.lineWidth, 0, cx);
  };

  drawObject = (cx: any, chartRect: any) => {
    if (this.type === 2) {
      this.drawArrowObject(cx);
    } else if (this.type === 3) {
      this.drawRayLineObject(this.vertices, cx, chartRect);
    } else if (this.type === 4) {
      this.drawTrendLineObject(cx, chartRect);
    } else if (this.type === 5) {
      this.drawTrendLineObject(cx, chartRect);
    } else if (this.type === 6) {
      this.drawPitchforkObject(cx, chartRect);
    } else if (this.type === 7) {
      this.drawTextObject(cx);
    } else if (this.type === 8) {
      this.drawChannel(cx);
    } else if (this.type === 9) {
      this.drawFibonacci(cx);
    } else if (this.type === 10) {
      this.drawPolygonObject(cx);
    }

    if (this.type !== 7) {
      this.drawVertex(cx, chartRect);
    }
  };

  /**
   * functions for moving of vertices
   */
  setVertex = (curVertex: number, posX: number, posY: number, pair: any) => {
    const prevPos = this.vertices[curVertex] as any;
    // calculate and reset third vertex when moving former 2 vertices for channel
    if (this.type === 8 && curVertex < 2 && this.vertices.length === 3) {
      const X1 = this.vertices[0] as any;
      const X2 = this.vertices[1] as any;
      const X3 = this.vertices[2] as any;
      const { X4, X5 } = this.getChannelDrawPoints(X1, X2, X3);
      if (curVertex === 0) {
        X3.posX = (X5.posX + X4.posX - (prevPos.posX - posX)) / 2;
        X3.posY = (X5.posY + X4.posY - (prevPos.posY - posY)) / 2;
      } else {
        X3.posX = (X4.posX + X5.posX - (prevPos.posX - posX)) / 2;
        X3.posY = (X4.posY + X5.posY - (prevPos.posY - posY)) / 2;
      }
    }
    prevPos.posX = posX;
    prevPos.posY = posY;
    prevPos.pair = pair;
  };

  selectVertex = (val: boolean, index: number) => {
    (this.vertices[index] as any).selected = val;
  };

  selectVertices = (val: boolean) => {
    this.vertices.forEach((vertex: any) => {
      vertex.selected = val;
    });
  };

  moveVertices = (offsetX: number, offsetY: number, drawingRect: any, timeRange: any, candleData: any) => {
    this.vertices.forEach((vertex: any) => {
      vertex.posX = vertex.posX + offsetX;
      vertex.posY = vertex.posY + offsetY;
      // vertex.pair = getCurTimeValuePair(vertex, drawingRect, timeRange, candleData);
    });
  };

  scaleMoveVertices = (
    scaleRatioX: number,
    scaleRatioY1: number,
    scaleRatioY2: number,
    scaleBaseX: number,
    scaleBaseY1: number,
    scaleBaseY2: number,
    drawingRect: any,
    timeRange: any,
    candleData: any,
  ) => {
    this.vertices.forEach((vertex: any) => {
      vertex.posX = scaleBaseX - (scaleBaseX - vertex.posX) * scaleRatioX;
      vertex.posY = scaleBaseY1 + (vertex.posY - scaleBaseY1) * scaleRatioY1;
      vertex.posY = scaleBaseY2 - (scaleBaseY2 - vertex.posY) * scaleRatioY2;
      // vertex.pair = getCurTimeValuePair(vertex, drawingRect, timeRange, candleData);
    });
  };

  selectMyself = (val: boolean, vertexSelect: boolean) => {
    this.selected = val;
    if (vertexSelect) {
      this.selectVertices(val);
    }
  };

  /**
   * functions to check if object is selectable
   */
  getLineBounding = (X3: any, X4: any) => {
    const deltaX = (X4 as any).posX - (X3 as any).posX;
    const deltaY = (X3 as any).posY - (X4 as any).posY;
    const degree = Math.atan(deltaY / deltaX);
    const offsetX = (this.lineWidth / 2) * Math.sin(degree);
    const offsetY = (this.lineWidth / 2) * Math.cos(degree);
    return [
      {
        posX: (X3 as any).posX - offsetX,
        posY: (X3 as any).posY - offsetY,
      },
      {
        posX: (X3 as any).posX + offsetX,
        posY: (X3 as any).posY + offsetY,
      },
      {
        posX: (X4 as any).posX + offsetX,
        posY: (X4 as any).posY + offsetY,
      },
      {
        posX: (X4 as any).posX - offsetX,
        posY: (X4 as any).posY - offsetY,
      },
    ];
  };

  isHitInPath = (posX: number, posY: number, path: any, cx: any) => {
    cx.beginPath();
    cx.moveTo((path[0] as any).posX, (path[0] as any).posY);
    for (let i = 1; i < path.length; i++) {
      const vertex: any = path[i];
      cx.lineTo(vertex.posX, vertex.posY);
    }
    // make the object closed
    cx.closePath();
    return cx.isPointInPath(posX, posY);
  };

  isHitOnSegment = (posX: number, posY: number, X1: any, X2: any, cx: any) => {
    const path = this.getLineBounding(X1, X2);
    return this.isHitInPath(posX, posY, path, cx);
  };

  isHitOnRay = (posX: number, posY: number, X1: any, X2: any, cx: any, chartRect: any) => {
    const intersection = this.getIntersectionWithPanel(X1, X2, chartRect);
    const X3 = intersection[0];
    const X4 = intersection[1];
    let path = {};
    if ((X2 as any).posY < (X1 as any).posY) {
      path = this.getLineBounding(X1, X4);
    } else {
      path = this.getLineBounding(X1, X3);
    }
    return this.isHitInPath(posX, posY, path, cx);
  };

  isHitOnLine = (posX: number, posY: number, X1: any, X2: any, cx: any, chartRect: any) => {
    const intersection = this.getIntersectionWithPanel(X1, X2, chartRect);
    const X3 = intersection[0];
    const X4 = intersection[1];
    const path = this.getLineBounding(X3, X4);
    return this.isHitInPath(posX, posY, path, cx);
  };

  isHitOnEllipse = (posX: number, posY: number, circle: any) => {
    return Math.sqrt((posX - circle.posX) ** 2 + (posY - circle.posY) ** 2) < circle.radius;
  };

  isHitOnObject = (posX: number, posY: number, cx: any, chartRect: any) => {
    let selectedVertexTemp = -1;
    let selectedSegment = -1;
    let isObjectSelected = false;
    this.vertices.forEach((vertex: any, index: number) => {
      if (this.isHitOnEllipse(posX, posY, { ...vertex, radius: this.lineWidth * 2 })) {
        selectedVertexTemp = index;
      }
    });
    if (this.type === 2) {
      // arrow line
      isObjectSelected = this.isHitOnSegment(posX, posY, this.vertices[0], this.vertices[1], cx);
    } else if (this.type === 3) {
      // ray line
      isObjectSelected = this.isHitOnRay(posX, posY, this.vertices[0], this.vertices[1], cx, chartRect);
    } else if (this.type === 5 || this.type === 4) {
      // trend line, extended line
      isObjectSelected = this.isHitOnLine(posX, posY, this.vertices[0], this.vertices[1], cx, chartRect);
    } else if (this.type === 6) {
      const X1 = this.vertices[0];
      const X2 = this.vertices[1];
      const X3 = this.vertices[2];
      const { X4, X5, X6, X7, X8, X9, X10 } = this.getPitchforkDrawPoints(X1, X2, X3, chartRect);
      isObjectSelected =
        this.isHitOnSegment(posX, posY, X2, X3, cx) ||
        this.isHitOnRay(posX, posY, X1, X4, cx, chartRect) ||
        this.isHitOnRay(posX, posY, X3, X7, cx, chartRect) ||
        this.isHitOnRay(posX, posY, X2, X8, cx, chartRect) ||
        this.isHitOnRay(posX, posY, X5, X9, cx, chartRect) ||
        this.isHitOnRay(posX, posY, X6, X10, cx, chartRect);
    } else if (this.type === 7) {
      const X1 = this.vertices[0];
      const width = this.text.length * this.fontSize;
      const height = this.fontSize;
      const X2 = {
        posX: (X1 as any).posX + width,
        posY: (X1 as any).posY,
      };
      const X3 = {
        posX: (X1 as any).posX + width,
        posY: (X1 as any).posY + height,
      };
      const X4 = {
        posX: (X1 as any).posX,
        posY: (X1 as any).posY + height,
      };
      isObjectSelected = this.isHitInPath(posX, posY, [X1, X2, X3, X4], cx);
    } else if (this.type === 8) {
      const X1 = this.vertices[0];
      const X2 = this.vertices[1];
      const X3 = this.vertices[2];
      const { X4, X5 } = this.getChannelDrawPoints(X1, X2, X3);
      isObjectSelected = this.isHitInPath(posX, posY, [X1, X2, X5, X4], cx);
    } else if (this.type === 9) {
      const X1 = this.vertices[0] as any;
      const X2 = this.vertices[1] as any;
      const X3 = {
        posX: X2.posX,
        posY: X1.posY,
      };
      const X4 = {
        posX: X1.posX,
        posY: X2.posY,
      };
      isObjectSelected = this.isHitOnSegment(posX, posY, X1, X3, cx) || this.isHitOnSegment(posX, posY, X2, X4, cx);
    } else if (this.type === 10) {
      selectedSegment = this.vertices.findIndex(
        (vertex: any, index) => this.isHitOnSegment(
          posX,
          posY,
          vertex,
          this.vertices[index >= (this.vertices.length - 1) ? 0 : index + 1],
          cx
        )
      );
      isObjectSelected = selectedSegment >= 0;
    }
    return { selectedVertexTemp, isObjectSelected, selectedSegment };
  };
}

export const drawObjects = (objects: any, cx: any, chartRect: any, skip: number) => {
  objects.forEach((object: any, index: number) => index !== skip && object.drawObject(cx, chartRect));
};

export const selectObjects = (val: boolean, vertexSelect: boolean, objects: any) => {
  objects.forEach((object: any) => object.selectMyself(val, vertexSelect));
};

export const moveObjects = (offsetX: number, offsetY: number, objects: any) => {
  objects.forEach((object: any) => object.moveVertices(offsetX, offsetY));
};

export const getScaleBase = (chartRect: any) => {
  const scaleBaseX = chartRect.width; // right end of the chart canvas panel
  const candleRectHeight = chartRect.height * (69.976 / 100);
  const scaleBaseY1 = candleRectHeight * 0.202381;
  const scaleBaseY2 = candleRectHeight * (1 - 0.095238);
  return { scaleBaseX, scaleBaseY1, scaleBaseY2 };
};

export const scaledMoveObjects = (
  scaleRatioX: number,
  scaleRatioY1: number,
  scaleRatioY2: number,
  chartRect: object,
  objects: any,
  timeRange: any,
  candleData: any,
) => {
  const { scaleBaseX, scaleBaseY1, scaleBaseY2 } = getScaleBase(chartRect);
  objects.forEach((object: any) => {
    object.scaleMoveVertices(
      scaleRatioX,
      scaleRatioY1,
      scaleRatioY2,
      scaleBaseX,
      scaleBaseY1,
      scaleBaseY2,
      chartRect,
      timeRange,
      candleData,
    );
  });
};

export const getSelectedObject = (posX: number, posY: number, objects: any, cx: any, chartRect: any) => {
  let selectedObject = -1;
  let selectedVertex = -1;
  let selectedSegment = -1;

  for (let index = 0; index < objects.length; index++) {
    const object = objects[index];
    const { selectedVertexTemp, isObjectSelected, selectedSegment: selectedSegmentTemp } = object.isHitOnObject(posX, posY, cx, chartRect);
    
    // selected vertex or other part of the object
    if (selectedVertexTemp >= 0) {
      // selected vertex
      selectedVertex = selectedVertexTemp;
      selectedObject = index;
      break;
    } else if (isObjectSelected === true) {
      // selected, but not vertex
      selectedObject = index;
      selectedSegment = selectedSegmentTemp;
      break;
    }
  }
  return { selectedObject, selectedVertex, selectedSegment };
};

export const getLineWidth = (X: Vertex, Y: Vertex) => {
  const deltaX = X.posX - Y.posX;
  const deltaY = X.posY - Y.posY;
  return Math.sqrt(deltaX*deltaX + deltaY*deltaY);
}