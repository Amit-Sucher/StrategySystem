import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Image, Line } from 'react-konva';
import useImage from 'use-image';

const CanvasComponent = () => {
  const [image] = useImage('2024Field.png');
  const [lines, setLines] = React.useState([]);
  const isDrawing = useRef(false);

  const handleMouseDown = () => {
    isDrawing.current = true;
    const pos = stageRef.current.getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = () => {
    if (!isDrawing.current) return;
    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const stageRef = useRef();

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onMousemove={handleMouseMove}
      onMouseup={handleMouseUp}
      ref={stageRef}
    >
      <Layer>
        <Image image={image} />
        {lines.map((line, i) => (
          <Line
            key={i}
            points={line.points}
            stroke="#df4b26"
            strokeWidth={5}
            tension={0.5}
            lineCap="round"
            globalCompositeOperation="source-over"
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default CanvasComponent;
