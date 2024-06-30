import React, { useEffect, useRef } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import './App.css';

const DrawScreen = () => {
  const excalidrawRef = useRef(null);

  useEffect(() => {
    if (excalidrawRef.current) {
      // Perform any actions with the Excalidraw instance if needed
    }
  }, []);

  const initialData = {
    elements: [],
    appState: {
      viewBackgroundColor: 'transparent', // Ensure the background is transparent
    },
    files: {},
  };

  return (
    <div>
      <h1>Draw Screen</h1>
      <div style={{ height: '600px', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(frcfieldNoBG.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          zIndex: 1
        }} />
        <div style={{ height: '600px', zIndex: 2, position: 'relative' }}>
          <Excalidraw ref={excalidrawRef} initialData={initialData} />
        </div>
      </div>
    </div>
  );
};

export default DrawScreen;
