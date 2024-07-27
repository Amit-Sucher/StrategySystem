import React, { useState, useEffect } from 'react';
import './App.css';
import Papa from 'papaparse';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { CssBaseline } from '@mui/material';

const theme = createTheme({
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiInputBase-input': {
                        color: '#E0E0E0', // Text color
                    },
                    '& .MuiInputLabel-root': {
                        color: '#E0E0E0', // Label color
                    },
                    '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E0E0E0', // Outline color
                    },
                    '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E0E0E0', // Outline color on hover
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E0E0E0', // Outline color when focused
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    color: '#E0E0E0',
                    borderColor: '#4d5255',
                    padding: '8px 16px', // Add some padding for better readability
                },
                head: {
                    backgroundColor: '#1BB8CC',
                    color: '#22333B',
                    fontWeight: 'bold', // Make the header font bold
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:nth-of-type(even)': {
                        backgroundColor: '#2E3B3F', // Even row color
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: '#22333B',
                    color: '#E0E0E0',
                },
            },
        },
    },
});

const PitScouting = ({ dataType }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        const publicSpreadsheetUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRojRhLgZSPXJopPdni1V4Z-inXXY3a__2NaVMsoJHPs9d25ZQ7t56QX67mncr6yo-w4B8WCWyHFe2m/pub?output=csv&gid=1325302827`;
        const cacheBuster = `cacheBuster=${new Date().getTime()}`;
        const urlWithCacheBuster = `${publicSpreadsheetUrl}&${cacheBuster}`;

        try {
            Papa.parse(urlWithCacheBuster, {
                download: true,
                header: true,
                complete: function (results) {
                    setData(results.data);
                    setFilteredData(results.data); // Initialize filtered data with all data
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
        fetchData();
    }, []);

    const handleSearchChange = (event) => {
        const query = event.target.value;
        setSearchQuery(query);

        const filtered = data.filter(team =>
            team['Team Number'].toString().toLowerCase().includes(query.toLowerCase())
        );
        setFilteredData(filtered);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className="pit-scouting-container">
                <div className="search-bar">
                    <TextField
                        label="Search Team"
                        variant="outlined"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        fullWidth
                        sx={{
                            input: { color: '#E0E0E0' },
                            label: { color: '#E0E0E0' },
                            '.MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: '#E0E0E0',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#E0E0E0',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#E0E0E0',
                                },
                            },
                        }}
                    />
                </div>
                {loading && (
                    <div className="spinner-container">
                        <div className="spinner"></div>
                    </div>
                )}
                {!loading && filteredData.length > 0 && (
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Team Number</TableCell>
                                    <TableCell>Where the Robot Can Score</TableCell>
                                    <TableCell>Where the Robot Can Shoot From (Farthest)</TableCell>
                                    <TableCell>Where the Robot Can Collect From</TableCell>
                                    <TableCell>Can the Robot Climb</TableCell>
                                    <TableCell>Can the Robot Climb Anywhere on the Chain</TableCell>
                                    <TableCell>Can the Robot Climb with Another Robot</TableCell>
                                    <TableCell>Does the Robot Perform Trap</TableCell>
                                    <TableCell>Chassis Type</TableCell>
                                    <TableCell>Drive System Motors</TableCell>
                                    <TableCell>Gear Ratio</TableCell>
                                    <TableCell>Can the Robot Pass Under the Chain</TableCell>
                                    <TableCell>What the Robot Does in Autonomous</TableCell>
                                    <TableCell>Robot Width with Bumpers</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData.map((team, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{team['Team Number']}</TableCell>
                                        <TableCell>{team['Where the Robot Can Score']}</TableCell>
                                        <TableCell>{team['Where the Robot Can Shoot From (Farthest)']}</TableCell>
                                        <TableCell>{team['Where the Robot Can Collect From']}</TableCell>
                                        <TableCell>{team['Can the Robot Climb']}</TableCell>
                                        <TableCell>{team['Can the Robot Climb Anywhere on the Chain']}</TableCell>
                                        <TableCell>{team['Can the Robot Climb with Another Robot']}</TableCell>
                                        <TableCell>{team['Does the Robot Perform Trap']}</TableCell>
                                        <TableCell>{team['Chassis Type']}</TableCell>
                                        <TableCell>{team['Drive System Motors']}</TableCell>
                                        <TableCell>{team['Gear Ratio']}</TableCell>
                                        <TableCell>{team['Can the Robot Pass Under the Chain']}</TableCell>
                                        <TableCell>{team['What the Robot Does in Autonomous']}</TableCell>
                                        <TableCell>{team['Robot Width with Bumpers']}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </div>
        </ThemeProvider>
    );
};

export default PitScouting;
