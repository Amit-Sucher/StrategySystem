import React, { useState, useEffect } from 'react';
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
import { CssBaseline, Typography } from '@mui/material';

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

const SuperScoutingAnswers = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        const publicSpreadsheetUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRojRhLgZSPXJopPdni1V4Z-inXXY3a__2NaVMsoJHPs9d25ZQ7t56QX67mncr6yo-w4B8WCWyHFe2m/pub?output=csv&gid=410107933`;
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

        const filtered = data.filter(answer =>
            answer['שם'].toString().toLowerCase().includes(query.toLowerCase()) ||
            answer['קבוצה'].toString().toLowerCase().includes(query.toLowerCase()) ||
            answer['מקצה'].toString().toLowerCase().includes(query.toLowerCase())
        );
        setFilteredData(filtered);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className="super-scouting-table-container">
                <div className="search-bar">
                    <TextField
                        label="Search"
                        variant="outlined"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        fullWidth
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
                                    <TableCell>שם</TableCell>
                                    <TableCell>קבוצה</TableCell>
                                    <TableCell>מקצה</TableCell>
                                    <TableCell>תאר אוטונומי</TableCell>
                                    <TableCell>תאר טלאופ + אנדגיים</TableCell>
                                    <TableCell>תאר שימוש בטראפ</TableCell>
                                    <TableCell>תאר הגנה</TableCell>
                                    <TableCell>תאר התמודדות עם הגנה</TableCell>
                                    <TableCell>פרט רוטיישנס</TableCell>
                                    <TableCell>ירי - מיקום + גובה + זמן</TableCell>
                                    <TableCell>איסוף - רצפה/פידר + זמן</TableCell>
                                    <TableCell>תאר כימיה עם שאר הברית</TableCell>
                                    <TableCell>הערות</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData.map((answer, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{answer['שם']}</TableCell>
                                        <TableCell>{answer['קבוצה']}</TableCell>
                                        <TableCell>{answer['מקצה']}</TableCell>
                                        <TableCell>{answer['תאר אוטונומי']}</TableCell>
                                        <TableCell>{answer['תאר טלאופ + אנדגיים']}</TableCell>
                                        <TableCell>{answer['תאר שימוש בטראפ']}</TableCell>
                                        <TableCell>{answer['תאר הגנה']}</TableCell>
                                        <TableCell>{answer['תאר התמודדות עם הגנה']}</TableCell>
                                        <TableCell>{answer['פרט רוטיישנס']}</TableCell>
                                        <TableCell>{answer['ירי - מיקום + גובה + זמן']}</TableCell>
                                        <TableCell>{answer['איסוף - רצפה/פידר + זמן']}</TableCell>
                                        <TableCell>{answer['תאר כימיה עם שאר הברית']}</TableCell>
                                        <TableCell>{answer['הערות']}</TableCell>
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

export default SuperScoutingAnswers;