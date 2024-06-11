import React, { useEffect, useState } from 'react';
import './App.css';
import Papa from 'papaparse';

function App() {
    const [data, setData] = useState([]);
    const [teamNumbers, setTeamNumbers] = useState({});

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

    const handleInputChange = (event, id) => {
        setTeamNumbers({
            ...teamNumbers,
            [id]: event.target.value
        });
    };

    return (
        <div>
            <svg width={1920} height={1000}>
                <g>
                    {/* You can start adding your new showcase elements here */}
                </g>
            </svg>
        </div>
    );
}

export default App;
