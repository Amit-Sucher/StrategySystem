import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Ensure the correct path to the CSS file
import DrawScreen from '../src/DrawScreen'; // Ensure the correct path to DrawScreen component

ReactDOM.render(
  <React.StrictMode>
    <DrawScreen />
  </React.StrictMode>,
  document.getElementById('root')
);
