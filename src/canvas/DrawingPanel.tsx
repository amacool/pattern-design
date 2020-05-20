import React, { useEffect, useState } from 'react';
import { DrawingObject, selectObjects, getSelectedObject, drawObjects } from './DrawingApi';

const points = [
  { posX: 100, posY: 100, selected: false },
  { posX: 300, posY: 100, selected: false },
  { posX: 300, posY: 300, selected: false },
  { posX: 100, posY: 300, selected: false }
];

function DrawingPanel() {
  let cx = {} as CanvasRenderingContext2D;
  let canvasPanel = {} as HTMLCanvasElement;
  let drawingObjects = [] as DrawingObject[];
  let curSelectedSegment = -1;
  let chartRect = {
    width: 500,
    height: 500
  };

  const [openSettingModal, setOpenSettingModal] = useState(false);
  
  useEffect(() => {
    const newObjParams = {
      type: 10,
      color: '#fff',
      selected: true,
      vertexLen: points.length,
      lineColor: '',
      lineWidth: 4,
      lineStyle: 0,
      vertices: points
    };
    const newObj = new DrawingObject(newObjParams);
    drawingObjects.push(newObj);

    initCanvasPanel();
    
    canvasPanel = document.querySelector('#custom-canvas') as HTMLCanvasElement;
    canvasPanel.addEventListener('click', handleClickOnPanel);
    // canvasPanel.addEventListener('mousedown', handleMouseDownOnPanel);
    // canvasPanel.addEventListener('mousemove', handleMouseMoveOnPanel);
    // canvasPanel.addEventListener('mouseup', handleMouseUpOnPanel);
    // canvasPanel.addEventListener('dblclick', handleMouseDblClickOnPanel);

    return () => {
      canvasPanel.removeEventListener('click', handleClickOnPanel);
      // canvasPanel.removeEventListener('mousedown', handleMouseDownOnPanel);
      // canvasPanel.removeEventListener('mousemove', handleMouseMoveOnPanel);
      // canvasPanel.removeEventListener('mouseup', handleMouseUpOnPanel);
      // canvasPanel.removeEventListener('dblclick', handleMouseDblClickOnPanel);
    }
  }, []);

  const setupCanvas = () => {
    const can = document.querySelector('#custom-canvas') as HTMLCanvasElement;
    const dpr = window.devicePixelRatio || 1;
    const rect = can.getBoundingClientRect();
    can.width = rect.width * dpr;
    can.height = rect.height * dpr;

    const ctx = can.getContext('2d') as CanvasRenderingContext2D;
    ctx.scale(dpr, dpr);
    cx = ctx;
  };

  const updateCanvas = () => {
    cx.clearRect(0, 0, chartRect.width, chartRect.height);
    drawingObjects.forEach(drawing => drawing.drawObject(cx, chartRect));
  };

  const releaseCanvas = () => {
    setOpenSettingModal(false);
    selectObjects(false, true, drawObjects);
    updateCanvas();
  };

  const initCanvasPanel = () => {
    setupCanvas();
    updateCanvas();
  };

  const handleClickOnPanel = (e: any) => {
    const { layerX, layerY } = e;
    let curSelectedVertex = -1;
    let curSelectedObject = -1;

    selectObjects(false, true, drawingObjects);
    const { selectedObject, selectedVertex, selectedSegment } = getSelectedObject(
      layerX,
      layerY,
      drawingObjects,
      cx,
      chartRect,
    );
    curSelectedSegment = selectedSegment;
    console.log(selectedObject, selectedSegment);

    if (selectedObject >= 0) {
      curSelectedObject = selectedObject;
      drawingObjects[curSelectedObject].selectMyself(true, false);
      if (selectedVertex >= 0) {
        curSelectedVertex = selectedVertex;
        drawingObjects[curSelectedObject].selectVertex(true, selectedVertex);
      } else if (selectedSegment >= 0) {
        setOpenSettingModal(true);
        let vertice = [...drawingObjects[curSelectedObject].vertices];
        let X = vertice[selectedSegment];
        let Y = vertice[selectedSegment >= vertice.length - 1 ? 0 : selectedSegment + 1];
        console.log(X, Y);
        if (X.posX === Y.posX) {
          Y.posY += 50;
        } else if (X.posY === Y.posY) {
          const flag = X.posX < Y.posX ? 1 : -1;
          Y.posX += flag * 50;
        }
        vertice[selectedSegment] = X;
        vertice[selectedSegment >= vertice.length - 1 ? 0 : selectedSegment + 1] = Y;
        drawingObjects[curSelectedObject].vertices = [...vertice];
      }
      
      updateCanvas();
      return;
    } else {
      setOpenSettingModal(false);
      // releaseCanvas();
    }
  }

  return (
    <div>
      <h3>Here canvas starts: {openSettingModal && "segment selected"}</h3>
      <canvas id="custom-canvas" style={{ width: 500, height: 500 }}></canvas>
    </div>
  )
}

export default DrawingPanel;