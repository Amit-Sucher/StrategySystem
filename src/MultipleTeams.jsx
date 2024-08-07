import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import Papa from 'papaparse';
import h337 from 'heatmap.js';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { LinearProgress, Box, Typography } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

function MultipleTeams({ teamNumbers, onTeamNumbersChange, dataType, onDataTypeChange }) {
    const [data, setData] = useState([]);
    const [teamData, setTeamData] = useState(Array(6).fill(null));
    const [teamColors, setTeamColors] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedAlliance, setSelectedAlliance] = useState('blue'); // Red or Blue alliance
    const heatmapContainerRef = useRef(null);
    const heatmapSpeakerInstancesRef = useRef({});
    const heatmapMissedInstancesRef = useRef({});
    const heatmapAutoNotesInstancesRef = useRef({});
    const heatmapDotInstancesRef = useRef({}); // Ensure dots are rendered last

    const fetchData = async (sheetType) => {
        setLoading(true);
        let gid = '564661292';

        if (sheetType === 'lastMatch') {
            gid = '1741346213';
        } else if (sheetType === 'last3Matches') {
            gid = '1660695738';
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
        fetchTeamColors(teamNumbers);

        const intervalId = setInterval(() => fetchData(dataType), 60000); /* refresh every 60 seconds */

        return () => clearInterval(intervalId);
    }, [dataType]);

    useEffect(() => {
        const newTeamData = teamNumbers.map((number) => data.find((row) => row['Teams'] === number) || null);
        setTeamData(newTeamData);
        fetchTeamColors(teamNumbers);
    }, [data, teamNumbers]);

    useEffect(() => {
        if (heatmapContainerRef.current) {
            Object.values(heatmapSpeakerInstancesRef.current).forEach((instance) => instance.setData({ max: 1, data: [] }));
            Object.values(heatmapMissedInstancesRef.current).forEach((instance) => instance.setData({ max: 1, data: [] }));
            Object.values(heatmapAutoNotesInstancesRef.current).forEach((instance) => instance.setData({ max: 1, data: [] }));
            Object.values(heatmapDotInstancesRef.current).forEach((instance) => instance.setData({ max: 1, data: [] }));

            teamNumbers.forEach((team) => {
                if (!heatmapSpeakerInstancesRef.current[team]) {
                    heatmapSpeakerInstancesRef.current[team] = createCustomHeatmap(heatmapContainerRef.current, {
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
                    heatmapSpeakerInstancesRef.current[team].configure({
                        gradient: {
                            0.0: 'green',
                            1.0: 'green',
                        },
                    });
                }

                if (!heatmapMissedInstancesRef.current[team]) {
                    heatmapMissedInstancesRef.current[team] = createCustomHeatmap(heatmapContainerRef.current, {
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
                    heatmapMissedInstancesRef.current[team].configure({
                        gradient: {
                            0.0: 'red',
                            1.0: 'red',
                        },
                    });
                }

                if (!heatmapAutoNotesInstancesRef.current[team]) {
                    heatmapAutoNotesInstancesRef.current[team] = createCustomHeatmap(heatmapContainerRef.current, {
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
                    heatmapAutoNotesInstancesRef.current[team].configure({
                        gradient: {
                            0.0: 'blue',
                            1.0: 'blue',
                        },
                    });
                }

                if (!heatmapDotInstancesRef.current[team]) {
                    heatmapDotInstancesRef.current[team] = createCustomHeatmap(heatmapContainerRef.current, {
                        radius: 5, // Smaller dot size
                        maxOpacity: 1,
                        minOpacity: 1,
                        blur: 0,
                        gradient: {
                            0.0: teamColors[team] || '#00FF00',
                            1.0: teamColors[team] || '#00FF00',
                        },
                    });
                } else {
                    heatmapDotInstancesRef.current[team].configure({
                        gradient: {
                            0.0: teamColors[team] || '#00FF00',
                            1.0: teamColors[team] || '#00FF00',
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

    const parseMapData = (mapString) => {
        const coordinatePairs = mapString.match(/\(\d+:\d+\)/g); // Updated regex to match the new coordinate format
        if (!coordinatePairs) throw new Error('Invalid map data format');

        return coordinatePairs.map((pair) => {
            const [x, y] = pair.slice(1, -1).split(':').map(Number); // Updated to split by ':'
            return { x, y, value: 1 };
        });
    };

    const updateHeatmap = (teamsData) => {
        if (!heatmapDotInstancesRef.current || !heatmapSpeakerInstancesRef.current || !heatmapMissedInstancesRef.current || !heatmapAutoNotesInstancesRef.current) return;

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

        Object.values(heatmapSpeakerInstancesRef.current).forEach((instance) => instance.setData({ max: 1, data: [] }));
        Object.values(heatmapMissedInstancesRef.current).forEach((instance) => instance.setData({ max: 1, data: [] }));
        Object.values(heatmapAutoNotesInstancesRef.current).forEach((instance) => instance.setData({ max: 1, data: [] }));
        Object.values(heatmapDotInstancesRef.current).forEach((instance) => instance.setData({ max: 1, data: [] }));

        teamsData.forEach((team) => {
            if (team) {
                const speakerCoords = team['Speaker Coordinates'] ? parseMapData(team['Speaker Coordinates']) : [];
                const missedCoords = team['Missed Coordinates'] ? parseMapData(team['Missed Coordinates']) : [];
                const autoNotesCoords = team['Auto Picked Notes Coordinates'] ? parseMapData(team['Auto Picked Notes Coordinates']) : [];

                const speakerImageCoords = mapCoordinatesToImage(speakerCoords, imageWidth, imageHeight, fieldWidth, fieldHeight);
                const missedImageCoords = mapCoordinatesToImage(missedCoords, imageWidth, imageHeight, fieldWidth, fieldHeight);
                const autoNotesImageCoords = mapCoordinatesToImage(autoNotesCoords, imageWidth, imageHeight, fieldWidth, fieldHeight);

                if (heatmapSpeakerInstancesRef.current[team['Teams']]) {
                    heatmapSpeakerInstancesRef.current[team['Teams']].setData({ max: 1, data: speakerImageCoords });
                }
                if (heatmapMissedInstancesRef.current[team['Teams']]) {
                    heatmapMissedInstancesRef.current[team['Teams']].setData({ max: 1, data: missedImageCoords });
                }
                if (heatmapAutoNotesInstancesRef.current[team['Teams']]) {
                    heatmapAutoNotesInstancesRef.current[team['Teams']].setData({ max: 1, data: autoNotesImageCoords });
                }
                if (heatmapDotInstancesRef.current[team['Teams']]) {
                    heatmapDotInstancesRef.current[team['Teams']].setData({ max: 1, data: [...speakerImageCoords, ...missedImageCoords, ...autoNotesImageCoords] });
                }
            }
        });
    };

    useEffect(() => {
        updateHeatmap(teamData.filter((_, index) => selectedAlliance === 'blue' ? index < 3 : index >= 3));
    }, [teamData, teamColors, selectedAlliance]);

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

    const generateChartData = (dataKey) => {
        const topTeamsData = teamData.slice(0, 3).map(team => parseInt(team?.[dataKey] || 0));
        const bottomTeamsData = teamData.slice(3).map(team => parseInt(team?.[dataKey] || 0));

        const totalTop = topTeamsData.reduce((a, b) => a + b, 0);
        const totalBottom = bottomTeamsData.reduce((a, b) => a + b, 0);

        return {
            labels: ['Top 3 Teams', 'Bottom 3 Teams'],
            datasets: [{
                data: [totalTop, totalBottom],
                backgroundColor: ['#36A2EB', '#FF6384'],
                hoverBackgroundColor: ['#36A2EB', '#FF6384'],
            }],
        };
    };

    const calculateTotalNotes = (team) => {
        return parseInt(team?.['SPEAKER AUTO'] || 0) + parseInt(team?.['tele Speaker'] || 0);
    };

    const calculateClimbPoints = (team) => {
        return (parseInt(team?.['Shot to Trap'] || 0) * 5);
    };

    const renderProgressBars = () => {
        const teams = selectedAlliance === 'blue' ? teamData.slice(0, 3) : teamData.slice(3);
        let totalNotes = 0;
        let totalClimbPoints = 0;

        teams.forEach(team => {
            totalNotes += calculateTotalNotes(team);
            totalClimbPoints += calculateClimbPoints(team);
        });

        const notesPercentage = Math.min((totalNotes / 25) * 100, 100);
        const climbPercentage = Math.min((totalClimbPoints / 10) * 100, 100);

        return (
            <div className="progress-bars-container">
                <div className="progress-bar">
                    <Typography variant="body2" color="textSecondary">Notes: {totalNotes} / 25</Typography>
                    <LinearProgress variant="determinate" value={notesPercentage} className="custom-progress-bar" />
                </div>
                <div className="progress-bar">
                    <Typography variant="body2" color="textSecondary">Climb RP: {totalClimbPoints} / 10</Typography>
                    <LinearProgress variant="determinate" value={climbPercentage} className="custom-progress-bar" />
                </div>
            </div>
        );
    };

    return (
        <div className="app-container">
            <div className="input-boxes-container">
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
                                </div>
                                <div className="section-header">Teleop</div>
                                <div className="grid-container">
                                    <div className="grid-item">
                                        <span>tele AMP</span>
                                        <span>{teamData[index]?.['tele AMP']}</span>
                                    </div>
                                    <div className="grid-item">
                                        <span>tele Speaker</span>
                                        <span>{teamData[index]?.['tele Speaker']}</span>
                                    </div>
                                    <div className="grid-item">
                                        <span>Defensive Pins</span>
                                        <span>{teamData[index]?.['Defensive Pins']}</span>
                                    </div>
                                    <div className="grid-item">
                                        <span>Missed Shots</span>
                                        <span>{teamData[index]?.['Missed Shots']}</span>
                                    </div>
                                    <div className="grid-item">
                                        <span>Shot to Trap</span>
                                        <span>{teamData[index]?.['Shot to Trap']}</span>
                                    </div>
                                </div>
                                <div className="section-header">General</div>
                                <div className="grid-container">
                                    <div className="grid-item">
                                        <span>Climbed</span>
                                        <span>{teamData[index]?.['Climbed']}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="field-selection-container">
                <select value={selectedAlliance} onChange={(e) => setSelectedAlliance(e.target.value)}>
                    <option value="blue">Blue Alliance</option>
                    <option value="red">Red Alliance</option>
                </select>
            </div>
            {loading && (
                <div className="spinner-container">
                    <div className="spinner"></div>
                </div>
            )}
            {renderProgressBars()}
            <div id="heatmapContainer" className="heatmap-container" ref={heatmapContainerRef}>
                <img src="2024Field.png" alt="FRC Field" style={{ width: '100%', height: '100%' }} />
            </div>

            <div className="pie-charts-container">
                {['AMP AUTO', 'SPEAKER AUTO', 'tele AMP', 'tele Speaker', 'Defensive Pins', 'Missed Shots', 'Shot to Trap', 'Climbed'].map((key, index) => (
                    <div key={index} className="pie-chart">
                        <h4>{key}</h4>
                        <Pie data={generateChartData(key)} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MultipleTeams;
