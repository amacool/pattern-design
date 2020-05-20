import React, { useEffect, useState, useRef } from 'react';
import { DrawingObject, selectObjects, getSelectedObject } from './DrawingApi';
import { SettingModal } from '../components/SettingModal';

const points = [
  { posX: 100, posY: 100, selected: false },
  { posX: 300, posY: 100, selected: false },
  { posX: 300, posY: 300, selected: false },
  { posX: 100, posY: 300, selected: false }
];

function DrawingPanel() {
  let cx = {} as CanvasRenderingContext2D;
  let canvasPanel = {} as HTMLCanvasElement;
  // let drawingObjects = [] as DrawingObject[];
  let chartRect = {
    width: 500,
    height: 500
  };
  let settingValues = {};

  const [openSettingModal, setOpenSettingModal] = useState(false);
  const [selected, setSelected] = useState({
    curSelectedSegment: -1,
    curSelectedObject: -1,
    curSelectedVertex: -1
  });
  const drawingObjects = useRef<DrawingObject[]>([]);
  
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
    drawingObjects.current.push(newObj);

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
    drawingObjects.current.forEach(drawing => drawing.drawObject(cx, chartRect));
  };

  // const releaseCanvas = () => {
  //   setOpenSettingModal(false);
  //   selectObjects(false, true, drawObjects);
  //   updateCanvas();
  // };

  const initCanvasPanel = () => {
    setupCanvas();
    updateCanvas();
  };

  const handleClickOnPanel = (e: any) => {
    const { layerX, layerY } = e;

    selectObjects(false, true, drawingObjects.current);
    const { selectedObject, selectedVertex, selectedSegment } = getSelectedObject(
      layerX,
      layerY,
      drawingObjects.current,
      cx,
      chartRect,
    );
    
    if (selectedObject >= 0) {
      setSelected({ ...selected, curSelectedObject: selectedObject })
      drawingObjects.current[selectedObject].selectMyself(true, false);
      if (selectedVertex >= 0) {
        setSelected({
          ...selected,
          curSelectedObject: selectedObject,
          curSelectedVertex: selectedVertex
        });
        drawingObjects.current[selectedObject].selectVertex(true, selectedVertex);
        updateCanvas();
      } else if (selectedSegment >= 0) {
        setSelected({
          ...selected,
          curSelectedObject: selectedObject,
          curSelectedSegment: selectedSegment
        });
        setOpenSettingModal(true);
      }
    } else {
      setOpenSettingModal(false);
      // releaseCanvas();
    }
  }

  const applySetting = (value: number) => {
    const { curSelectedSegment, curSelectedObject } = selected;

    let vertice = [...drawingObjects.current[curSelectedObject].vertices];
    let X = vertice[curSelectedSegment];
    let Y = vertice[curSelectedSegment >= vertice.length - 1 ? 0 : curSelectedSegment + 1];

    if (X.posX === Y.posX) {
      Y.posY += value;
    } else if (X.posY === Y.posY) {
      const flag = X.posX < Y.posX ? 1 : -1;
      Y.posX += flag * value;
    }
    vertice[curSelectedSegment] = X;
    vertice[curSelectedSegment >= vertice.length - 1 ? 0 : curSelectedSegment + 1] = Y;
    drawingObjects.current[curSelectedObject].vertices = [...vertice];
  };

  const setSettingValues = (apply: boolean, value: string) => {
    apply && applySetting(parseInt(value));
  }

  return (
    <div>
      <h3>Here canvas starts: {openSettingModal && "segment selected"}</h3>
      <canvas id="custom-canvas" style={{ width: 500, height: 500 }}></canvas>
      {openSettingModal && (
        <SettingModal
          settingValues={settingValues}
          setSettingValues={setSettingValues}
        />
      )}
    </div>
  )
}

export default DrawingPanel;