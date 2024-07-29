import React, { useState } from 'react';
import { TextField, Button, Checkbox, FormControlLabel, FormGroup, Typography, Box } from '@mui/material';

const SuperScoutingAdmin = () => {
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [adminName, setAdminName] = useState('');
  const [matchNumber, setMatchNumber] = useState('');
  const [teamNumber, setTeamNumber] = useState('');
  const gid = '21713347'; // Hardcoded GID

  const columns = [
    'תאר אוטונומי', 'תאר טלאופ + אנדגיים', 'תאר שימוש בטראפ',
    'תאר הגנה', 'תאר התמודדות עם הגנה', 'פרט רוטיישנס', 'ירי - מיקום + גובה + זמן',
    'איסוף - רצפה/פידר + זמן', 'תאר כימיה עם שאר הברית', 'הערות'
  ];

  const handleCheckboxChange = (event) => {
    const columnName = event.target.name;
    if (event.target.checked) {
      setSelectedColumns([...selectedColumns, columnName]);
    } else {
      setSelectedColumns(selectedColumns.filter(col => col !== columnName));
    }
  };

  const sendDataToSheet = (data) => {
    console.log('Sending data:', data); // Log the data being sent
    fetch('https://script.google.com/macros/s/AKfycbzB2IoxV6MJ4LdqTg4OUbr6vVJWQ4FGwX38iuu4PQrbjM3svNLZRAyZmC0t0RosybKn/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors', // Ensure no-cors mode
      body: JSON.stringify(data)
    })
    .then(() => console.log('Request sent successfully'))
    .catch(error => console.error('Error:', error));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = {
      adminName,
      matchNumber,
      teamNumber,
      selectedColumns,
      gid // Include hardcoded GID in the data
    };
    sendDataToSheet(data);
  };

  const commonStyles = {
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
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Super Scouting Admin</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="שם"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          fullWidth
          sx={commonStyles}
          margin="normal"
          required
        />
        <TextField
          label="מקצה"
          type="number"
          value={matchNumber}
          onChange={(e) => setMatchNumber(e.target.value)}
          fullWidth
          sx={commonStyles}
          margin="normal"
          required
        />
        <TextField
          label="קבוצה"
          type="number"
          value={teamNumber}
          onChange={(e) => setTeamNumber(e.target.value)}
          fullWidth
          sx={commonStyles}
          margin="normal"
          required
        />
        <FormGroup>
          {columns.map((column, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  name={column}
                  onChange={handleCheckboxChange}
                  sx={{ color: '#E0E0E0' }}
                />
              }
              label={<span style={{ color: '#E0E0E0' }}>{column}</span>}
            />
          ))}
        </FormGroup>
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>Submit</Button>
      </form>
    </Box>
  );
};

export default SuperScoutingAdmin;