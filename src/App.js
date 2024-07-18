import React, { useState } from 'react';
import './App.css';
import SingleTeam from './SingleTeam';
import MultipleTeams from './MultipleTeams';
import TeamComparison from './TeamComparison';
import AllData from './AllData';

function App() {
  const [teamMode, setTeamMode] = useState('single');
  const [singleTeamNumber, setSingleTeamNumber] = useState('');
  const [multipleTeamNumbers, setMultipleTeamNumbers] = useState(Array(6).fill(''));
  const [comparisonTeamNumbers, setComparisonTeamNumbers] = useState(['', '']);
  const [dataType, setDataType] = useState('average');

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

  const handleComparisonTeamNumbersChange = (index, teamNumber) => {
    const newTeamNumbers = [...comparisonTeamNumbers];
    newTeamNumbers[index] = teamNumber;
    setComparisonTeamNumbers(newTeamNumbers);
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
          <option value="comparison">Team Comparison</option>
          <option value="all">All Data</option>
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
      ) : teamMode === 'multiple' ? (
        <MultipleTeams
          teamNumbers={multipleTeamNumbers}
          onTeamNumbersChange={handleMultipleTeamNumbersChange}
          dataType={dataType}
          onDataTypeChange={handleDataTypeChange}
        />
      ) : teamMode === 'comparison' ? (
        <TeamComparison
          teamNumbers={comparisonTeamNumbers}
          onTeamNumbersChange={handleComparisonTeamNumbersChange}
          dataType={dataType}
          onDataTypeChange={handleDataTypeChange}
        />
      ) : (
        <AllData dataType={dataType} />
      )}
    </div>
  );
}

export default App;
