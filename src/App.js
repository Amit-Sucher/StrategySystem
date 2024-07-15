import React, { useState } from 'react';
import './App.css';
import SingleTeam from './SingleTeam';
import MultipleTeams from './MultipleTeams';

function App() {
    const [teamMode, setTeamMode] = useState('single'); // State to switch between single and multiple teams

    const handleTeamModeChange = (event) => {
        setTeamMode(event.target.value);
    };

    return (
        <div className="app-container">
            <div className="dropdown-container-teams">
                <select value={teamMode} onChange={handleTeamModeChange}>
                    <option value="single">Single Team</option>
                    <option value="multiple">Multiple Teams</option>
                </select>
            </div>
            {teamMode === 'single' ? <SingleTeam /> : <MultipleTeams />}
        </div>
    );
}

export default App;
