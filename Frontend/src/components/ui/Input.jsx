import React from 'react';
import './styles.css';

const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  label,
  error,
  disabled = false,
  required = false,
  ...props
}) => {
  const className = `ui-input ${error ? 'ui-input-error' : ''} ${disabled ? 'ui-input-disabled' : ''}`;
  
  return (
    <div className="ui-input-wrapper">
      {label && (
        <label className="ui-input-label">
          {label}
          {required && <span className="ui-input-required">*</span>}
        </label>
      )}
      <input
        className={className}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        {...props}
      />
      {error && <span className="ui-input-error-message">{error}</span>}
    </div>
  );
};

export default Input;