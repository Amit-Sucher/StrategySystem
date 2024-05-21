import React, { useEffect, useState } from 'react';
import './App.css';
import Papa from 'papaparse';

function App() {
    const [data, setData] = useState([]);
    const [teamNumbers, setTeamNumbers] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            const publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRojRhLgZSPXJopPdni1V4Z-inXXY3a__2NaVMsoJHPs9d25ZQ7t56QX67mncr6yo-w4B8WCWyHFe2m/pub?output=csv';
            Papa.parse(publicSpreadsheetUrl, {
                download: true,
                header: true,
                complete: function(results) {
                    console.log('Fetched data:', results.data); // Console log to verify data fetching
                    setData(results.data);
                },
                error: function(error) {
                    console.warn('Error fetching data from Google Sheets', error);
                }
            });
        };

        fetchData();
    }, []);

    const handleInputChange = (event, id) => {
        setTeamNumbers({
            ...teamNumbers,
            [id]: event.target.value
        });
    };

    return (
        <div>
            <svg width={1920} height={1000}>
                <g>
                    {rectangleMaker(500, 250, 30, 100, "#bcd5f7", "blue1", data, teamNumbers, handleInputChange)}
                    {rectangleMaker(500, 250, 30, 400, "#f7bcbc", "red1", data, teamNumbers, handleInputChange)}
                    {rectangleMaker(500, 250, 600, 100, "#bcd5f7", "blue2", data, teamNumbers, handleInputChange)}
                    {rectangleMaker(500, 250, 600, 400, "#f7bcbc", "red2", data, teamNumbers, handleInputChange)}
                    {rectangleMaker(500, 250, 1170, 100, "#bcd5f7", "blue3", data, teamNumbers, handleInputChange)}
                    {rectangleMaker(500, 250, 1170, 400, "#f7bcbc", "red3", data, teamNumbers, handleInputChange)}
                    {rectangleMakerGray(1640, 250, 30, 700, "#e3e2e2", "general", data)}
                </g>
            </svg>
        </div>
    );
}

function rectangleMaker(width, height, x, y, color, id, data, teamNumbers, handleInputChange) {
    const teamNumber = teamNumbers[id];
    const teamData = data.find(row => row['A'] === teamNumber); // Assume 'A' is the column name for team numbers

    // Display data for specific labels
    const ampData = teamData ? teamData['Amp'] : ''; // Replace 'Amp' with the actual column name
    const speakerData = teamData ? teamData['Speaker'] : ''; // Replace 'Speaker' with the actual column name
    const pinsData = teamData ? teamData['Pins'] : ''; // Replace 'Pins' with the actual column name

    return (
        <svg key={id} width={1920} height={1000}>
            <rect width={width} height={height} x={x} y={y} rx="20" ry="20" fill={color} />
            <foreignObject x={x + 10} y={y + 10} width="50" height="30">
                <input 
                    type="text" 
                    id={id} 
                    name={id} 
                    className="rounded-input" 
                    value={teamNumbers[id] || ''} 
                    onChange={(event) => handleInputChange(event, id)} 
                />
            </foreignObject>
            <foreignObject x={x + 390} y={y - 15} width="90" height="1000">
                <h2>Auto:</h2>
            </foreignObject>
            <foreignObject x={x + 390} y={y + 20} width="90" height="1000">
                <h4>Amp:</h4>
                <p>{ampData}</p>
            </foreignObject>
            <foreignObject x={x + 270} y={y + 20} width="90" height="1000">
                <h4>Speaker:</h4>
                <p>{speakerData}</p>
            </foreignObject>
            <line x1={x} y1={y + 75} x2={x + width} y2={y + 75} stroke="black" strokeWidth="2" />
            <foreignObject x={x + 390} y={y + 60} width="90" height="1000">
                <h2>Speaker:</h2>
            </foreignObject>
            <foreignObject x={x + 390} y={y + 95} width="90" height="1000">
                <h4>Amp:</h4>
                <p>{ampData}</p>
            </foreignObject>
            <foreignObject x={x + 270} y={y + 95} width="90" height="1000">
                <h4>Speaker:</h4>
                <p>{speakerData}</p>
            </foreignObject>
            <foreignObject x={x + 145} y={y + 95} width="90" height="1000">
                <h4>Pins:</h4>
                <p>{pinsData}</p>
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

export default App;
