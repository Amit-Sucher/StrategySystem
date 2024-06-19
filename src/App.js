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
            <div className="input-row">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="input-container">
                        <input
                            type="text"
                            value={teamNumbers[index]}
                            onChange={(event) => handleInputChange(index, event)}
                            placeholder={`Enter team number ${index + 1}`}
                            className="input-box top-input"
                        />
                        {teamData[index] && (
                            <div className="team-data-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th colSpan="2">General</th>
                                            <th colSpan="2">Endgame</th>
                                            <th colSpan="2">Autonomous</th>
                                            <th colSpan="2">Match Play</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Pins</td>
                                            <td>{teamData[index]['AMP AUTO']}</td>
                                            <td>Trap?</td>
                                            <td>{teamData[index]['SPEAKER AUTO']}</td>
                                            <td>Exit</td>
                                            <td>{teamData[index]['mid notes']}</td>
                                            <td>Speaker</td>
                                            <td>{teamData[index]['tele AMP']}</td>
                                        </tr>
                                        <tr>
                                            <td>Under Chain</td>
                                            <td>{teamData[index]['Missed AMP']}</td>
                                            <td>Tele AMP</td>
                                            <td>{teamData[index]['tele Speaker']}</td>
                                            <td>Missed AMP</td>
                                            <td>{teamData[index]['tele Missed Speaker']}</td>
                                            <td>Tele Speaker</td>
                                            <td>{teamData[index]['Defensive Pins']}</td>
                                        </tr>
                                        <tr>
                                            <td>Tele Missed Speaker</td>
                                            <td>{teamData[index]['Shot to Trap']}</td>
                                            <td>Defensive Pins</td>
                                            <td>{teamData[index]['Under Chain']}</td>
                                            <td>Shot to Trap</td>
                                            <td>{teamData[index]['Long Shot']}</td>
                                            <td>Long Shot</td>
                                            <td>{teamData[index]['Long Shot']}</td>
                                        </tr>
                                    </tbody>
                                </table>
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
                            className="input-box bottom-input"
                        />
                        {teamData[index + 3] && (
                            <div className="team-data-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th colSpan="2">General</th>
                                            <th colSpan="2">Endgame</th>
                                            <th colSpan="2">Autonomous</th>
                                            <th colSpan="2">Match Play</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Pins</td>
                                            <td>{teamData[index + 3]['AMP AUTO']}</td>
                                            <td>Trap?</td>
                                            <td>{teamData[index + 3]['SPEAKER AUTO']}</td>
                                            <td>Exit</td>
                                            <td>{teamData[index + 3]['mid notes']}</td>
                                            <td>Speaker</td>
                                            <td>{teamData[index + 3]['tele AMP']}</td>
                                        </tr>
                                        <tr>
                                            <td>Under Chain</td>
                                            <td>{teamData[index + 3]['Missed AMP']}</td>
                                            <td>Tele AMP</td>
                                            <td>{teamData[index + 3]['tele Speaker']}</td>
                                            <td>Missed AMP</td>
                                            <td>{teamData[index + 3]['tele Missed Speaker']}</td>
                                            <td>Tele Speaker</td>
                                            <td>{teamData[index + 3]['Defensive Pins']}</td>
                                        </tr>
                                        <tr>
                                            <td>Tele Missed Speaker</td>
                                            <td>{teamData[index + 3]['Shot to Trap']}</td>
                                            <td>Defensive Pins</td>
                                            <td>{teamData[index + 3]['Under Chain']}</td>
                                            <td>Shot to Trap</td>
                                            <td>{teamData[index + 3]['Long Shot']}</td>
                                            <td>Long Shot</td>
                                            <td>{teamData[index + 3]['Long Shot']}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
