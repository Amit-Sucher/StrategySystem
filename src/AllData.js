import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useTable, useSortBy, useFilters } from 'react-table';

const Styles = styled.div`
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

const AllData = ({ data, loading, dataType, calculateScores }) => {
  const [weights, setWeights] = useState(Array(5).fill(0));
  const [selectedColumns, setSelectedColumns] = useState(Array(5).fill(''));

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

  const columns = useMemo(() => {
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
        <div className="app-container">
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
          <div className="formula-section">
            {selectedColumns.map((col, index) => (
              <div key={index} className="formula-input">
                <label>
                  Column {index + 1}:
                  <select value={col} onChange={e => {
                    const newSelectedColumns = [...selectedColumns];
                    newSelectedColumns[index] = e.target.value;
                    setSelectedColumns(newSelectedColumns);
                  }}>
                    <option value="">Select Column</option>
                    {columns.map(column => (
                      <option key={column.accessor} value={column.accessor}>{column.accessor}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Weight (%):
                  <input
                    type="number"
                    value={weights[index]}
                    onChange={e => {
                      const newWeights = [...weights];
                      newWeights[index] = parseFloat(e.target.value);
                      setWeights(newWeights);
                    }}
                  />
                </label>
              </div>
            ))}
            <button className="calculate-button" onClick={() => calculateScores(selectedColumns, weights)}>Calculate and Sort</button>
          </div>
        </div>
      )}
    </Styles>
  );
};

export default AllData;
