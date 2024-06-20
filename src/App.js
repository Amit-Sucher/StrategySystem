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
                console.log('Fetched data:', results.data);
                setData(results.data);
            },
            error: function(error) {
                console.warn('Error fetching data from Google Sheets', error);
            }
        });
    };

    useEffect(() => {
        fetchData();

        const intervalId = setInterval(fetchData, 10000);

        return () => clearInterval(intervalId);
    }, []);

    const handleInputChange = (index, event) => {
        const input = event.target.value;
        const newTeamNumbers = [...teamNumbers];
        newTeamNumbers[index] = input;
        setTeamNumbers(newTeamNumbers);

        const foundTeam = data.find(row => row['Teams'] === input);
        const newTeamData = [...teamData];
        newTeamData[index] = foundTeam;
        setTeamData(newTeamData);
        console.log(`Found team data for input ${index + 1}:`, foundTeam);
    };

    return (
        <div className="app-container">
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
                                <div className="grid-item">AMP AUTO</div>
                                <div className="grid-item">{teamData[index]['AMP AUTO']}</div>
                                <div className="grid-item">SPEAKER AUTO</div>
                                <div className="grid-item">{teamData[index]['SPEAKER AUTO']}</div>
                                <div className="grid-item">mid notes</div>
                                <div className="grid-item">{teamData[index]['mid notes']}</div>
                            </div>
                            <div className="section-header">Teleop</div>
                            <div className="grid-container">
                                <div className="grid-item">tele AMP</div>
                                <div className="grid-item">{teamData[index]['tele AMP']}</div>
                                <div className="grid-item">Missed AMP</div>
                                <div className="grid-item">{teamData[index]['Missed AMP']}</div>
                                <div className="grid-item">tele Speaker</div>
                                <div className="grid-item">{teamData[index]['tele Speaker']}</div>
                                <div className="grid-item">tele Missed Speaker</div>
                                <div className="grid-item">{teamData[index]['tele Missed Speaker']}</div>
                                <div className="grid-item">Defensive Pins</div>
                                <div className="grid-item">{teamData[index]['Defensive Pins']}</div>
                            </div>
                            <div className="section-header">General</div>
                            <div className="grid-container">
                                <div className="grid-item">Shot to Trap</div>
                                <div className="grid-item">{teamData[index]['Shot to Trap']}</div>
                                <div className="grid-item">Under Chain</div>
                                <div className="grid-item">{teamData[index]['Under Chain']}</div>
                                <div className="grid-item">Long Shot</div>
                                <div className="grid-item">{teamData[index]['Long Shot']}</div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default App;
//for commit reasons