import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import Papa from 'papaparse';
import h337 from 'heatmap.js';

function App() {
    const [data, setData] = useState([]);
    const [teamNumbers, setTeamNumbers] = useState(Array(6).fill(''));
    const [teamData, setTeamData] = useState(Array(6).fill(null));
    const heatmapContainerRef = useRef(null);
    const heatmapDotInstanceRef = useRef(null);
    const heatmapCloudInstanceRef = useRef(null);

    const fetchData = async () => {
        const publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRojRhLgZSPXJopPdni1V4Z-inXXY3a__2NaVMsoJHPs9d25ZQ7t56QX67mncr6yo-w4B8WCWyHFe2m/pub?output=csv';
        const cacheBuster = `cacheBuster=${new Date().getTime()}`;
        const urlWithCacheBuster = `${publicSpreadsheetUrl}&${cacheBuster}`;

        try {
            Papa.parse(urlWithCacheBuster, {
                download: true,
                header: true,
                complete: function(results) {
                    console.log('Fetched data:', results.data);
                    setData(results.data);
                },
                error: function(error) {
                    console.warn('Error fetching data from Google Sheets', error);
                }
            });
        } catch (error) {
            console.error('Fetching data failed', error);
        }
    };

    useEffect(() => {
        fetchData();

        const intervalId = setInterval(fetchData, 10000);

        return () => clearInterval(intervalId); // Clean up interval on unmount
    }, []);

    const createCustomHeatmap = (container, config) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        container.appendChild(canvas);

        const heatmapInstance = h337.create({
            container: container,
            ...config
        });

        return heatmapInstance;
    };

    useEffect(() => {
        if (heatmapContainerRef.current) {
            heatmapDotInstanceRef.current = createCustomHeatmap(heatmapContainerRef.current, {
                radius: 5, // Small radius for the solid dot
                maxOpacity: 1,
                minOpacity: 1,
                blur: 0,
                gradient: {
                    0.0: 'lime',
                    1.0: 'lime'
                }
            });

            heatmapCloudInstanceRef.current = createCustomHeatmap(heatmapContainerRef.current, {
                radius: 25, // Larger radius for the cloud
                maxOpacity: 0.6,
                minOpacity: 0.1,
                blur: 0.9, // Higher blur for the cloud effect
                gradient: {
                    0.0: 'lime',
                    1.0: 'lime'
                }
            });
        }

        return () => {
            // Clean up heatmap instances on unmount
            if (heatmapDotInstanceRef.current) {
                heatmapDotInstanceRef.current = null;
            }
            if (heatmapCloudInstanceRef.current) {
                heatmapCloudInstanceRef.current = null;
            }
        };
    }, []);

    const handleInputChange = (index, event) => {
        const input = event.target.value;
        const newTeamNumbers = [...teamNumbers];
        newTeamNumbers[index] = input;
        setTeamNumbers(newTeamNumbers);

        const newTeamData = newTeamNumbers.map(number => data.find(row => row['Teams'] === number) || null);
        setTeamData(newTeamData);
        updateHeatmap(newTeamData.filter(team => team && team.map));
    };

    const parseMapData = (mapString) => {
        const coordinatePairs = mapString.match(/\(\d+,\d+\)/g);
        if (!coordinatePairs) throw new Error('Invalid map data format');

        return coordinatePairs.map(pair => {
            const [x, y] = pair.slice(1, -1).split(',').map(Number);
            return { x, y, value: 1 };
        });
    };

    const updateHeatmap = (teamsData) => {
        if (!heatmapDotInstanceRef.current || !heatmapCloudInstanceRef.current) return;

        const fieldWidth = 10;
        const fieldHeight = 10;
        const imageWidth = 1000;
        const imageHeight = 500;

        const mapCoordinatesToImage = (fieldCoords, imgWidth, imgHeight, fieldWidth, fieldHeight) => {
            return fieldCoords.map(coord => ({
                x: (coord.x / fieldWidth) * imgWidth,
                y: (coord.y / fieldHeight) * imgHeight,
                value: 1
            }));
        };

        const imageCoordinates = teamsData.reduce((acc, team) => {
            if (team.map) {
                const coords = parseMapData(team.map);
                acc.push(...mapCoordinatesToImage(coords, imageWidth, imageHeight, fieldWidth, fieldHeight));
            }
            return acc;
        }, []);

        const data = {
            max: 1,
            data: imageCoordinates
        };

        heatmapDotInstanceRef.current.setData(data);
        heatmapCloudInstanceRef.current.setData(data);
    };

    return (
        <div className="app-container">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="input-container">
                    <input
                        type="text"
                        value={teamNumbers[index]}
                        onChange={(event) => handleInputChange(index, event)}
                        placeholder={`Enter team number ${index + 1}`}
                        className={`input-box ${index < 3 ? 'top-input' : 'bottom-input'}`}
                    />
                    {teamData[index] && (
                        <div className="team-data-container">
                            <div className="section-header">Auto</div>
                            <div className="grid-container">
                                <div className="grid-item">
                                    <span>AMP AUTO</span>
                                    <span>{teamData[index]?.['AMP AUTO']}</span>
                                </div>
                                <div className="grid-item">
                                    <span>SPEAKER AUTO</span>
                                    <span>{teamData[index]?.['SPEAKER AUTO']}</span>
                                </div>
                                <div className="grid-item">
                                    <span>mid notes</span>
                                    <span>{teamData[index]?.['mid notes']}</span>
                                </div>
                            </div>
                            <div className="section-header">Teleop</div>
                            <div className="grid-container">
                                <div className="grid-item">
                                    <span>Tele AMP</span>
                                    <span>{teamData[index]?.['tele AMP']}</span>
                                </div>
                                <div className="grid-item">
                                    <span>Missed AMP</span>
                                    <span>{teamData[index]?.['Missed AMP']}</span>
                                </div>
                                <div className="grid-item">
                                    <span>Tele Speaker</span>
                                    <span>{teamData[index]?.['tele Speaker']}</span>
                                </div>
                                <div className="grid-item">
                                    <span>Tele Missed Speaker</span>
                                    <span>{teamData[index]?.['tele Missed Speaker']}</span>
                                </div>
                                <div className="grid-item">
                                    <span>Defensive Pins</span>
                                    <span>{teamData[index]?.['Defensive Pins']}</span>
                                </div>
                            </div>
                            <div className="section-header">General</div>
                            <div className="grid-container">
                                <div className="grid-item">
                                    <span>Shot to Trap</span>
                                    <span>{teamData[index]?.['Shot to Trap']}</span>
                                </div>
                                <div className="grid-item">
                                    <span>Under Chain</span>
                                    <span>{teamData[index]?.['Under Chain']}</span>
                                </div>
                                <div className="grid-item">
                                    <span>Long Shot</span>
                                    <span>{teamData[index]?.['Long Shot']}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
            <div id="heatmapContainer" ref={heatmapContainerRef}>
                <img src="frcfieldNoBG.png" alt="FRC Field" style={{ width: '100%', height: '100%' }} />
            </div>
        </div>
    );
}

export default App;