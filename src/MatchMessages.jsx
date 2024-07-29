import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Line } from 'react-chartjs-2';
import { FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';

function MatchMessages({ dataType }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 10; // Number of messages per page

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
          setData(results.data.reverse()); // Reverse the order of data
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

  const getChartData = (teamNumber) => {
    const teamMatches = data.filter((row) => row['Teams'] === teamNumber);
    const labels = teamMatches.map((match) => `Match ${match['Match Number']}`);
    const datasets = [
      {
        label: 'AMP AUTO',
        data: teamMatches.map((match) => parseInt(match['AMP AUTO'], 10)),
        borderColor: 'rgba(75,192,192,1)',
        fill: false,
      },
      {
        label: 'SPEAKER AUTO',
        data: teamMatches.map((match) => parseInt(match['SPEAKER AUTO'], 10)),
        borderColor: 'rgba(153,102,255,1)',
        fill: false,
      },
      {
        label: 'mid notes',
        data: teamMatches.map((match) => parseInt(match['mid notes'], 10)),
        borderColor: 'rgba(255,159,64,1)',
        fill: false,
      },
      {
        label: 'tele AMP',
        data: teamMatches.map((match) => parseInt(match['tele AMP'], 10)),
        borderColor: 'rgba(255,99,132,1)',
        fill: false,
      }
    ];

    return { labels, datasets };
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
        const chartData = getChartData(row['Teams']);
        return (
          <div key={index} className="match-message" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="match-info" style={{ flex: 1 }}>
              <div className="match-header">
                <h3>Team {row['Teams']}</h3>
                <p>Match {row['Match Number']}</p>
              </div>
              <div className="match-stats">
                <p><span>AMP AUTO:</span> {row['AMP AUTO']}</p>
                <p><span>SPEAKER AUTO:</span> {row['SPEAKER AUTO']}</p>
                <p><span>mid notes:</span> {row['mid notes']}</p>
                <p><span>tele AMP:</span> {row['tele AMP']}</p>
              </div>
              <div className="match-analysis">
                {typeof analysis === 'string' ? (
                  <p>{analysis}</p>
                ) : (
                  <>
                    <div className="analysis-section">
                      <h4>Improvements:</h4>
                      {analysis.improvements.length > 0 ? (
                        analysis.improvements.map((item, i) => (
                          <p key={i}><FaArrowUp size={20} color="green" /> {item}</p>
                        ))
                      ) : (
                        <p>None</p>
                      )}
                    </div>
                    <div className="analysis-section">
                      <h4>Declines:</h4>
                      {analysis.declines.length > 0 ? (
                        analysis.declines.map((item, i) => (
                          <p key={i}><FaArrowDown size={20} color="red" /> {item}</p>
                        ))
                      ) : (
                        <p>None</p>
                      )}
                    </div>
                    <div className="analysis-section">
                      <h4>Stable:</h4>
                      {analysis.stable.length > 0 ? (
                        analysis.stable.map((item, i) => (
                          <p key={i}><FaEquals size={20} color="gray" /> {item}</p>
                        ))
                      ) : (
                        <p>None</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="match-graph" style={{ width: '1000px', height: '400px' }}>
              <Line data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
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