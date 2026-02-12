// frontend/src/App.js - Corrected with proper UI/Apply Changes separation
import React, { useState, useEffect, useCallback } from 'react';
import Split from 'react-split';
import ChatPanel from './components/ChatPanel';
import CodePanel from './components/CodePanel';
import PreviewPanel from './components/PreviewPanel';
import ExplanationPanel from './components/ExplanationPanel';
import HistorySidebar from './components/HistorySidebar';
import api from './services/api';
import './App.css';

function App() {
  const [currentVersion, setCurrentVersion] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [showExplanation, setShowExplanation] = useState(true);
  const [mode, setMode] = useState('new'); // 'new' or 'apply'

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.getHistory();
      setHistory(response.data.history);
      
      // Set active version as current
      const activeVersion = response.data.history.find(v => v.isActive);
      if (activeVersion) {
        setCurrentVersion(activeVersion);
        setGeneratedCode(activeVersion.generatedCode);
        setExplanation(activeVersion.explanation);
        setMode('apply'); // Switch to apply mode when UI exists
      } else {
        setMode('new'); // No UI, stay in new mode
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleGenerateNew = async (intent) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.generate(intent);
      const { data } = response;
      
      setCurrentVersion(data);
      setGeneratedCode(data.generatedCode);
      setExplanation(data.explanation);
      setMode('apply'); // Switch to apply mode after generation
      await fetchHistory();
      
    } catch (err) {
      setError(err.response?.data?.error || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyChanges = async (modification) => {
    if (!currentVersion) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.iterate(currentVersion._id, modification);
      const { data } = response;
      
      setCurrentVersion(data);
      setGeneratedCode(data.generatedCode);
      setExplanation(data.explanation);
      setMode('apply'); // Stay in apply mode
      await fetchHistory();
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to apply changes');
    } finally {
      setLoading(false);
    }
  };

  const handleNewUI = () => {
    // Reset everything for a fresh UI
    setCurrentVersion(null);
    setGeneratedCode('');
    setExplanation('');
    setMode('new');
    setError(null);
  };

  const handleRollback = async (versionId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.rollback(versionId);
      const { data } = response;
      
      setCurrentVersion(data);
      setGeneratedCode(data.generatedCode);
      setExplanation(data.explanation);
      setMode('apply'); // Switch to apply mode after rollback
      await fetchHistory();
      
    } catch (err) {
      setError(err.response?.data?.error || 'Rollback failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeEdit = useCallback((newCode) => {
    setGeneratedCode(newCode);
  }, []);

  const hasExistingUI = currentVersion !== null;

  return (
    <div className="app">
      <div className="app-header">
        <div className="header-left">
          <h1>MERN AI Deterministic UI Generator</h1>
          {hasExistingUI && (
            <div className="version-info">
              <span className="version-badge">v{currentVersion.versionNumber}</span>
              <button 
                className="new-ui-button"
                onClick={handleNewUI}
                disabled={loading}
              >
                <span className="button-icon">✨</span>
                New UI
              </button>
            </div>
          )}
        </div>
        <div className="header-controls">
          <button 
            className={`toggle-button ${showHistory ? 'active' : ''}`}
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Hide' : 'Show'} History
          </button>
          <button 
            className={`toggle-button ${showExplanation ? 'active' : ''}`}
            onClick={() => setShowExplanation(!showExplanation)}
          >
            {showExplanation ? 'Hide' : 'Show'} Explanation
          </button>
        </div>
      </div>
      
      <div className="app-content">
        {showHistory && (
          <div className="history-panel">
            <HistorySidebar 
              history={history}
              currentVersionId={currentVersion?._id}
              onSelectVersion={handleRollback}
              onNewUI={handleNewUI}
            />
          </div>
        )}
        
        <Split 
          sizes={showExplanation ? [35, 45, 20] : [40, 60]}
          minSize={400}
          gutterSize={8}
          className="split main-split"
          direction="horizontal"
        >
          {/* Left Panel - Chat with explicit mode */}
          <div className="panel chat-panel">
            <ChatPanel 
              onGenerateNew={handleGenerateNew}
              onApplyChanges={handleApplyChanges}
              loading={loading}
              error={error}
              currentIntent={currentVersion?.userIntent}
              hasExistingUI={hasExistingUI}
              mode={mode}
              onNewUI={handleNewUI}
            />
          </div>
          
          {/* Middle Panel - Code and Preview */}
          <Split 
            direction="vertical"
            sizes={[50, 50]}
            minSize={200}
            gutterSize={8}
            className="split vertical-split"
          >
            <div className="panel code-panel">
              <CodePanel 
                code={generatedCode}
                onCodeChange={handleCodeEdit}
                mode={mode}
              />
            </div>
            <div className="panel preview-panel">
              <PreviewPanel 
                 plan={currentVersion?.plan}
    versionNumber={currentVersion?.versionNumber}
              />
            </div>
          </Split>
          
          {/* Right Panel - Explanation */}
          {showExplanation && (
            <div className="panel explanation-panel">
              <ExplanationPanel 
                explanation={explanation}
                modifications={currentVersion?.plan?.modifications}
                versionNumber={currentVersion?.versionNumber}
                userIntent={currentVersion?.userIntent}
                plan={currentVersion?.plan}
                mode={mode}
                isNewUI={!hasExistingUI}
              />
            </div>
          )}
        </Split>
      </div>
      
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-message">
            {mode === 'new' ? '✨ Generating new UI...' : '🔄 Applying changes...'}
          </div>
          <div className="loading-submessage">
            {mode === 'new' 
              ? 'Creating fresh component tree from your description'
              : 'Modifying only the components you specified'}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;