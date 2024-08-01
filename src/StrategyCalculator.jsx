import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const StrategyCalculator = ({ gid, dataType, teamNumbers }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redCycles, setRedCycles] = useState(null);
  const [blueCycles, setBlueCycles] = useState(null);

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
          calculateStrategy(fetchedData, teamNumbers); // Process data to determine cycles
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
  }, [dataType, teamNumbers, gid]);

  const calculateStrategy = (data, teamNumbers) => {
    const redTeamNumbers = teamNumbers.slice(0, 3);
    const blueTeamNumbers = teamNumbers.slice(3);

    const redRobots = data.filter(robot => redTeamNumbers.includes(robot["Teams"]));
    const blueRobots = data.filter(robot => blueTeamNumbers.includes(robot["Teams"]));

    const redCycleData = calculateCycles(redRobots, 'Red');
    const blueCycleData = calculateCycles(blueRobots, 'Blue');

    setRedCycles(redCycleData);
    setBlueCycles(blueCycleData);
  };

  const calculateCycles = (robots, alliance) => {
    console.log(`Calculating cycles for ${alliance} alliance`);

    const totalNotesSpeaker = robots.reduce((sum, robot) => {
      const speakerAuto = parseFloat(robot["SPEAKER AUTO"]) || 0;
      const teleSpeaker = parseFloat(robot["tele Speaker"]) || 0;
      console.log(`Adding SPEAKER AUTO (${speakerAuto}) and Tele Speaker (${teleSpeaker}) for team ${robot["Teams"]}`);
      return sum + speakerAuto + teleSpeaker;
    }, 0);

    const totalNotesAmp = robots.reduce((sum, robot) => {
      const ampAuto = parseFloat(robot["AMP AUTO"]) || 0;
      const teleAmp = parseFloat(robot["tele AMP"]) || 0;
      console.log(`Adding AMP AUTO (${ampAuto}) and Tele AMP (${teleAmp}) for team ${robot["Teams"]}`);
      return sum + ampAuto + teleAmp;
    }, 0);

    // New calculation logic
    const avgNotesSpeaker = totalNotesSpeaker / robots.length;
    const avgNotesAmp = totalNotesAmp / robots.length;

    const cyclesAmp = Math.floor(avgNotesAmp / 2);
    const remainingNotesAmp = avgNotesAmp % 2;

    const cyclesSpeaker = Math.floor(avgNotesSpeaker / 2);
    const remainingNotesSpeaker = avgNotesSpeaker % 2;

    const notesPerAmplification = (totalNotesSpeaker + totalNotesAmp) / 2;

    console.log(`Total Speaker Notes: ${totalNotesSpeaker}`);
    console.log(`Total AMP Notes: ${totalNotesAmp}`);
    console.log(`Average Speaker Notes per Robot: ${avgNotesSpeaker}`);
    console.log(`Average AMP Notes per Robot: ${avgNotesAmp}`);
    console.log(`Cycles for AMP: ${cyclesAmp}`);
    console.log(`Cycles for Speaker: ${cyclesSpeaker}`);
    console.log(`Notes per Amplification: ${notesPerAmplification}`);

    return {
      totalNotesSpeaker,
      totalNotesAmp,
      cyclesSpeaker,
      cyclesAmp,
      remainingNotesSpeaker,
      remainingNotesAmp,
      notesPerAmplification
    };
  };

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <h2>Recommended Strategy</h2>
          {teamNumbers.length === 6 && (
            <>
              <div>
                <h3>Red Alliance</h3>
                <p>Teams: {teamNumbers.slice(0, 3).join(', ')}</p>
                {redCycles ? (
                  <div>
                    <p>Total Speaker Notes: {redCycles.totalNotesSpeaker}</p>
                    <p>Total AMP Notes: {redCycles.totalNotesAmp}</p>
                    <p>Average Speaker Notes per Robot: {redCycles.avgNotesSpeaker}</p>
                    <p>Average AMP Notes per Robot: {redCycles.avgNotesAmp}</p>
                    <p>Cycles for AMP: {redCycles.cyclesAmp}</p>
                    <p>Cycles for Speaker: {redCycles.cyclesSpeaker}</p>
                    <p>Notes per Amplification: {redCycles.notesPerAmplification}</p>
                  </div>
                ) : (
                  <p>No data available for calculations</p>
                )}
              </div>
              <div>
                <h3>Blue Alliance</h3>
                <p>Teams: {teamNumbers.slice(3).join(', ')}</p>
                {blueCycles ? (
                  <div>
                    <p>Total Speaker Notes: {blueCycles.totalNotesSpeaker}</p>
                    <p>Total AMP Notes: {blueCycles.totalNotesAmp}</p>
                    <p>Average Speaker Notes per Robot: {blueCycles.avgNotesSpeaker}</p>
                    <p>Average AMP Notes per Robot: {blueCycles.avgNotesAmp}</p>
                    <p>Cycles for AMP: {blueCycles.cyclesAmp}</p>
                    <p>Cycles for Speaker: {blueCycles.cyclesSpeaker}</p>
                    <p>Notes per Amplification: {blueCycles.notesPerAmplification}</p>
                  </div>
                ) : (
                  <p>No data available for calculations</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StrategyCalculator;
