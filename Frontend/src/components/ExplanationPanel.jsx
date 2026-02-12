import React, { useState } from 'react';
import { Card, Button } from './ui';
import './ExplanationPanel.css';

const ExplanationPanel = ({ 
  explanation, 
  modifications = [], 
  versionNumber, 
  userIntent,
  plan,
  mode,
  isNewUI
}) => {
  const [expanded, setExpanded] = useState(true);

  const parseModifications = () => {
    if (!explanation) return { changes: [], summary: '', rationale: '' };
    
    const lines = explanation.split('\n');
    const changes = [];
    let summary = '';
    let rationale = '';
    let inChanges = false;
    
    lines.forEach(line => {
      if (line.includes('**Incremental Update**') || line.includes('**Modifications**') || line.includes('made the following targeted changes')) {
        inChanges = true;
      } else if (line.includes('**Layout Decision**') || line.includes('**Component Selection**') || line.includes('**Design Rationale**')) {
        inChanges = false;
        rationale += line + '\n';
      } else if (inChanges) {
        if (line.match(/^\d+\./) || line.includes('•')) {
          changes.push(line.trim());
        }
      } else {
        rationale += line + '\n';
      }
    });
    
    // Extract summary (first line)
    if (lines.length > 0) {
      summary = lines[0];
    }
    
    return { changes, summary, rationale };
  };

  const { changes, summary, rationale } = parseModifications();
  const hasChanges = changes.length > 0 || (modifications && modifications.length > 0);

  return (
    <div className="explanation-panel-container">
      <div className="explanation-header">
        <div className="explanation-title">
          <h3>AI Explanation</h3>
          {versionNumber && (
            <span className="version-badge">v{versionNumber}</span>
          )}
          {isNewUI ? (
            <span className="mode-badge new">
              <span className="mode-icon">✨</span>
              New UI
            </span>
          ) : (
            <span className="mode-badge apply">
              <span className="mode-icon">🔄</span>
              Update
            </span>
          )}
        </div>
        <Button 
          variant="outline" 
          size="small" 
          onClick={() => setExpanded(!expanded)}
          className="expand-button"
        >
          {expanded ? '▼' : '▶'}
        </Button>
      </div>
      
      <div className="explanation-content">
        {!explanation ? (
          <div className="explanation-empty">
            <div className="empty-icon">🤖</div>
            <h4>No Explanation Yet</h4>
            <p>
              {isNewUI 
                ? 'Generate a new UI to see the AI\'s design decisions.'
                : 'Apply changes to see what the AI modified and why.'}
            </p>
          </div>
        ) : (
          <>
            {/* Summary Card */}
            <div className="summary-card">
              <div className="summary-icon">
                {isNewUI ? '✨' : '🔄'}
              </div>
              <div className="summary-text">
                <h4>{isNewUI ? 'New UI Generated' : 'Changes Applied'}</h4>
                <p>{summary || explanation.split('\n')[0]}</p>
              </div>
            </div>

            {/* What Changed Section - Only for modifications */}
            {!isNewUI && hasChanges && expanded && (
              <div className="changes-section">
                <div className="section-header">
                  <span className="section-icon">📋</span>
                  <h4>What Changed</h4>
                  <span className="change-count">{changes.length} updates</span>
                </div>
                <div className="changes-list">
                  {changes.map((change, index) => {
                    // Determine change type
                    let type = 'modify';
                    if (change.includes('Added')) type = 'add';
                    else if (change.includes('Removed') || change.includes('Deleted')) type = 'remove';
                    else if (change.includes('Moved')) type = 'move';
                    else if (change.includes('Replaced')) type = 'replace';
                    else if (change.includes('Renamed') || change.includes('Changed')) type = 'update';
                    
                    return (
                      <div key={index} className={`change-item ${type}`}>
                        <span className="change-icon">
                          {type === 'add' && '➕'}
                          {type === 'remove' && '🗑️'}
                          {type === 'move' && '📦'}
                          {type === 'replace' && '🔄'}
                          {type === 'update' && '✏️'}
                          {type === 'modify' && '⚡'}
                        </span>
                        <span className="change-text">{change}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="change-note">
                  ⚡ Only the components listed above were modified. All other components remain exactly as they were.
                </div>
              </div>
            )}

            {/* Why Section - Design Rationale */}
            {expanded && (
              <div className="rationale-section">
                <div className="section-header">
                  <span className="section-icon">💭</span>
                  <h4>{isNewUI ? 'Why This Design' : 'Why These Changes'}</h4>
                </div>
                <div className="rationale-content">
                  {rationale.split('\n').map((paragraph, i) => {
                    if (paragraph.trim() === '') return null;
                    if (paragraph.includes('**')) {
                      const parts = paragraph.split(/\*\*(.*?)\*\*/g);
                      return (
                        <p key={i} className="formatted-text">
                          {parts.map((part, j) => 
                            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                          )}
                        </p>
                      );
                    }
                    return <p key={i}>{paragraph}</p>;
                  })}
                </div>
              </div>
            )}

            {/* Component Structure */}
            {plan && plan.components && expanded && (
              <div className="structure-section">
                <div className="section-header">
                  <span className="section-icon">🏗️</span>
                  <h4>Component Structure</h4>
                  <span className="component-count">
                    {plan.components.length} root components
                  </span>
                </div>
                <div className="structure-content">
                  <pre className="structure-tree">
                    {JSON.stringify(plan.components, null, 2)
                      .replace(/"([^"]+)":/g, '$1:')
                      .replace(/"/g, '')}
                  </pre>
                </div>
              </div>
            )}

            {/* Determinism Badge */}
            <div className="determinism-badge">
              <span className="badge-icon">✓</span>
              <span className="badge-text">Deterministic Generation</span>
              <span className="badge-tooltip">Same input always produces identical output</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExplanationPanel;