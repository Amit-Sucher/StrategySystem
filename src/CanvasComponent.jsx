import React, { useRef, useState } from 'react';
import { Stage, Layer, Image, Line, Text } from 'react-konva';
import useImage from 'use-image';

const CanvasComponent = () => {
  const [image] = useImage('2024Field.png');
  const [lines, setLines] = useState([]);
  const [texts, setTexts] = useState([]);
  const [color, setColor] = useState('#df4b26');
  const [brushSize, setBrushSize] = useState(5);
  const [text, setText] = useState('');
  const [history, setHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);
  const [isEraserActive, setIsEraserActive] = useState(false);
  const isDrawing = useRef(false);

  const stageRef = useRef();

  const handleMouseDown = () => {
    isDrawing.current = true;
    const pos = stageRef.current.getPointerPosition();
    setHistory([...history, { lines, texts }]);
    setRedoHistory([]);
    if (isEraserActive) {
      handleErase(pos);
    } else {
      setLines([...lines, { points: [pos.x, pos.y], color, brushSize }]);
    }
  };

  const handleMouseMove = () => {
    if (!isDrawing.current || isEraserActive) return;
    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    setLines((prevLines) => {
      const lastLine = prevLines[prevLines.length - 1];
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      return [...prevLines.slice(0, -1), lastLine];
    });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleErase = (pos) => {
    const eraseRadius = brushSize;
    const isNearLine = (points, pos) => {
      for (let i = 0; i < points.length; i += 2) {
        const x = points[i];
        const y = points[i + 1];
        if (Math.abs(x - pos.x) < eraseRadius && Math.abs(y - pos.y) < eraseRadius) {
          return true;
        }
      }
      return false;
    };

    setLines((prevLines) =>
      prevLines.filter((line) => !isNearLine(line.points, pos))
    );

    const isNearText = (textPos, pos) =>
      Math.abs(textPos.x - pos.x) < eraseRadius && Math.abs(textPos.y - pos.y) < eraseRadius;

    setTexts((prevTexts) =>
      prevTexts.filter((text) => !isNearText({ x: text.x, y: text.y }, pos))
    );
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    setRedoHistory([{ lines, texts }, ...redoHistory]);
    const previousState = history[history.length - 1];
    setLines(previousState.lines);
    setTexts(previousState.texts);
    setHistory(history.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoHistory.length === 0) return;
    setHistory([...history, { lines, texts }]);
    const nextState = redoHistory[0];
    setLines(nextState.lines);
    setTexts(nextState.texts);
    setRedoHistory(redoHistory.slice(1));
  };

  const handleAddText = () => {
    const pos = stageRef.current.getPointerPosition();
    setHistory([...history, { lines, texts }]);
    setRedoHistory([]);
    setTexts([...texts, { text, x: pos.x, y: pos.y, fontSize: 20, color }]);
    setText('');
  };

  return (
    <div className="canvas-container">
      <Stage
        width={window.innerWidth * 0.8}
        height={window.innerHeight * 0.8}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ref={stageRef}
        style={{ border: '1px solid black', margin: '0 auto' }}
      >
        <Layer>
          <Image image={image} />
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.brushSize}
              tension={0.5}
              lineCap="round"
              globalCompositeOperation="source-over"
            />
          ))}
          {texts.map((txt, i) => (
            <Text
              key={i}
              text={txt.text}
              x={txt.x}
              y={txt.y}
              fontSize={txt.fontSize}
              fill={txt.color}
            />
          ))}
        </Layer>
      </Stage>
      <div className="controls">
        <button onClick={handleUndo}>Undo</button>
        <button onClick={handleRedo}>Redo</button>
        <div>
          <label>Brush Color: </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={isEraserActive}
          />
        </div>
        <div>
          <label>Brush Size: </label>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(e.target.value)}
          />
          {brushSize}
        </div>
        <div>
          <label>Text: </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isEraserActive}
          />
          <button onClick={handleAddText} disabled={isEraserActive}>
            Add Text
          </button>
        </div>
        <button onClick={() => setIsEraserActive(!isEraserActive)}>
          {isEraserActive ? 'Switch to Brush' : 'Switch to Eraser'}
        </button>
      </div>
      <style jsx>{`
        .canvas-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        .controls {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1rem;
        }
        button {
          padding: 0.5rem 1rem;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
};

export default CanvasComponent;
