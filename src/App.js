// import React, { useEffect, useState, useRef } from 'react';
// import './App.css';
// import Papa from 'papaparse';
// import h337 from 'heatmap.js';
// import { HashRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
// import Excalidraw from '@excalidraw/excalidraw';

// const HeatMapScreen = ({ data, setData, teamNumbers, setTeamNumbers, teamData, setTeamData, teamColors, setTeamColors, dataType, setDataType, loading, setLoading }) => {
//     const heatmapContainerRef = useRef(null);
//     const heatmapDotInstancesRef = useRef({});
//     const heatmapCloudInstancesRef = useRef({});

//     const fetchData = async (sheetType) => {
//         setLoading(true);
//         let gid = '0';
        
//         if (sheetType === 'lastMatch') {
//             gid = '1877019773';
//         } else if (sheetType === 'last3Matches') {
//             gid = '1606759362';
//         }

//         const publicSpreadsheetUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRojRhLgZSPXJopPdni1V4Z-inXXY3a__2NaVMsoJHPs9d25ZQ7t56QX67mncr6yo-w4B8WCWyHFe2m/pub?output=csv&gid=${gid}`;
//         const cacheBuster = `cacheBuster=${new Date().getTime()}`;
//         const urlWithCacheBuster = `${publicSpreadsheetUrl}&${cacheBuster}`;

//         try {
//             Papa.parse(urlWithCacheBuster, {
//                 download: true,
//                 header: true,
//                 complete: function(results) {
//                     console.log('Fetched data:', results.data);
//                     setData(results.data);
//                     setLoading(false);
//                 },
//                 error: function(error) {
//                     console.warn('Error fetching data from Google Sheets', error);
//                     setLoading(false);
//                 }
//             });
//         } catch (error) {
//             console.error('Fetching data failed', error);
//             setLoading(false);
//         }
//     };

//     const fetchTeamColors = async (teamNumbers) => {
//         const teams = teamNumbers.filter(Boolean).join('&team=');
//         if (!teams) return;
        
//         try {
//             const response = await fetch(`https://api.frc-colors.com/v1/team?team=${teams}`);
//             const data = await response.json();
//             const colors = {};
//             for (const team in data.teams) {
//                 const teamData = data.teams[team];
//                 if (teamData.colors) {
//                     colors[team] = teamData.colors.primaryHex;
//                 } else {
//                     colors[team] = '#00FF00';
//                 }
//             }
//             setTeamColors(colors);
//         } catch (error) {
//             console.error('Error fetching team colors:', error);
//         }
//     };

//     useEffect(() => {
//         fetchData(dataType);
//         fetchTeamColors(teamNumbers);

//         const intervalId = setInterval(() => fetchData(dataType), 10000);

//         return () => clearInterval(intervalId);
//     }, [dataType]);

//     useEffect(() => {
//         const newTeamData = teamNumbers.map(number => data.find(row => row['Teams'] === number) || null);
//         setTeamData(newTeamData);
//         fetchTeamColors(teamNumbers);
//     }, [data, teamNumbers]);

//     useEffect(() => {
//         if (heatmapContainerRef.current) {
//             Object.values(heatmapDotInstancesRef.current).forEach(instance => instance.setData({ max: 1, data: [] }));
//             Object.values(heatmapCloudInstancesRef.current).forEach(instance => instance.setData({ max: 1, data: [] }));

//             teamNumbers.forEach(team => {
//                 if (!heatmapDotInstancesRef.current[team]) {
//                     heatmapDotInstancesRef.current[team] = createCustomHeatmap(heatmapContainerRef.current, {
//                         radius: 3,
//                         maxOpacity: 1,
//                         minOpacity: 1,
//                         blur: 0,
//                         gradient: {
//                             0.0: teamColors[team] || '#00FF00',
//                             1.0: teamColors[team] || '#00FF00'
//                         }
//                     });
//                 } else {
//                     heatmapDotInstancesRef.current[team].configure({
//                         gradient: {
//                             0.0: teamColors[team] || '#00FF00',
//                             1.0: teamColors[team] || '#00FF00'
//                         }
//                     });
//                 }

