import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import styled from 'styled-components';
import { useTable, useSortBy, useFilters } from 'react-table';

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }

    th {
      background: #22333B;
      color: #E0E0E0; /* Changed column title color */
      font-weight: bold;
    }

    td div {
      font-weight: bold; /* Make the numbers bold */
    }
  }
`;

const AllData = ({ dataType }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (sheetType) => {
    setLoading(true);
    let gid = '564661292'; // Default to average data

    if (sheetType === 'lastMatch') {
      gid = '1741346213';
    } else if (sheetType === 'last3Matches') {
      gid = '1660695738';
    }

    const publicSpreadsheetUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRojRhLgZSPXJopPdni1V4Z-inXXY3a__2NaVMsoJHPs9d25ZQ7t56QX67mncr6yo-w4B8WCWyHFe2m/pub?output=csv&gid=${gid}`;
    const cacheBuster = `cacheBuster=${new Date().getTime()}`;
    const urlWithCacheBuster = `${publicSpreadsheetUrl}&${cacheBuster}`;

    try {
      Papa.parse(urlWithCacheBuster, {
        download: true,
        header: true,
        complete: function (results) {
          setData(results.data);
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

    const intervalId = setInterval(() => fetchData(dataType), 30000); /* refresh every 30 seconds */

    return () => clearInterval(intervalId);
  }, [dataType]);

  const getColumnMaxValue = (column) => {
    return Math.max(...data.map(row => parseFloat(row[column]) || 0));
  };

  const getColumnMinValue = (column) => {
    return Math.min(...data.map(row => parseFloat(row[column]) || 0));
  };

  const getCellColor = (value, minValue, maxValue, column) => {
    if (column === 'Teams') return 'white';
    if (maxValue === 0) return 'white'; // Avoid division by zero
    const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
    if (percentage <= 33) return '#ccf2ff'; // Light blue
    if (percentage <= 66) return '#ffcccc'; // Light red
    return '#ffd580'; // Light orange
  };

  const columns = React.useMemo(() => {
    if (data.length > 0) {
      return Object.keys(data[0]).map((key) => {
        const maxValue = getColumnMaxValue(key);
        const minValue = getColumnMinValue(key);
        return {
          Header: key,
          accessor: key,
          Cell: ({ value }) => (
            <div style={{ backgroundColor: getCellColor(parseFloat(value), minValue, maxValue, key) }}>{value}</div>
          ),
        };
      });
    }
    return [];
  }, [data]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy,
    useFilters // This will allow sorting and filtering to work independently for each column
  );

  return (
    <Styles>
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render('Header')}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' 🔽'
                          : ' 🔼'
                        : ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Styles>
  );
};

export default AllData;
