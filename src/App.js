import React, { useState, useEffect } from 'react';
import './App.css';
import SingleTeam from './SingleTeam';
import MultipleTeams from './MultipleTeams';
import TeamComparison from './TeamComparison';
import AllData from './AllData';
import Papa from 'papaparse';

function App() {
  const [teamMode, setTeamMode] = useState('single');
  const [singleTeamNumber, setSingleTeamNumber] = useState('');
  const [multipleTeamNumbers, setMultipleTeamNumbers] = useState(Array(6).fill(''));
  const [comparisonTeamNumbers, setComparisonTeamNumbers] = useState(['', '']);
  const [dataType, setDataType] = useState('average');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calculatedData, setCalculatedData] = useState([]); // New state for calculated data

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

  const fetchData = async (sheetType) => {
    setLoading(true);
    let gid = '564661292'; // Default to average data

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
    fetchData(dataType);
    const intervalId = setInterval(() => fetchData(dataType), 60000);

    return () => clearInterval(intervalId);
  }, [dataType]);

  const calculateScores = (selectedColumns, weights) => {
    if (selectedColumns.some(col => col === '') || weights.some(weight => weight === 0)) {
      alert('Please select all columns and assign weights.');
      return;
    }

    const updatedData = data.map(row => {
      let totalScore = 0;
      selectedColumns.forEach((col, index) => {
        totalScore += (parseFloat(row[col]) || 0) * (weights[index] / 100);
      });
      return { ...row, totalScore };
    });

    const sortedData = updatedData.sort((a, b) => b.totalScore - a.totalScore);
    setCalculatedData(sortedData);
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
        <AllData
          data={calculatedData.length ? calculatedData : data} // Use calculated data if available
          loading={loading}
          dataType={dataType}
          calculateScores={calculateScores} // Pass down calculateScores function
        />
      )}
    </div>
  );
}

export default App;
