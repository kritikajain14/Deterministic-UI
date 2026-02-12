import React from 'react';
import './styles.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  onClick,
  fullWidth = false,
  type = 'button',
  ...props 
}) => {
  const className = `ui-button ui-button-${variant} ui-button-${size} ${fullWidth ? 'ui-button-fullwidth' : ''}`;
  
  return (
    <button
      className={className}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;