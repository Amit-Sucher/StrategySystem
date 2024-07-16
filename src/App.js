import React, { useState } from 'react';
import '../public/static/CSS/App.css';
import SingleTeam from './SingleTeam';
import MultipleTeams from './MultipleTeams';

function App() {
    const [teamMode, setTeamMode] = useState('single'); // State to switch between single and multiple teams
    const [singleTeamNumber, setSingleTeamNumber] = useState('');
    const [multipleTeamNumbers, setMultipleTeamNumbers] = useState(Array(6).fill(''));
    const [dataType, setDataType] = useState('average'); // State to switch between data types

    const handleTeamModeChange = (event) => {
        setTeamMode(event.target.value);
    };

    const handleSingleTeamNumberChange = (teamNumber) => {
        setSingleTeamNumber(teamNumber);
    };

    const handleMultipleTeamNumbersChange = (index, teamNumber) => {
        const newTeamNumbers = [...multipleTeamNumbers];
        newTeamNumbers[index] = teamNumber;
        setMultipleTeamNumbers(newTeamNumbers);
    };

    const handleDataTypeChange = (event) => {
        setDataType(event.target.value);
    };

    return (
        <div className="app-container">
            <div className="dropdown-container-teams">
                <select value={teamMode} onChange={handleTeamModeChange}>
                    <option value="single">Single Team</option>
                    <option value="multiple">Multiple Teams</option>
                </select>
            </div>
            <div className="dropdown-container">
                <select value={dataType} onChange={handleDataTypeChange}>
                    <option value="average">Average data</option>
                    <option value="lastMatch">Last match data</option>
                    <option value="last3Matches">Last 3 matches data</option>
                </select>
            </div>
            {teamMode === 'single' ? (
                <SingleTeam
                    teamNumber={singleTeamNumber}
                    onTeamNumberChange={handleSingleTeamNumberChange}
                    dataType={dataType}
                    onDataTypeChange={handleDataTypeChange}
                />
            ) : (
                <MultipleTeams
                    teamNumbers={multipleTeamNumbers}
                    onTeamNumbersChange={handleMultipleTeamNumbersChange}
                    dataType={dataType}
                    onDataTypeChange={handleDataTypeChange}
                />
            )}
        </div>
    );
}

export default App;
