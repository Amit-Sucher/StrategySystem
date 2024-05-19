import React, { useEffect, useState } from 'react';
import './App.css';
import Papa from 'papaparse';

function App() {
    const [data, setData] = useState([]);



    return (
        <div>
            <svg width={1920} height={1000}>
                <g>
                    {rectangleMaker(500, 250, 30, 100, "#bcd5f7", "blue1", data)}
                    {rectangleMaker(500, 250, 30, 400, "#f7bcbc", "red1", data)}
                    {rectangleMaker(500, 250, 600, 100, "#bcd5f7", "blue2", data)}
                    {rectangleMaker(500, 250, 600, 400, "#f7bcbc", "red2", data)}
                    {rectangleMaker(500, 250, 1170, 100, "#bcd5f7", "blue3", data)}
                    {rectangleMaker(500, 250, 1170, 400, "#f7bcbc", "red3", data)}
                    {rectangleMakerGray(1640, 250, 30, 700, "#e3e2e2", "general", data)}
                </g>
            </svg>
        </div>
    );
}

function rectangleMaker(width, height, x, y, color, id, data) {
    return (
        <svg key={id} width={1920} height={1000}>
            <rect width={width} height={height} x={x} y={y} rx="20" ry="20" fill={color} />
            <foreignObject x={x + 10} y={y + 10} width="50" height="30">
                <input type="text" id={id} name={id} className="rounded-input" />
            </foreignObject>
            <foreignObject x={x + 390} y={y - 15} width="90" height="1000">
                <h2>Auto:</h2>
            </foreignObject>
            <foreignObject x={x + 390} y={y + 20} width="90" height="1000">
                <h4>Amp:</h4>
            </foreignObject>
            <foreignObject x={x + 270} y={y + 20} width="90" height="1000">
                <h4>Speaker:</h4>
            </foreignObject>
            <line x1={x} y1={y + 75} x2={x + width} y2={y + 75} stroke="black" strokeWidth="2" />
            <foreignObject x={x + 390} y={y + 60} width="90" height="1000">
                <h2>Speaker:</h2>
            </foreignObject>
            <foreignObject x={x + 390} y={y + 95} width="90" height="1000">
                <h4>Amp:</h4>
            </foreignObject>
            <foreignObject x={x + 270} y={y + 95} width="90" height="1000">
                <h4>Speaker:</h4>
            </foreignObject>
            <foreignObject x={x + 145} y={y + 95} width="90" height="1000">
                <h4>Pins:</h4>
            </foreignObject>
        </svg>
    );
}

function rectangleMakerGray(width, height, x, y, color, id, data) {
    return (
        <svg key={id} width={1920} height={1000}>
            <rect width={width} height={height} x={x} y={y} rx="20" ry="20" fill={color} />
            <foreignObject x={x + 390} y={y - 15} width="90" height="1000">
                <h2>כחול:</h2>
            </foreignObject>
            <foreignObject x={x + 390} y={y + 20} width="90" height="1000">
                <h4>Amp:</h4>
            </foreignObject>
            <foreignObject x={x + 270} y={y + 20} width="90" height="1000">
                <h4>Speaker:</h4>
            </foreignObject>
            <line x1={x} y1={y + 75} x2={x + width} y2={y + 75} stroke="black" strokeWidth="2" />
            <foreignObject x={x + 390} y={y + 60} width="90" height="1000">
                <h2>Teleop:</h2>
            </foreignObject>
            <foreignObject x={x + 390} y={y + 95} width="90" height="1000">
                <h4>Amp:</h4>
            </foreignObject>
            <foreignObject x={x + 270} y={y + 95} width="90" height="1000">
                <h4>Speaker:</h4>
            </foreignObject>
            <foreignObject x={x + 145} y={y + 95} width="90" height="1000">
                <h4>Pins:</h4>
            </foreignObject>
        </svg>
    );
}

export default App;
