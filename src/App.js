import React, { useEffect, useState } from 'react';
import './App.css';
import Papa from 'papaparse';

function App() {
    const [data, setData] = useState([]);
    const [teamNumbers, setTeamNumbers] = useState(Array(6).fill(''));
    const [teamData, setTeamData] = useState(Array(6).fill(null));

    const fetchData = async () => {
        const publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRojRhLgZSPXJopPdni1V4Z-inXXY3a__2NaVMsoJHPs9d25ZQ7t56QX67mncr6yo-w4B8WCWyHFe2m/pub?output=csv';
        Papa.parse(publicSpreadsheetUrl, {
            download: true,
            header: true,
            complete: function(results) {
                console.log('Fetched data:', results.data); // Console log to verify data fetching
                setData(results.data);
            },
            error: function(error) {
                console.warn('Error fetching data from Google Sheets', error);
            }
        });
    };

    useEffect(() => {
        fetchData();

        // Set up a periodic fetch every 10 seconds (10000 milliseconds)
        const intervalId = setInterval(fetchData, 10000);

        // Clean up the interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    const handleInputChange = (index, event) => {
        const input = event.target.value;
        const newTeamNumbers = [...teamNumbers];
        newTeamNumbers[index] = input;
        setTeamNumbers(newTeamNumbers);
        
        const foundTeam = data.find(row => row['Team'] === input); // Replace 'Team' with the actual column name in your CSV
        const newTeamData = [...teamData];
        newTeamData[index] = foundTeam;
        setTeamData(newTeamData);
        console.log(`Found team data for input ${index + 1}:`, foundTeam);
    };

    return (
        <div className="app-container">
            <div className="input-row">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="input-container">
                        <input 
                            type="text" 
                            value={teamNumbers[index]} 
                            onChange={(event) => handleInputChange(index, event)} 
                            placeholder={`Enter team number ${index + 1}`}
                            className="input-box"
                        />
                        {teamData[index] && (
                            <div className="team-data-container">
                                <h2>Auto notes: {teamData[index]['Auto Notes']}</h2> {/* Replace 'Auto Notes' with the actual column name */}
                                <h2>Notes overall: {teamData[index]['Notes']}</h2> {/* Replace 'Notes' with the actual column name */}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="input-row">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index + 3} className="input-container">
                        <input 
                            type="text" 
                            value={teamNumbers[index + 3]} 
                            onChange={(event) => handleInputChange(index + 3, event)} 
                            placeholder={`Enter team number ${index + 4}`}
                            className="input-box"
                        />
                        {teamData[index + 3] && (
                            <div className="team-data-container">
                                <h2>Auto notes: {teamData[index + 3]['Auto Notes']}</h2> {/* Replace 'Auto Notes' with the actual column name */}
                                <h2>Notes overall: {teamData[index + 3]['Notes']}</h2> {/* Replace 'Notes' with the actual column name */}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
