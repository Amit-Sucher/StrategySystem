import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

function MatchMessages({ dataType }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 10;

  const fetchData = async (sheetType) => {
    setLoading(true);
    let gid = '368108442'; // GID for allMatches sheet

    const publicSpreadsheetUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRojRhLgZSPXJopPdni1V4Z-inXXY3a__2NaVMsoJHPs9d25ZQ7t56QX67mncr6yo-w4B8WCWyHFe2m/pub?output=csv&gid=${gid}`;
    const cacheBuster = `cacheBuster=${new Date().getTime()}`;
    const urlWithCacheBuster = `${publicSpreadsheetUrl}&${cacheBuster}`;

    try {
      Papa.parse(urlWithCacheBuster, {
        download: true,
        header: true,
        complete: function (results) {
          setData(results.data.reverse()); // Reverse the order of data here
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
    fetchData(dataType);
  }, [dataType]);

  const analyzePerformance = (teamNumber) => {
    const teamMatches = data.filter((row) => row['Teams'] === teamNumber);
    if (teamMatches.length < 2) return 'Not enough data to analyze';

    const recentMatch = teamMatches[teamMatches.length - 1];
    const previousMatch = teamMatches[teamMatches.length - 2];

    const improvements = [];
    const declines = [];
    const stable = [];

    for (let key of Object.keys(recentMatch)) {
      if (key === 'Teams' || key === 'Match Number' || key === 'map') continue;
      const recentValue = parseInt(recentMatch[key], 10);
      const previousValue = parseInt(previousMatch[key], 10);

      if (recentValue > previousValue) improvements.push(key);
      else if (recentValue < previousValue) declines.push(key);
      else stable.push(key);
    }

    return { improvements, declines, stable };
  };

  // Pagination logic
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = data.slice(indexOfFirstMessage, indexOfLastMessage);

  const totalPages = Math.ceil(data.length / messagesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="match-messages-container">
      {loading && (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      )}
      {currentMessages.map((row, index) => {
        const analysis = analyzePerformance(row['Teams']);
        return (
          <div key={index} className="match-message">
            <p>Team {row['Teams']} - Match {row['Match Number']}</p>
            <p>AMP AUTO: {row['AMP AUTO']}, SPEAKER AUTO: {row['SPEAKER AUTO']}, ...</p>
            <p>Map: {row['map']}</p>
            {typeof analysis === 'string' ? (
              <p>{analysis}</p>
            ) : (
              <>
                <p>Improvements: {analysis.improvements.join(', ')}</p>
                <p>Declines: {analysis.declines.join(', ')}</p>
                <p>Stable: {analysis.stable.join(', ')}</p>
              </>
            )}
          </div>
        );
      })}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePageChange(i + 1)}
            className={currentPage === i + 1 ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MatchMessages;
