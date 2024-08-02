import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './App.css'; // Import the CSS file

const StrategyCalculator = ({ gid, dataType, teamNumbers }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redResults, setRedResults] = useState(null);
  const [blueResults, setBlueResults] = useState(null);
  const [currentTeamNumbers, setCurrentTeamNumbers] = useState([...teamNumbers]);

  const fetchData = async () => {
    setLoading(true);
    const publicSpreadsheetUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRojRhLgZSPXJopPdni1V4Z-inXXY3a__2NaVMsoJHPs9d25ZQ7t56QX67mncr6yo-w4B8WCWyHFe2m/pub?output=csv&gid=${gid}`;
    const cacheBuster = `cacheBuster=${new Date().getTime()}`;
    const urlWithCacheBuster = `${publicSpreadsheetUrl}&${cacheBuster}`;

    try {
      Papa.parse(urlWithCacheBuster, {
        download: true,
        header: true,
        complete: function (results) {
          const fetchedData = results.data.reverse(); // Reverse the order of data
          setData(fetchedData);
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
  }, [dataType, gid]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (data.length > 0) {
      calculateStrategy(data, currentTeamNumbers);
    }
  };

  const handleTeamNumberChange = (index, event) => {
    const newTeamNumbers = [...currentTeamNumbers];
    newTeamNumbers[index] = event.target.value;
    setCurrentTeamNumbers(newTeamNumbers);
  };

  const calculateStrategy = (data, teamNumbers) => {
    const redTeamNumbers = teamNumbers.slice(0, 3);
    const blueTeamNumbers = teamNumbers.slice(3);

    const redRobots = data.filter(robot => redTeamNumbers.includes(robot["Teams"]));
    const blueRobots = data.filter(robot => blueTeamNumbers.includes(robot["Teams"]));

    const redCycleData = calculateCycles(redRobots, 'Red');
    const blueCycleData = calculateCycles(blueRobots, 'Blue');

    setRedResults(redCycleData);
    setBlueResults(blueCycleData);
  };

  const calculateCycles = (robots, alliance) => {
    console.log(`Calculating cycles for ${alliance} alliance`);

    // Calculate total notes for speaker and amp in auto and tele phases
    const totalSpeakerAuto = robots.reduce((sum, robot) => sum + (parseFloat(robot["SPEAKER AUTO"]) || 0), 0);
    const totalAmpAuto = robots.reduce((sum, robot) => sum + (parseFloat(robot["AMP AUTO"]) || 0), 0);

    const totalSpeakerTele = robots.reduce((sum, robot) => sum + (parseFloat(robot["tele Speaker"]) || 0), 0);
    const totalAmpTele = robots.reduce((sum, robot) => sum + (parseFloat(robot["tele AMP"]) || 0), 0);

    const totalNotesSpeaker = totalSpeakerAuto + totalSpeakerTele;
    const totalNotesAmp = totalAmpAuto + totalAmpTele;

    // Calculate full amplification cycles using tele notes only
    const fullAmplificationCycles = Math.min(Math.floor(totalSpeakerTele / 4), Math.floor(totalAmpTele / 2));
    const remainingSpeakerTele = totalSpeakerTele - (fullAmplificationCycles * 4);
    const remainingAmpTele = totalAmpTele - (fullAmplificationCycles * 2);

    // Calculate partial amplification cycles
    const partialAmplificationCycles = remainingAmpTele >= 2 && remainingSpeakerTele > 0 ? 1 : 0;
    const speakerInPartialCycle = partialAmplificationCycles ? remainingSpeakerTele : 0;
    const remainingAmpAfterPartial = partialAmplificationCycles ? remainingAmpTele - 2 : remainingAmpTele;
    const remainingSpeakerAfterPartial = partialAmplificationCycles ? 0 : remainingSpeakerTele;

    // Points calculation
    const ampPerScore = 1;
    const speakerPerScore = 2;
    const speakerAmplifiedPerScore = 5;

    const pointsAuto = (totalSpeakerAuto * 5) + (totalAmpAuto * 2);
    const pointsFullAmplified = fullAmplificationCycles * ((speakerAmplifiedPerScore * 4) + (ampPerScore * 2));
    const pointsPartialAmplified = speakerInPartialCycle * speakerAmplifiedPerScore;
    const pointsRemaining = (remainingSpeakerAfterPartial * speakerPerScore) + (remainingAmpAfterPartial * ampPerScore);

    const potentialPoints = pointsAuto + pointsFullAmplified + pointsPartialAmplified + pointsRemaining;

    console.log(`Total Speaker Notes: ${totalNotesSpeaker.toFixed(2)}`);
    console.log(`Total AMP Notes: ${totalNotesAmp.toFixed(2)}`);
    console.log(`Full Amplification Cycles: ${fullAmplificationCycles}`);
    console.log(`Partial Amplification Cycles: ${partialAmplificationCycles}`);
    console.log(`Remaining AMP Notes: ${remainingAmpAfterPartial}`);
    console.log(`Remaining Speaker Notes: ${remainingSpeakerAfterPartial}`);
    console.log(`Potential Points: ${potentialPoints}`);

    return {
      totalNotesSpeaker: totalNotesSpeaker.toFixed(2),
      totalNotesAmp: totalNotesAmp.toFixed(2),
      fullAmplificationCycles,
      partialAmplificationCycles,
      speakerInPartialCycle: speakerInPartialCycle.toFixed(2),
      remainingSpeaker: remainingSpeakerAfterPartial.toFixed(2),
      remainingAmp: remainingAmpAfterPartial.toFixed(2),
      potentialPoints
    };
  };

  return (
    <div className="strategy-calculator">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <h2>Recommended Strategy</h2>
          {currentTeamNumbers.length === 6 && (
            <form onSubmit={handleSubmit}>
              <div className="alliance-section">
                <h3>Red Alliance</h3>
                {currentTeamNumbers.slice(0, 3).map((teamNumber, index) => (
                  <div key={index} className="team-input">
                    <label>
                      Team {index + 1}:
                      <input
                        type="text"
                        value={teamNumber}
                        onChange={(e) => handleTeamNumberChange(index, e)}
                      />
                    </label>
                  </div>
                ))}
              </div>
              <div className="alliance-section">
                <h3>Blue Alliance</h3>
                {currentTeamNumbers.slice(3).map((teamNumber, index) => (
                  <div key={index} className="team-input">
                    <label>
                      Team {index + 4}:
                      <input
                        type="text"
                        value={teamNumber}
                        onChange={(e) => handleTeamNumberChange(index + 3, e)}
                      />
                    </label>
                  </div>
                ))}
              </div>
              <button type="submit" className="calculate-button">Calculate</button>
            </form>
          )}
          {redResults && blueResults && (
            <div className="results-section">
              <div className="alliance-results">
                <h3>Red Alliance Results</h3>
                <p>Total Speaker Notes: {redResults.totalNotesSpeaker}</p>
                <p>Total AMP Notes: {redResults.totalNotesAmp}</p>
                <p>Full Amplification Cycles: {redResults.fullAmplificationCycles}</p>
                <p>Partial Amplification Cycles: {redResults.partialAmplificationCycles} (Speaker Notes: {redResults.speakerInPartialCycle})</p>
                <p>Remaining AMP Notes: {redResults.remainingAmp}</p>
                <p>Remaining Speaker Notes: {redResults.remainingSpeaker}</p>
                <p>Potential Points: {redResults.potentialPoints}</p>
              </div>
              <div className="alliance-results">
                <h3>Blue Alliance Results</h3>
                <p>Total Speaker Notes: {blueResults.totalNotesSpeaker}</p>
                <p>Total AMP Notes: {blueResults.totalNotesAmp}</p>
                <p>Full Amplification Cycles: {blueResults.fullAmplificationCycles}</p>
                <p>Partial Amplification Cycles: {blueResults.partialAmplificationCycles} (Speaker Notes: {blueResults.speakerInPartialCycle})</p>
                <p>Remaining AMP Notes: {blueResults.remainingAmp}</p>
                <p>Remaining Speaker Notes: {blueResults.remainingSpeaker}</p>
                <p>Potential Points: {blueResults.potentialPoints}</p>
              </div>
              <div className="progress-bar">
                <div className="progress red" style={{ width: `${(redResults.potentialPoints / (redResults.potentialPoints + blueResults.potentialPoints)) * 100}%` }}>
                  {redResults.potentialPoints} pts
                </div>
                <div className="progress blue" style={{ width: `${(blueResults.potentialPoints / (redResults.potentialPoints + blueResults.potentialPoints)) * 100}%` }}>
                  {blueResults.potentialPoints} pts
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StrategyCalculator;