//                 if (!heatmapCloudInstancesRef.current[team]) {
//                     heatmapCloudInstancesRef.current[team] = createCustomHeatmap(heatmapContainerRef.current, {
//                         radius: 20,
//                         maxOpacity: 0.6,
//                         minOpacity: 0.1,
//                         blur: 0.9,
//                         gradient: {
//                             0.0: teamColors[team] || '#00FF00',
//                             1.0: teamColors[team] || '#00FF00'
//                         }
//                     });
//                 } else {
//                     heatmapCloudInstancesRef.current[team].configure({
//                         gradient: {
//                             0.0: teamColors[team] || '#00FF00',
//                             1.0: teamColors[team] || '#00FF00'
//                         }
//                     });
//                 }
//             });
//         }
//     }, [teamColors]);

//     const handleInputChange = (index, event) => {
//         const input = event.target.value;
//         const newTeamNumbers = [...teamNumbers];
//         newTeamNumbers[index] = input;
//         setTeamNumbers(newTeamNumbers);
//     };

//     const handleDataTypeChange = (event) => {
//         setDataType(event.target.value);
//     };

//     const parseMapData = (mapString) => {
//         const coordinatePairs = mapString.match(/\(\d+,\d+\)/g);
//         if (!coordinatePairs) throw new Error('Invalid map data format');

//         return coordinatePairs.map(pair => {
//             const [x, y] = pair.slice(1, -1).split(',').map(Number);
//             return { x, y, value: 1 };
//         });
//     };

//     const updateHeatmap = (teamsData) => {
//         if (!heatmapDotInstancesRef.current || !heatmapCloudInstancesRef.current) return;

//         const fieldWidth = 10;
//         const fieldHeight = 10;
//         const imageWidth = 1000;
//         const imageHeight = 500;

//         const mapCoordinatesToImage = (fieldCoords, imgWidth, imgHeight, fieldWidth, fieldHeight) => {
//             return fieldCoords.map(coord => ({
//                 x: (coord.x / fieldWidth) * imgWidth,
//                 y: (coord.y / fieldHeight) * imgHeight,
//                 value: 1
//             }));
//         };

//         teamsData.forEach(team => {
//             if (team && team.map) {
//                 const coords = parseMapData(team.map);
//                 const imageCoordinates = mapCoordinatesToImage(coords, imageWidth, imageHeight, fieldWidth, fieldHeight);

//                 const data = {
//                     max: 1,
//                     data: imageCoordinates
//                 };

//                 if (heatmapDotInstancesRef.current[team['Teams']]) {
//                     heatmapDotInstancesRef.current[team['Teams']].setData(data);
//                 }
//                 if (heatmapCloudInstancesRef.current[team['Teams']]) {
//                     heatmapCloudInstancesRef.current[team['Teams']].setData(data);
//                 }
//             }
//         });
//     };

//     useEffect(() => {
//         updateHeatmap(teamData);
//     }, [teamData, teamColors]);

//     const createCustomHeatmap = (container, config) => {
//         const canvas = document.createElement('canvas');
//         const context = canvas.getContext('2d', { willReadFrequently: true });
//         container.appendChild(canvas);

//         const heatmapInstance = h337.create({
//             container: container,
//             ...config
//         });

//         return heatmapInstance;
//     };

