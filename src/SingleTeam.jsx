import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import Papa from 'papaparse';
import h337 from 'heatmap.js';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

function SingleTeam({ teamNumber, onTeamNumberChange, dataType, onDataTypeChange }) {
    const [data, setData] = useState([]);
    const [allMatchesData, setAllMatchesData] = useState([]);
    const [teamData, setTeamData] = useState(null);
    const [teamColors, setTeamColors] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedField, setSelectedField] = useState('AMP AUTO'); // New state for selected field
    const heatmapContainerRef = useRef(null);
    const heatmapSpeakerInstanceRef = useRef(null);
    const heatmapMissedInstanceRef = useRef(null);
    const heatmapAutoNotesInstanceRef = useRef(null);
    const heatmapDotInstanceRef = useRef(null); // Ensure dots are rendered last

    const fetchData = async (sheetType) => {
        setLoading(true);
        let gid = '564661292';

        if (sheetType === 'lastMatch') {
            gid = '1741346213';
        } else if (sheetType === 'last3Matches') {
            gid = '1660695738';
        } else if (sheetType === 'allMatches') {
            gid = '368108442';
        }

        const publicSpreadsheetUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRojRhLgZSPXJopPdni1V4Z-inXXY3a__2NaVMsoJHPs9d25ZQ7t56QX67mncr6yo-w4B8WCWyHFe2m/pub?output=csv&gid=${gid}`;
        const cacheBuster = `cacheBuster=${new Date().getTime()}`;
        const urlWithCacheBuster = `${publicSpreadsheetUrl}&${cacheBuster}`;

        try {
            Papa.parse(urlWithCacheBuster, {
                download: true,
                header: true,
                complete: function (results) {
                    console.log('Fetched data:', results.data);
                    if (sheetType === 'allMatches') {
                        setAllMatchesData(results.data);
                    } else {
                        setData(results.data);
                    }
                    setLoading(false);
                },
                error: function (error) {
                    console.warn('Error fetching data from Google Sheets', error);
                    setLoading(false);
                },
            });
        } catch (error) {
            console.error('Fetching data failed', error);
            setLoading(false);
        }
    };

    const fetchTeamColors = async (teamNumber) => {
        if (!teamNumber) return;

        try {
            const response = await fetch(`https://api.frc-colors.com/v1/team?team=${teamNumber}`);
            const data = await response.json();
            const colors = {};
            if (data.teams && data.teams[teamNumber] && data.teams[teamNumber].colors) {
                colors[teamNumber] = data.teams[teamNumber].colors.primaryHex;
            } else {
                colors[teamNumber] = '#00FF00';
            }
            setTeamColors(colors);
        } catch (error) {
            console.error('Error fetching team colors:', error);
        }
    };

    useEffect(() => {
        fetchData(dataType);
        fetchData('allMatches');
        fetchTeamColors(teamNumber);

        const intervalId = setInterval(() => {
            fetchData(dataType);
            fetchData('allMatches');
        }, 300000);  /* refresh every 5 minutes */

        return () => clearInterval(intervalId);
    }, [dataType]);

    useEffect(() => {
        const newTeamData = data.find((row) => row['Teams'] === teamNumber) || null;
        setTeamData(newTeamData);
        fetchTeamColors(teamNumber);
    }, [data, teamNumber]);

    useEffect(() => {
        if (heatmapContainerRef.current) {
            if (heatmapSpeakerInstanceRef.current) heatmapSpeakerInstanceRef.current.setData({ max: 1, data: [] });
            if (heatmapMissedInstanceRef.current) heatmapMissedInstanceRef.current.setData({ max: 1, data: [] });
            if (heatmapAutoNotesInstanceRef.current) heatmapAutoNotesInstanceRef.current.setData({ max: 1, data: [] });
            if (heatmapDotInstanceRef.current) heatmapDotInstanceRef.current.setData({ max: 1, data: [] });

            if (!heatmapSpeakerInstanceRef.current) {
                heatmapSpeakerInstanceRef.current = createCustomHeatmap(heatmapContainerRef.current, {
                    radius: 20,
                    maxOpacity: 0.6,
                    minOpacity: 0.1,
                    blur: 0.9,
                    gradient: {
                        0.0: 'green',
                        1.0: 'green',
                    },
                });
            } else {
                heatmapSpeakerInstanceRef.current.configure({
                    gradient: {
                        0.0: 'green',
                        1.0: 'green',
                    },
                });
            }

            if (!heatmapMissedInstanceRef.current) {
                heatmapMissedInstanceRef.current = createCustomHeatmap(heatmapContainerRef.current, {
                    radius: 20,
                    maxOpacity: 0.6,
                    minOpacity: 0.1,
                    blur: 0.9,
                    gradient: {
                        0.0: 'red',
                        1.0: 'red',
                    },
                });
            } else {
                heatmapMissedInstanceRef.current.configure({
                    gradient: {
                        0.0: 'red',
                        1.0: 'red',
                    },
                });
            }

            if (!heatmapAutoNotesInstanceRef.current) {
                heatmapAutoNotesInstanceRef.current = createCustomHeatmap(heatmapContainerRef.current, {
                    radius: 20,
                    maxOpacity: 0.6,
                    minOpacity: 0.1,
                    blur: 0.9,
                    gradient: {
                        0.0: 'blue',
                        1.0: 'blue',
                    },
                });
            } else {
                heatmapAutoNotesInstanceRef.current.configure({
                    gradient: {
                        0.0: 'blue',
                        1.0: 'blue',
                    },
                });
            }

            if (!heatmapDotInstanceRef.current) {
                heatmapDotInstanceRef.current = createCustomHeatmap(heatmapContainerRef.current, {
                    radius: 5, // Smaller dot size
                    maxOpacity: 1,
                    minOpacity: 1,
                    blur: 0,
                    gradient: {
                        0.0: teamColors[teamNumber] || '#00FF00',
                        1.0: teamColors[teamNumber] || '#00FF00',
                    },
                });
            } else {
                heatmapDotInstanceRef.current.configure({
                    gradient: {
                        0.0: teamColors[teamNumber] || '#00FF00',
                        1.0: teamColors[teamNumber] || '#00FF00',
                    },
                });
            }
        }
    }, [teamColors]);

    const handleInputChange = (event) => {
        onTeamNumberChange(event.target.value);
    };

    const handleFieldChange = (event) => {
        setSelectedField(event.target.value);
    };

    const parseMapData = (mapString) => {
        const coordinatePairs = mapString.match(/\(\d+:\d+\)/g); // Updated regex to match the new coordinate format
        if (!coordinatePairs) throw new Error('Invalid map data format');

        return coordinatePairs.map((pair) => {
            const [x, y] = pair.slice(1, -1).split(':').map(Number); // Updated to split by ':'
            return { x, y, value: 1 };
        });
    };

    const updateHeatmap = (teamData) => {
        if (!heatmapDotInstanceRef.current || !heatmapSpeakerInstanceRef.current || !heatmapMissedInstanceRef.current || !heatmapAutoNotesInstanceRef.current) return;

        const fieldWidth = 10;
        const fieldHeight = 10;
        const imageWidth = 1000;
        const imageHeight = 500;

        const mapCoordinatesToImage = (fieldCoords, imgWidth, imgHeight, fieldWidth, fieldHeight) => {
            return fieldCoords.map((coord) => ({
                x: (coord.x / fieldWidth) * imgWidth,
                y: (coord.y / fieldHeight) * imgHeight,
                value: 1,
            }));
        };

        if (teamData) {
            const speakerCoords = teamData['Speaker Coordinates'] ? parseMapData(teamData['Speaker Coordinates']) : [];
            const missedCoords = teamData['Missed Coordinates'] ? parseMapData(teamData['Missed Coordinates']) : [];
            const autoNotesCoords = teamData['Auto Picked Notes Coordinates'] ? parseMapData(teamData['Auto Picked Notes Coordinates']) : [];

            const speakerImageCoords = mapCoordinatesToImage(speakerCoords, imageWidth, imageHeight, fieldWidth, fieldHeight);
            const missedImageCoords = mapCoordinatesToImage(missedCoords, imageWidth, imageHeight, fieldWidth, fieldHeight);
            const autoNotesImageCoords = mapCoordinatesToImage(autoNotesCoords, imageWidth, imageHeight, fieldWidth, fieldHeight);

            if (heatmapSpeakerInstanceRef.current) {
                heatmapSpeakerInstanceRef.current.setData({ max: 1, data: speakerImageCoords });
            }
            if (heatmapMissedInstanceRef.current) {
                heatmapMissedInstanceRef.current.setData({ max: 1, data: missedImageCoords });
            }
            if (heatmapAutoNotesInstanceRef.current) {
                heatmapAutoNotesInstanceRef.current.setData({ max: 1, data: autoNotesImageCoords });
            }
            if (heatmapDotInstanceRef.current) {
                heatmapDotInstanceRef.current.setData({ max: 1, data: [...speakerImageCoords, ...missedImageCoords, ...autoNotesImageCoords] });
            }
        }
    };

    useEffect(() => {
        updateHeatmap(teamData);
    }, [teamData, teamColors]);

    const createCustomHeatmap = (container, config) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        container.appendChild(canvas);

        const heatmapInstance = h337.create({
            container: container,
            ...config,
        });

        return heatmapInstance;
    };

    // Prepare data for the line chart
    const chartData = {
        labels: allMatchesData.filter(row => row['Teams'] === teamNumber).map(row => `Match ${row['Match Number']}`),
        datasets: [
            {
                label: `${selectedField} - Team ${teamNumber}`,
                data: allMatchesData.filter(row => row['Teams'] === teamNumber).map(row => parseInt(row[selectedField], 10) || 0),
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1,
            },
        ],
    };

    return (
        <div className="single-team-container">
            <div className="dropdown-container">
                <select value={dataType} onChange={onDataTypeChange}>
                    <option value="average">Average data</option>
                    <option value="lastMatch">Last match data</option>
                    <option value="last3Matches">Last 3 matches data</option>
                </select>
            </div>
            {loading && (
                <div className="spinner-container">
                    <div className="spinner"></div>
                </div>
            )}
            <div className="input-container">
                <input
                    type="text"
                    value={teamNumber}
                    onChange={handleInputChange}
                    placeholder="Enter team number"
                    className="input-box top-input"
                />
                {teamData && (
                    <div className="team-data-container">
                        <div className="section-header">Auto</div>
                        <div className="grid-container">
                            <div className="grid-item">
                                <span>AMP AUTO</span>
                                <span>{teamData?.['AMP AUTO']}</span>
                            </div>
                            <div className="grid-item">
                                <span>SPEAKER AUTO</span>
                                <span>{teamData?.['SPEAKER AUTO']}</span>
                            </div>
                        </div>
                        <div className="section-header">Teleop</div>
                        <div className="grid-container">
                            <div className="grid-item">
                                <span>tele AMP</span>
                                <span>{teamData?.['tele AMP']}</span>
                            </div>
                            <div className="grid-item">
                                <span>tele Speaker</span>
                                <span>{teamData?.['tele Speaker']}</span>
                            </div>
                            <div className="grid-item">
                                <span>Defensive Pins</span>
                                <span>{teamData?.['Defensive Pins']}</span>
                            </div>
                            <div className="grid-item">
                                <span>Missed Shots</span>
                                <span>{teamData?.['Missed Shots']}</span>
                            </div>
                            <div className="grid-item">
                                <span>Shot to Trap</span>
                                <span>{teamData?.['Shot to Trap']}</span>
                            </div>
                        </div>
                        <div className="section-header">General</div>
                        <div className="grid-container">
                            <div className="grid-item">
                                <span>Climbed</span>
                                <span>{teamData?.['Climbed']}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div id="heatmapContainer" ref={heatmapContainerRef}>
                <img src="2024Field.png" alt="FRC Field" style={{ width: '100%', height: '100%' }} />
            </div>
            <div className="field-selection-container"> {/* New container for field selection dropdown */}
                <select value={selectedField} onChange={handleFieldChange}>
                    <option value="AMP AUTO">Auto AMP</option>
                    <option value="SPEAKER AUTO">Auto Speaker</option>
                    <option value="tele AMP">Tele AMP</option>
                    <option value="tele Speaker">Tele Speaker</option>
                    <option value="Defensive Pins">Defensive Pins</option>
                    <option value="Missed Shots">Missed Shots</option>
                    <option value="Shot to Trap">Shot to Trap</option>
                    <option value="Climbed">Climbed</option>
                </select>
            </div>
            <div className="chart-container" style={{ width: '1000px', height: '550px' }}>
                <Line data={chartData} />
            </div>
        </div>
    );
}

export default SingleTeam;
