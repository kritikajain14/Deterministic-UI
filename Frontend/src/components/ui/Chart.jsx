
import React from 'react';
import './styles.css';

const Chart = ({
  type = 'bar',
  data = [],
  title,
  height = 300,
  ...props
}) => {
  // Simplified chart representation - in production, use a proper charting library
  // that meets the deterministic requirements
  return (
    <div className="ui-chart" {...props}>
      {title && <h4 className="ui-chart-title">{title}</h4>}
      <div className="ui-chart-container" style={{ height }}>
        <div className="ui-chart-placeholder">
          <p>Chart Preview: {type}</p>
          <p>Data points: {data.length}</p>
        </div>
      </div>
    </div>
  );
};

export default Chart;