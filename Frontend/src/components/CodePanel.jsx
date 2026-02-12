// frontend/src/components/CodePanel.js - Updated to remove explanation tab
import React, { useState } from 'react';
import './CodePanel.css';

const CodePanel = ({ code, onCodeChange }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="code-panel-container">
      <div className="code-header">
        <div className="code-title">
          <h3>Generated React Code</h3>
          <span className="code-language">JSX</span>
        </div>
        <div className="code-actions">
          <button 
            className="copy-button"
            onClick={handleCopy}
          >
            {copySuccess ? '✓ Copied!' : '📋 Copy Code'}
          </button>
        </div>
      </div>
      
      <div className="code-content">
        <textarea
          className="code-editor"
          value={code || '// No code generated yet\n// Start by describing your UI in the chat panel'}
          onChange={(e) => onCodeChange(e.target.value)}
          spellCheck={false}
          wrap="off"
        />
      </div>
    </div>
  );
};

export default CodePanel;