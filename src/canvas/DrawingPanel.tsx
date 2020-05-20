import React, { useEffect, useState, useRef, useCallback } from 'react';
import { DrawingObject, selectObjects, getSelectedObject, getLineWidth } from './DrawingApi';
import { SettingModal } from '../components/SettingModal';

const points = [
  { posX: 100, posY: 100, selected: false },
  { posX: 300, posY: 100, selected: false },
  { posX: 300, posY: 300, selected: false },
  { posX: 100, posY: 300, selected: false }
];

function DrawingPanel() {
  let chartRect = {
    width: 800,
    height: 800
  };

  const [openSettingModal, setOpenSettingModal] = useState(false);
  const [selected, setSelected] = useState({
    curSelectedSegment: -1,
    curSelectedObject: -1,
    curSelectedVertex: -1
  });
  const [params, setParams] = useState({
    width: 100
  });
  let drawingObjects = useRef<DrawingObject[]>([]);
  let cx = useRef<CanvasRenderingContext2D>();
  let canvasPanel = useRef<HTMLCanvasElement>();

  const setupCanvas = useCallback(() => {
    const can = document.querySelector('#custom-canvas') as HTMLCanvasElement;
    const dpr = window.devicePixelRatio || 1;
    const rect = can.getBoundingClientRect();
    can.width = rect.width * dpr;
    can.height = rect.height * dpr;

    const ctx = can.getContext('2d') as CanvasRenderingContext2D;
    ctx.scale(dpr, dpr);
    cx.current = ctx;
  }, []);

  const updateCanvas = useCallback(() => {
    (cx as any).current.clearRect(0, 0, chartRect.width, chartRect.height);
    drawingObjects.current.forEach(drawing => drawing.drawObject(cx.current, chartRect));
  }, [chartRect]);

  const initCanvasPanel = useCallback(() => {
    setupCanvas();
    updateCanvas();
  }, [updateCanvas, setupCanvas]);

  const handleClickOnPanel = useCallback((e: any) => {
    const { layerX, layerY } = e;

    selectObjects(false, true, drawingObjects.current);
    const { selectedObject, selectedVertex, selectedSegment } = getSelectedObject(
      layerX,
      layerY,
      drawingObjects.current,
      cx.current,
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
        const vertice = [...drawingObjects.current[selectedObject].vertices];
        const X = vertice[selectedSegment];
        const Y = vertice[selectedSegment >= vertice.length - 1 ? 0 : selectedSegment + 1];
        const width = getLineWidth(X, Y);
        setParams({ ...params, width });
        setOpenSettingModal(true);
      }
    } else {
      setOpenSettingModal(false);
    }
  }, [chartRect, params, selected, updateCanvas]);

  const applySetting = (value: number) => {
    const { curSelectedSegment, curSelectedObject } = selected;

    let vertice = [...drawingObjects.current[curSelectedObject].vertices];
    let X = vertice[curSelectedSegment];
    let Y = vertice[curSelectedSegment >= vertice.length - 1 ? 0 : curSelectedSegment + 1];

    if (X.posX === Y.posX) {
      const flag = X.posY < Y.posY ? 1 : -1;
      Y.posY = X.posY + flag * value;
    } else if (X.posY === Y.posY) {
      const flag = X.posX < Y.posX ? 1 : -1;
      Y.posX = X.posX + flag * value;
    }
    vertice[curSelectedSegment] = X;
    vertice[curSelectedSegment >= vertice.length - 1 ? 0 : curSelectedSegment + 1] = Y;
    drawingObjects.current[curSelectedObject].vertices = [...vertice];

    updateCanvas();
  };

  const setSettingValues = (apply: boolean, value: string) => {
    apply && applySetting(parseInt(value));
    setOpenSettingModal(false);
  }

  useEffect(() => {
    const newObjParams = {
      type: 10,
      color: '#fff',
      selected: true,
      vertexLen: points.length,
      lineColor: '#000',
      lineWidth: 5,
      lineStyle: 0,
      vertices: points
    };
    const newObj = new DrawingObject(newObjParams);
    drawingObjects.current.push(newObj);

    initCanvasPanel();
    
    canvasPanel.current = document.querySelector('#custom-canvas') as HTMLCanvasElement;
    canvasPanel.current.addEventListener('click', handleClickOnPanel);

    return () => {
      (canvasPanel.current as any).removeEventListener('click', handleClickOnPanel);
    }
  }, [handleClickOnPanel, initCanvasPanel]);

  return (
    <div>
      <canvas id="custom-canvas" style={chartRect}></canvas>
      {openSettingModal && (
        <SettingModal
          settingValues={params}
          setSettingValues={setSettingValues}
        />
      )}
    </div>
  )
}

export default DrawingPanel;