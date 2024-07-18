import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import Papa from 'papaparse';
import h337 from 'heatmap.js';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

function TeamComparison({ teamNumbers, onTeamNumbersChange, dataType, onDataTypeChange }) {
    const [data, setData] = useState([]);
    const [allMatchesData, setAllMatchesData] = useState([[], []]);
    const [teamData, setTeamData] = useState([null, null]);
    const [teamColors, setTeamColors] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedField, setSelectedField] = useState('AMP AUTO'); // New state for selected field
    const heatmapContainerRef = useRef(null);
    const heatmapDotInstancesRef = useRef([null, null]);
    const heatmapCloudInstancesRef = useRef([null, null]);

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
                        setAllMatchesData((prevData) => {
                            const newData = [...prevData];
                            newData.forEach((_, index) => {
                                newData[index] = results.data.filter(row => row['Teams'] === teamNumbers[index]);
                            });
                            return newData;
                        });
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

    const fetchTeamColors = async (teamNumbers) => {
        const teams = teamNumbers.filter(Boolean).join('&team=');
        if (!teams) return;

        try {
            const response = await fetch(`https://api.frc-colors.com/v1/team?team=${teams}`);
            const data = await response.json();
            const colors = {};
            for (const team in data.teams) {
                const teamData = data.teams[team];
                if (teamData.colors) {
                    colors[team] = teamData.colors.primaryHex;
                } else {
                    colors[team] = '#00FF00';
                }
            }
            setTeamColors(colors);
        } catch (error) {
            console.error('Error fetching team colors:', error);
        }
    };

    useEffect(() => {
        fetchData(dataType);
        fetchData('allMatches');
        fetchTeamColors(teamNumbers);

        const intervalId = setInterval(() => {
            fetchData(dataType);
            fetchData('allMatches');
        }, 60000);

        return () => clearInterval(intervalId);
    }, [dataType, teamNumbers]);

    useEffect(() => {
        const newTeamData = teamNumbers.map((number) => data.find((row) => row['Teams'] === number) || null);
        setTeamData(newTeamData);
        fetchTeamColors(teamNumbers);
    }, [data, teamNumbers]);

    useEffect(() => {
        if (heatmapContainerRef.current) {
            heatmapDotInstancesRef.current.forEach((instance, index) => {
                if (instance) instance.setData({ max: 1, data: [] });
            });
            heatmapCloudInstancesRef.current.forEach((instance, index) => {
                if (instance) instance.setData({ max: 1, data: [] });
            });

            teamNumbers.forEach((teamNumber, index) => {
                if (!heatmapDotInstancesRef.current[index]) {
                    heatmapDotInstancesRef.current[index] = createCustomHeatmap(heatmapContainerRef.current, {
                        radius: 3,
                        maxOpacity: 1,
                        minOpacity: 1,
                        blur: 0,
                        gradient: {
                            0.0: teamColors[teamNumber] || '#00FF00',
                            1.0: teamColors[teamNumber] || '#00FF00',
                        },
                    });
                } else {
                    heatmapDotInstancesRef.current[index].configure({
                        gradient: {
                            0.0: teamColors[teamNumber] || '#00FF00',
                            1.0: teamColors[teamNumber] || '#00FF00',
                        },
                    });
                }

                if (!heatmapCloudInstancesRef.current[index]) {
                    heatmapCloudInstancesRef.current[index] = createCustomHeatmap(heatmapContainerRef.current, {
                        radius: 20,
                        maxOpacity: 0.6,
                        minOpacity: 0.1,
                        blur: 0.9,
                        gradient: {
                            0.0: teamColors[teamNumber] || '#00FF00',
                            1.0: teamColors[teamNumber] || '#00FF00',
                        },
                    });
                } else {
                    heatmapCloudInstancesRef.current[index].configure({
                        gradient: {
                            0.0: teamColors[teamNumber] || '#00FF00',
                            1.0: teamColors[teamNumber] || '#00FF00',
                        },
                    });
                }
            });
        }
    }, [teamColors]);

    const handleInputChange = (index, event) => {
        const input = event.target.value;
        onTeamNumbersChange(index, input);
    };

    const handleFieldChange = (event) => {
        setSelectedField(event.target.value);
    };

    const parseMapData = (mapString) => {
        const coordinatePairs = mapString.match(/\(\d+,\d+\)/g);
        if (!coordinatePairs) throw new Error('Invalid map data format');

        return coordinatePairs.map((pair) => {
            const [x, y] = pair.slice(1, -1).split(',').map(Number);
            return { x, y, value: 1 };
        });
    };

    const updateHeatmap = (teamData, index) => {
        if (!heatmapDotInstancesRef.current[index] || !heatmapCloudInstancesRef.current[index]) return;

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

        if (teamData && teamData.map) {
            const coords = parseMapData(teamData.map);
            const imageCoordinates = mapCoordinatesToImage(coords, imageWidth, imageHeight, fieldWidth, fieldHeight);

            const data = {
                max: 1,
                data: imageCoordinates,
            };

            if (heatmapDotInstancesRef.current[index]) {
                heatmapDotInstancesRef.current[index].setData(data);
            }
            if (heatmapCloudInstancesRef.current[index]) {
                heatmapCloudInstancesRef.current[index].setData(data);
            }
        }
    };

    useEffect(() => {
        updateHeatmap(teamData[0], 0);
        updateHeatmap(teamData[1], 1);
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
        labels: allMatchesData[0].map(row => `Match ${row['Match Number']}`),
        datasets: [
            {
                label: `${selectedField} - Team ${teamNumbers[0]}`,
                data: allMatchesData[0].map(row => parseInt(row[selectedField], 10) || 0),
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1,
            },
            {
                label: `${selectedField} - Team ${teamNumbers[1]}`,
                data: allMatchesData[1].map(row => parseInt(row[selectedField], 10) || 0),
                fill: false,
                borderColor: 'rgba(153, 102, 255, 1)',
                tension: 0.1,
            },
        ],
    };

    return (
        <div className="team-comparison-container">
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
            <div className="input-boxes-container">
                <div className="input-container">
                    <input
                        type="text"
                        value={teamNumbers[0]}
                        onChange={(event) => handleInputChange(0, event)}
                        placeholder="Enter team number 1"
                        className="input-box top-input"
                    />
                    {teamData[0] && (
                        <div className="team-data-container">
                            <div className="section-header">Auto</div>
                            <div className="grid-container">
                                <div className="grid-item">
                                    <span>AMP AUTO</span>
                                    <span>{teamData[0]?.['AMP AUTO']}</span>
                                </div>
                                <div className="grid-item">
                                    <span>SPEAKER AUTO</span>
                                    <span>{teamData[0]?.['SPEAKER AUTO']}</span>
                                </div>
                                <div className="grid-item">
                                    <span>Mid Notes</span>
                                    <span>{teamData[0]?.['mid notes']}</span>
                                </div>
                            </div>
                            <div className="section-header">Teleop</div>
                            <div className="grid-container">
                                <div className="grid-item">
                                    <span>Tele AMP</span>
                                    <span>{teamData[0]?.['tele AMP']}</span>
                                </div>
                                <div className="grid-item">
                                    <span>Missed AMP</span>
                                    <span>{teamData[0]?.['Missed AMP']}</span>
                                </div>
                                <div className="grid-item">
                                    <span>Tele Speaker</span>
                                    <span>{teamData[0]?.['tele Speaker']}</span>
                                </div>
                                <div className="grid-item">
                                    <span>Tele Missed Speaker</span>
                                    <span>{teamData[0]?.['tele Missed Speaker']}</span>
                                </div>
                                <div className="grid-item">
                                    <span>Defensive Pins</span>
                                    <span>{teamData[0]?.['Defensive Pins']}</span>
                                </div>
                            </div>
                            <div className="section-header">General</div>
                            <div className="grid-container">
                                <div className="grid-item">
                                    <span>Shot to Trap</span>
                                    <span>{teamData[0]?.['Shot to Trap']}</span>
                                </div>
                                <div className="grid-item">
                                    <span>Under Chain</span>
                                    <span>{teamData[0]?.['Under Chain']}</span>
                                </div>
                                <div className="grid-item">
                                    <span>Long Shot</span>
                                    <span>{teamData[0]?.['Long Shot']}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="input-container">
                    <input
                        type="text"
                        value={teamNumbers[1]}
                        onChange={(event) => handleInputChange(1, event)}
                        placeholder="Enter team number 2"
                        className="input-box top-input"
                    />
                    {teamData[1] && (
                        <div className="team-data-container">
                            <div className="section-header">Auto</div>
                            <div className="grid-container">
                                <div className="grid-item">
                                    <span>AMP AUTO</span>
                                    <span>{teamData[1]?.['AMP AUTO']}</span>
                                </div>
                                <div className="grid-item">
                                    <span>SPEAKER AUTO</span>
                                    <span>{teamData[1]?.['SPEAKER AUTO']}</span>
                                </div>
                                    <div className="grid-item">
                                        <span>Mid Notes</span>
                                        <span>{teamData[1]?.['mid notes']}</span>
                                    </div>
                                </div>
                                <div className="section-header">Teleop</div>
                                <div className="grid-container">
                                    <div className="grid-item">
                                        <span>Tele AMP</span>
                                        <span>{teamData[1]?.['tele AMP']}</span>
                                    </div>
                                    <div className="grid-item">
                                        <span>Missed AMP</span>
                                        <span>{teamData[1]?.['Missed AMP']}</span>
                                    </div>
                                    <div className="grid-item">
                                        <span>Tele Speaker</span>
                                        <span>{teamData[1]?.['tele Speaker']}</span>
                                    </div>
                                    <div className="grid-item">
                                        <span>Tele Missed Speaker</span>
                                        <span>{teamData[1]?.['tele Missed Speaker']}</span>
                                    </div>
                                    <div className="grid-item">
                                        <span>Defensive Pins</span>
                                        <span>{teamData[1]?.['Defensive Pins']}</span>
                                    </div>
                                </div>
                                <div className="section-header">General</div>
                                <div className="grid-container">
                                    <div className="grid-item">
                                        <span>Shot to Trap</span>
                                        <span>{teamData[1]?.['Shot to Trap']}</span>
                                    </div>
                                    <div className="grid-item">
                                        <span>Under Chain</span>
                                        <span>{teamData[1]?.['Under Chain']}</span>
                                    </div>
                                    <div className="grid-item">
                                        <span>Long Shot</span>
                                        <span>{teamData[1]?.['Long Shot']}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div id="heatmapContainer" ref={heatmapContainerRef}>
                    <img src="2024Field.png" alt="FRC Field" style={{ width: '100%', height: '100%' }} />
                </div>
                <div className="field-selection-container"> {/* New container for field selection dropdown */}
                    <select value={selectedField} onChange={handleFieldChange}>
                        <option value="AMP AUTO">Auto AMP</option>
                        <option value="SPEAKER AUTO">Auto Speaker</option>
                        <option value="mid notes">Mid Notes</option>
                        <option value="tele AMP">Tele AMP</option>
                        <option value="Missed AMP">Missed AMP</option>
                        <option value="tele Speaker">Tele Speaker</option>
                        <option value="tele Missed Speaker">Tele Missed Speaker</option>
                        <option value="Defensive Pins">Defensive Pins</option>
                        <option value="Shot to Trap">Shot to Trap</option>
                    </select>
                </div>
                <div className="chart-container">
                    <Line data={chartData} />
                </div>
            </div>
        );
    }
    
    export default TeamComparison;
    