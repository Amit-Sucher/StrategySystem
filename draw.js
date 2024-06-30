import React from 'react';
import ReactDOM from 'react-dom';
import '../src/index.css';
import DrawScreen from '../src/DrawScreen';
import reportWebVitals from '../src/reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <DrawScreen />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
