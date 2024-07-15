import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import Papa from 'papaparse';
import h337 from 'heatmap.js';

function SingleTeam({ teamNumber, onTeamNumberChange, dataType, onDataTypeChange }) {
    const [data, setData] = useState([]);
    const [teamData, setTeamData] = useState(null);
    const [teamColors, setTeamColors] = useState({});
    const [loading, setLoading] = useState(false);
    const heatmapContainerRef = useRef(null);
    const heatmapDotInstanceRef = useRef(null);
    const heatmapCloudInstanceRef = useRef(null);

    const fetchData = async (sheetType) => {
        setLoading(true);
        let gid = '0';

        if (sheetType === 'lastMatch') {
            gid = '1877019773';
        } else if (sheetType === 'last3Matches') {
            gid = '1606759362';
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
                    setData(results.data);
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
        fetchTeamColors(teamNumber);

        const intervalId = setInterval(() => fetchData(dataType), 10000);

        return () => clearInterval(intervalId);
    }, [dataType]);

    useEffect(() => {
        const newTeamData = data.find((row) => row['Teams'] === teamNumber) || null;
        setTeamData(newTeamData);
        fetchTeamColors(teamNumber);
    }, [data, teamNumber]);

    useEffect(() => {
        if (heatmapContainerRef.current) {
            if (heatmapDotInstanceRef.current) heatmapDotInstanceRef.current.setData({ max: 1, data: [] });
            if (heatmapCloudInstanceRef.current) heatmapCloudInstanceRef.current.setData({ max: 1, data: [] });

            if (!heatmapDotInstanceRef.current) {
                heatmapDotInstanceRef.current = createCustomHeatmap(heatmapContainerRef.current, {
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
                heatmapDotInstanceRef.current.configure({
                    gradient: {
                        0.0: teamColors[teamNumber] || '#00FF00',
                        1.0: teamColors[teamNumber] || '#00FF00',
                    },
                });
            }

            if (!heatmapCloudInstanceRef.current) {
                heatmapCloudInstanceRef.current = createCustomHeatmap(heatmapContainerRef.current, {
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
                heatmapCloudInstanceRef.current.configure({
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

    const parseMapData = (mapString) => {
        const coordinatePairs = mapString.match(/\(\d+,\d+\)/g);
        if (!coordinatePairs) throw new Error('Invalid map data format');

        return coordinatePairs.map((pair) => {
            const [x, y] = pair.slice(1, -1).split(',').map(Number);
            return { x, y, value: 1 };
        });
    };

    const updateHeatmap = (teamData) => {
        if (!heatmapDotInstanceRef.current || !heatmapCloudInstanceRef.current) return;

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

            if (heatmapDotInstanceRef.current) {
                heatmapDotInstanceRef.current.setData(data);
            }
            if (heatmapCloudInstanceRef.current) {
                heatmapCloudInstanceRef.current.setData(data);
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
                            <div className="grid-item">
                                <span>Mid Notes</span>
                                <span>{teamData?.['mid notes']}</span>
                            </div>
                        </div>
                        <div className="section-header">Teleop</div>
                        <div className="grid-container">
                            <div className="grid-item">
                                <span>Tele AMP</span>
                                <span>{teamData?.['tele AMP']}</span>
                            </div>
                            <div className="grid-item">
                                <span>Missed AMP</span>
                                <span>{teamData?.['Missed AMP']}</span>
                            </div>
                            <div className="grid-item">
                                <span>Tele Speaker</span>
                                <span>{teamData?.['tele Speaker']}</span>
                            </div>
                            <div className="grid-item">
                                <span>Tele Missed Speaker</span>
                                <span>{teamData?.['tele Missed Speaker']}</span>
                            </div>
                            <div className="grid-item">
                                <span>Defensive Pins</span>
                                <span>{teamData?.['Defensive Pins']}</span>
                            </div>
                        </div>
                        <div className="section-header">General</div>
                        <div className="grid-container">
                            <div className="grid-item">
                                <span>Shot to Trap</span>
                                <span>{teamData?.['Shot to Trap']}</span>
                            </div>
                            <div className="grid-item">
                                <span>Under Chain</span>
                                <span>{teamData?.['Under Chain']}</span>
                            </div>
                            <div className="grid-item">
                                <span>Long Shot</span>
                                <span>{teamData?.['Long Shot']}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div id="heatmapContainer" ref={heatmapContainerRef}>
                <img src="frcfieldNoBG.png" alt="FRC Field" style={{ width: '100%', height: '100%' }} />
            </div>
        </div>
    );
}

export default SingleTeam;
