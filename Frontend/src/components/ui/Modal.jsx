
import React, { useEffect } from 'react';
import './styles.css';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  ...props
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="ui-modal-overlay" onClick={onClose}>
      <div 
        className={`ui-modal ui-modal-${size}`}
        onClick={e => e.stopPropagation()}
        {...props}
      >
        <div className="ui-modal-header">
          <h3 className="ui-modal-title">{title}</h3>
          <button className="ui-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="ui-modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;