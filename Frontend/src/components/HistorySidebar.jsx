// frontend/src/components/HistorySidebar.js - Updated with New UI button
import React from 'react';
import { Button } from './ui';
import './HistorySidebar.css';

const HistorySidebar = ({ history, currentVersionId, onSelectVersion, onNewUI }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const truncateIntent = (intent, maxLength = 40) => {
    return intent.length > maxLength ? intent.substring(0, maxLength) + '...' : intent;
  };

  return (
    <div className="history-sidebar">
      <div className="history-header">
        <div className="history-header-top">
          <h3>Version History</h3>
          <Button 
            variant="outline" 
            size="small" 
            onClick={onNewUI}
            className="new-ui-history-button"
          >
            <span className="button-icon">✨</span>
            New UI
          </Button>
        </div>
        <span className="history-count">{history.length} versions</span>
      </div>
      
      <div className="history-list">
        {history.length === 0 ? (
          <div className="history-empty">
            <div className="empty-icon">📋</div>
            <p>No versions yet</p>
            <p className="empty-hint">Generate your first UI to get started</p>
            <Button 
              variant="primary" 
              size="small" 
              onClick={onNewUI}
              className="empty-state-button"
            >
              ✨ Generate New UI
            </Button>
          </div>
        ) : (
          history.map((version) => (
            <div
              key={version._id}
              className={`history-item ${version._id === currentVersionId ? 'active' : ''}`}
              onClick={() => onSelectVersion(version._id)}
            >
              <div className="history-item-header">
                <span className="version-number">Version {version.versionNumber}</span>
                {version.isActive && (
                  <span className="active-badge">Current</span>
                )}
              </div>
              <div className="history-item-intent">
                {truncateIntent(version.userIntent)}
              </div>
              <div className="history-item-meta">
                <span className="timestamp">{formatDate(version.createdAt)}</span>
                <span className="component-count">
                  {version.plan?.components?.length || 0} components
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistorySidebar;