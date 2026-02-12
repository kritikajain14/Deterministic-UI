
import React from 'react';
import './styles.css';

const Table = ({
  columns = [],
  data = [],
  striped = false,
  bordered = false,
  hoverable = false,
  ...props
}) => {
  const className = `ui-table ${striped ? 'ui-table-striped' : ''} ${bordered ? 'ui-table-bordered' : ''} ${hoverable ? 'ui-table-hoverable' : ''}`;
  
  return (
    <div className="ui-table-container">
      <table className={className} {...props}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>{row[column] || row[colIndex] || ''}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;