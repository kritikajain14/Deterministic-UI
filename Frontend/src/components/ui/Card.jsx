import React from 'react';
import './styles.css';

const Card = ({ 
  children, 
  title,
  subtitle,
  elevation = 1,
  ...props 
}) => {
  const className = `ui-card ui-card-elevation-${elevation}`;
  
  return (
    <div className={className} {...props}>
      {(title || subtitle) && (
        <div className="ui-card-header">
          {title && <h3 className="ui-card-title">{title}</h3>}
          {subtitle && <p className="ui-card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="ui-card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;