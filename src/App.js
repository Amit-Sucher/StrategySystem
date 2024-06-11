import React, { useEffect, useState } from 'react';
import './App.css';
import Papa from 'papaparse';

function App() {
    const [data, setData] = useState([]);
    const [teamNumber, setTeamNumber] = useState('');
    const [teamData, setTeamData] = useState(null);

    useEffect(() => {
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

        fetchData();
    }, []);

    const handleInputChange = (event) => {
        const input = event.target.value;
        setTeamNumber(input);
        
        const foundTeam = data.find(row => row['Team Number'] === input); // Replace 'Team Number' with the actual column name in your CSV
        setTeamData(foundTeam);
    };

    return (
        <div>
            <input 
                type="text" 
                value={teamNumber} 
                onChange={handleInputChange} 
                placeholder="Enter team number"
            />
            {teamData && (
                <div>
                    <h2>Auto notes: {teamData['A']}</h2> {/* Replace 'A' with the actual column name */}
                    <h2>Notes overall: {teamData['B']}</h2> {/* Replace 'B' with the actual column name */}
                </div>
            )}
        </div>
    );
}

export default App;
