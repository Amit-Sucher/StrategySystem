import React, { useEffect, useState } from 'react';
import './App.css';
import Papa from 'papaparse';

function App() {
    const [data, setData] = useState([]);
    const [teamNumber, setTeamNumber] = useState('');
    const [teamData, setTeamData] = useState(null);

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

    const handleInputChange = (event) => {
        const input = event.target.value;
        setTeamNumber(input);
        
        const foundTeam = data.find(row => row['Team'] === input); // Replace 'Team' with the actual column name in your CSV
        console.log('Found team data:', foundTeam);
        setTeamData(foundTeam);
    };

    return (
        <div className="app-container">
            <input 
                type="text" 
                value={teamNumber} 
                onChange={handleInputChange} 
                placeholder="Enter team number"
                className="input-box"
            />
            {teamData && (
                <div className="team-data-container">
                    <h2>Auto notes: {teamData['Auto Notes']}</h2> {/* Replace 'Auto Notes' with the actual column name */}
                    <h2>Notes overall: {teamData['Notes']}</h2> {/* Replace 'Notes' with the actual column name */}
                </div>
            )}
        </div>
    );
}

export default App;
