import React, { useState, useEffect } from 'react';
import './App.css';
import SingleTeam from './SingleTeam';
import MultipleTeams from './MultipleTeams';
import TeamComparison from './TeamComparison';
import AllData from './AllData';
import MatchMessages from './MatchMessages';
import PitScouting from './PitScouting';
import SuperScoutingAdmin from './SuperScoutingAdmin';
import SuperScoutingAnswers from './SuperScoutingAnswers';
import CanvasComponent from './CanvasComponent';
import StrategyCalculator from './StrategyCalculator';
import Papa from 'papaparse';

function App() {
    const [teamMode, setTeamMode] = useState('single');
    const [singleTeamNumber, setSingleTeamNumber] = useState('');
    const [multipleTeamNumbers, setMultipleTeamNumbers] = useState(Array(6).fill(''));
    const [comparisonTeamNumbers, setComparisonTeamNumbers] = useState(['', '']);
    const [dataType, setDataType] = useState('average');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [calculatedData, setCalculatedData] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleTeamModeChange = (mode) => {
        setTeamMode(mode);
        setMenuOpen(false);
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
        let gid = '368108442'; // Default GID for allMatches sheet

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
                    setData(results.data.reverse()); // Reverse the order of data
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

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <div className="app-container">
            <div className="menu-icon" onClick={toggleMenu}>
                <div className="menu-line"></div>
                <div className="menu-line"></div>
                <div className="menu-line"></div>
            </div>
            {menuOpen && (
                <div className="menu">
                    <button onClick={() => handleTeamModeChange('single')}>Single Team</button>
                    <button onClick={() => handleTeamModeChange('multiple')}>Multiple Teams</button>
                    <button onClick={() => handleTeamModeChange('comparison')}>Team Comparison</button>
                    <button onClick={() => handleTeamModeChange('all')}>All Data</button>
                    <button onClick={() => handleTeamModeChange('matchMessages')}>Match Messages</button>
                    <button onClick={() => handleTeamModeChange('pitScouting')}>Pit Scouting</button>
                    <button onClick={() => handleTeamModeChange('superScoutingAdmin')}>Super Scouting Admin</button>
                    <button onClick={() => handleTeamModeChange('superScoutingAnswers')}>Super Scouting Answers</button>
                    <button onClick={() => handleTeamModeChange('canvas')}>Canvas Drawing</button>
                    <button onClick={() => handleTeamModeChange('strategyCalculator')}>Strategy Calculator</button> {/* Add this line */}
                </div>
            )}
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
            ) : teamMode === 'matchMessages' ? (
                <MatchMessages dataType={dataType} />
            ) : teamMode === 'pitScouting' ? (
                <PitScouting dataType={dataType} />
            ) : teamMode === 'superScoutingAdmin' ? (
                <SuperScoutingAdmin />
            ) : teamMode === 'superScoutingAnswers' ? (
                <SuperScoutingAnswers />
            ) : teamMode === 'canvas' ? (
                <CanvasComponent /> 
            ) : teamMode === 'strategyCalculator' ? (
                <StrategyCalculator
                    gid="564661292" // Replace with your GID for the allMatches sheet or appropriate GID
                    dataType={dataType}
                    teamNumbers={multipleTeamNumbers} // Pass the team numbers
                />
            ) : (
                <AllData
                    data={calculatedData.length ? calculatedData : data}
                    loading={loading}
                    dataType={dataType}
                    calculateScores={calculateScores}
                />
            )}
        </div>
    );
}

export default App;