//     return (
//         <div className="app-container">
//             <div className="dropdown-container">
//                 <select value={dataType} onChange={handleDataTypeChange}>
//                     <option value="average">Average data</option>
//                     <option value="lastMatch">Last match data</option>
//                     <option value="last3Matches">Last 3 matches data</option>
//                 </select>
//             </div>
//             {loading && (
//                 <div className="spinner-container">
//                     <div className="spinner"></div>
//                 </div>
//             )}
//             {Array.from({ length: 6 }).map((_, index) => (
//                 <div key={index} className="input-container">
//                     <input
//                         type="text"
//                         value={teamNumbers[index]}
//                         onChange={(event) => handleInputChange(index, event)}
//                         placeholder={`Enter team number ${index + 1}`}
//                         className={`input-box ${index < 3 ? 'top-input' : 'bottom-input'}`}
//                     />
//                     {teamData[index] && (
//                         <div className="team-data-container">
//                             <div className="section-header">Auto</div>
//                             <div className="grid-container">
//                                 <div className="grid-item">
//                                     <span>AMP AUTO</span>
//                                     <span>{teamData[index]?.['AMP AUTO']}</span>
//                                 </div>
//                                 <div className="grid-item">
//                                     <span>SPEAKER AUTO</span>
//                                     <span>{teamData[index]?.['SPEAKER AUTO']}</span>
//                                 </div>
//                                 <div className="grid-item">
//                                     <span>Mid Notes</span>
//                                     <span>{teamData[index]?.['mid notes']}</span>
//                                 </div>
//                             </div>
//                             <div className="section-header">Teleop</div>
//                             <div className="grid-container">
//                                 <div className="grid-item">
//                                     <span>Tele AMP</span>
//                                     <span>{teamData[index]?.['tele AMP']}</span>
//                                 </div>
//                                 <div className="grid-item">
//                                     <span>Missed AMP</span>
//                                     <span>{teamData[index]?.['Missed AMP']}</span>
//                                 </div>
//                                 <div className="grid-item">
//                                     <span>Tele Speaker</span>
//                                     <span>{teamData[index]?.['tele Speaker']}</span>
//                                 </div>
//                                 <div className="grid-item">
//                                     <span>Tele Missed Speaker</span>
//                                     <span>{teamData[index]?.['tele Missed Speaker']}</span>
//                                 </div>
//                                 <div className="grid-item">
//                                     <span>Defensive Pins</span>
//                                     <span>{teamData[index]?.['Defensive Pins']}</span>
//                                 </div>
//                             </div>
//                             <div className="section-header">General</div>
//                             <div className="grid-container">
//                                 <div className="grid-item">
//                                     <span>Shot to Trap</span>
//                                     <span>{teamData[index]?.['Shot to Trap']}</span>
//                                 </div>
//                                 <div className="grid-item">
//                                     <span>Under Chain</span>
//                                     <span>{teamData[index]?.['Under Chain']}</span>
//                                 </div>
//                                 <div className="grid-item">
//                                     <span>Long Shot</span>
//                                     <span>{teamData[index]?.['Long Shot']}</span>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             ))}
//             <div id="heatmapContainer" ref={heatmapContainerRef}>
//                 <img src="frcfieldNoBG.png" alt="FRC Field" style={{ width: '100%', height: '100%' }} />
//             </div>
//         </div>
//     );
// };

// const DrawScreen = () => {
//     return (
//         <div>
//             <h1>Draw Screen</h1>
//             <div style={{ height: '600px' }}>
//                 <Excalidraw />
//             </div>
//         </div>
//     );
// };

// const App = () => {
//     const [data, setData] = useState([]);
//     const [teamNumbers, setTeamNumbers] = useState(Array(6).fill(''));
//     const [teamData, setTeamData] = useState(Array(6).fill(null));
//     const [teamColors, setTeamColors] = useState({});
//     const [dataType, setDataType] = useState('average');
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();

//     const handleNavigationChange = (event) => {
//         navigate(event.target.value);
//     };

//     return (
//         <Router>
//             <div>
//                 <nav>
//                     <select onChange={handleNavigationChange}>
//                         <option value="/">Heat Map</option>
//                         <option value="/draw">Draw</option>
//                     </select>
//                 </nav>
//                 <Routes>
//                     <Route path="/" element={<HeatMapScreen
//                         data={data}
//                         setData={setData}
//                         teamNumbers={teamNumbers}
//                         setTeamNumbers={setTeamNumbers}
//                         teamData={teamData}
//                         setTeamData={setTeamData}
//                         teamColors={teamColors}
//                         setTeamColors={setTeamColors}
//                         dataType={dataType}
//                         setDataType={setDataType}
//                         loading={loading}
//                         setLoading={setLoading}
//                     />} />
//                     <Route path="/draw" element={<DrawScreen />} />
//                 </Routes>
//             </div>
//         </Router>
//     );
// };

// export default App;
