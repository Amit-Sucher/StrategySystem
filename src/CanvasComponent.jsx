import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image, Line, Text } from 'react-konva';
import { LinearProgress, Typography } from '@mui/material';
import Papa from 'papaparse';
import useImage from 'use-image';

const CanvasComponent = () => {
  const [image] = useImage('https://www.chiefdelphi.com/uploads/default/original/3X/a/a/aa745548020a507cf4a07051dcd0faa446607840.png');
  const [lines, setLines] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [color, setColor] = useState('#df4b26');
  const [brushSize, setBrushSize] = useState(5);
  const [history, setHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);
  const [tool, setTool] = useState('brush'); // brush, eraser
  const isDrawing = useRef(false);
  const isErasing = useRef(false);

  const stageRef = useRef();

  const initialEventKey = '2024isde1';
  const [eventKey, setEventKey] = useState(initialEventKey);

  const originalWidth = 1920;
  const originalHeight = 1080;

  const fetchMatches = async (key) => {
    const webhookEndpoint = `https://www.thebluealliance.com/api/v3/event/${key}/matches/simple`;
    const response = await fetch(webhookEndpoint, {
      method: "GET",
      headers: {
        "X-TBA-Auth-Key": "J43Af3iggAp3XBvsVaGm5Hbc7IlK6XR8W8WxQhLDlPiQbv6BbW8LWDvVg8Zj9fCV",
      },
    });
    const data = await response.json();
    data.sort((a, b) => a.match_number - b.match_number);
    setMatches(data);
  };

  const fetchTeamColors = async (teamNumbers) => {
    const teams = teamNumbers.filter(Boolean).join('&team=');
    if (!teams) return {};

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
      return colors;
    } catch (error) {
      console.error('Error fetching team colors:', error);
      return {};
    }
  };

  const calculateRelativePositions = (width, height) => {
    const widthRatio = width / originalWidth;
    const heightRatio = height / originalHeight;

    const bluePositions = [
      { x: 135 * widthRatio, y: 300 * heightRatio },
      { x: 135 * widthRatio, y: 620 * heightRatio },
      { x: 135 * widthRatio, y: 810 * heightRatio }
    ];

    const redPositions = [
      { x: 1700 * widthRatio, y: 300 * heightRatio },
      { x: 1700 * widthRatio, y: 620 * heightRatio },
      { x: 1700 * widthRatio, y: 810 * heightRatio }
    ];

    return { bluePositions, redPositions };
  };

  const handleMatchChange = async (matchKey) => {
    const match = matches.find(m => m.key === matchKey);
    if (!match) return;

    const blueTeamNumbers = match.alliances.blue.team_keys.map(team => team.replace('frc', ''));
    const redTeamNumbers = match.alliances.red.team_keys.map(team => team.replace('frc', ''));

    const blueTeamColors = await fetchTeamColors(blueTeamNumbers);
    const redTeamColors = await fetchTeamColors(redTeamNumbers);

    const stage = stageRef.current;
    const { bluePositions, redPositions } = calculateRelativePositions(stage.width(), stage.height());

    const blueTeams = blueTeamNumbers.map((team, index) => ({
      team,
      color: blueTeamColors[team] || '#00FF00',
      position: bluePositions[index]
    }));

    const redTeams = redTeamNumbers.map((team, index) => ({
      team,
      color: redTeamColors[team] || '#00FF00',
      position: redPositions[index]
    }));

    setTeams([...blueTeams, ...redTeams]);
  };

  const handleMouseDown = (e) => {
    if (tool === 'eraser') {
      isErasing.current = true;
      const pos = stageRef.current.getPointerPosition();
      handleErase(pos);
      return;
    }

    isDrawing.current = true;
    const pos = stageRef.current.getPointerPosition();
    setHistory([...history, { lines }]);
    setRedoHistory([]);
    setLines([...lines, { points: [pos.x, pos.y], color, brushSize }]);
  };

  const handleMouseMove = () => {
    const stage = stageRef.current;
    const pos = stage.getPointerPosition();

    if (isErasing.current) {
      handleErase(pos);
      return;
    }

    if (!isDrawing.current) return;

    setLines((prevLines) => {
      const lastLine = prevLines[prevLines.length - 1];
      lastLine.points = lastLine.points.concat([pos.x, pos.y]);
      return [...prevLines.slice(0, -1), lastLine];
    });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    isErasing.current = false;
  };

  const handleErase = (pos) => {
    const eraseRadius = brushSize;
    const isNearLine = (points, pos) => {
      for (let i = 0; i < points.length; i += 2) {
        const x = points[i];
        const y = points[i + 1];
        if (Math.abs(x - pos.x) < eraseRadius && Math.abs(y - pos.y) < eraseRadius) {
          return true;
        }
      }
      return false;
    };

    setLines((prevLines) =>
      prevLines.filter((line) => !isNearLine(line.points, pos))
    );
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    setRedoHistory([{ lines }]);
    const previousState = history[history.length - 1];
    setLines(previousState.lines);
    setHistory(history.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoHistory.length === 0) return;
    setHistory([...history, { lines }]);
    const nextState = redoHistory[0];
    setLines(nextState.lines);
    setRedoHistory(redoHistory.slice(1));
  };

  useEffect(() => {
    if (image) {
      const stage = stageRef.current;
      const stageWidth = stage.width();
      const stageHeight = stage.height();
      image.width = stageWidth;
      image.height = stageHeight;
    }
  }, [image]);

  useEffect(() => {
    fetchMatches(eventKey);
    setTeams([]); // Reset teams when the event key changes
  }, [eventKey]);

  useEffect(() => {
    const handleResize = () => {
      if (matches.length > 0) {
        handleMatchChange(matches[0].key); // Adjust positions based on the first match or the current match
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [matches]);

  const [data, setData] = useState([]);
  const [teamData, setTeamData] = useState(Array(6).fill(null));
  const [loading, setLoading] = useState(false);
  const [selectedAlliance, setSelectedAlliance] = useState('blue'); // Red or Blue alliance

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

  useEffect(() => {
    fetchData('allMatches');

    const intervalId = setInterval(() => fetchData('allMatches'), 60000); /* refresh every 60 seconds */

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const newTeamData = teams.map(team => data.find(row => row['Teams'] === team.team) || null);
    setTeamData(newTeamData);
    fetchTeamColors(teams.map(team => team.team));
  }, [data, teams]);

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

  const handleTeamClick = (teamColor) => {
    setColor(teamColor);
  };

  return (
    <div className="canvas-container">
      <div className="controls">
        <input
          type="text"
          value={eventKey}
          onChange={(e) => setEventKey(e.target.value)}
          placeholder="Enter Event Code"
        />
        <select onChange={(e) => handleMatchChange(e.target.value)}>
          <option value="">Select Match</option>
          {matches.map((match) => (
            <option key={match.key} value={match.key}>
              {`${match.comp_level.toUpperCase()} Match ${match.match_number}`}
            </option>
          ))}
        </select>
        <button onClick={handleUndo}>Undo</button>
        <button onClick={handleRedo}>Redo</button>
        <div className="size-control">
          <label>Brush Size: </label>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(e.target.value)}
          />
          {brushSize}
        </div>
        <button
          onClick={() => {
            if (tool === 'brush') {
              setTool('eraser');
            } else {
              setTool('brush');
            }
          }}
          style={{ backgroundColor: tool === 'eraser' ? '#ff0000' : '#ccc' }}
        >
          {tool === 'brush' ? 'Switch to Eraser' : 'Switch to Brush'}
        </button>
      </div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ref={stageRef}
        style={{ border: '1px solid black', position: 'relative' }}
      >
        <Layer>
          <Image
            image={image}
            x={0}
            y={window.innerHeight * 0.1} // Adjust the y position to 10% from the top
            width={window.innerWidth}
            height={window.innerHeight * 0.9} // Adjust the height to fit the new position
            draggable={false} // Ensures the image is not draggable
          />
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.brushSize}
              tension={0.5}
              lineCap="round"
              globalCompositeOperation="source-over"
            />
          ))}
          {teams.map((team, i) => (
            <Text
              key={i}
              text={team.team}
              x={team.position.x}
              y={team.position.y}
              fontSize={30} // Increased font size
              fontStyle="bold" // Bold text
              fill={team.color}
              onClick={() => handleTeamClick(team.color)} // Change brush color on team click
            />
          ))}
        </Layer>
      </Stage>
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
      <style jsx>{`
        .canvas-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          width: 100vw;
        }
        .controls {
          display: flex;
          justify-content: center;
          gap: 1rem;
          background-color: #f0f0f0;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          position: fixed;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }
        .color-control,
        .size-control {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        button {
          padding: 0.5rem 1rem;
          font-size: 1rem;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        label {
          font-weight: bold;
        }
        .field-selection-container {
          margin-top: 1rem;
        }
        .progress-bars-container {
          margin: 1rem;
          width: 100%;
          max-width: 600px;
        }
        .progress-bar {
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default CanvasComponent;
