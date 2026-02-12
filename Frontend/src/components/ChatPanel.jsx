
import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Card } from './ui';
import './ChatPanel.css';

const ChatPanel = ({ 
  onGenerateNew, 
  onApplyChanges, 
  loading, 
  error, 
  currentIntent,
  hasExistingUI,
  mode,
  onNewUI
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentIntent && mode === 'apply') {
      // Add AI response when UI is generated or modified
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.type === 'user') {
        setMessages(prev => [...prev, { 
          type: 'assistant', 
          content: `✓ ${prev.length === 0 ? 'Generated' : 'Updated'} UI based on: "${currentIntent}"`,
          timestamp: new Date().toISOString()
        }]);
      }
    }
  }, [currentIntent, mode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = { 
      type: 'user', 
      content: message,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    
    const currentMessage = message;
    setMessage('');

    if (mode === 'new') {
      // Generate brand new UI
      await onGenerateNew(currentMessage);
    } else {
      // Apply changes to existing UI
      await onApplyChanges(currentMessage);
    }
  };

  const handleNewUIClick = () => {
    setMessages([]);
    setMessage('');
    onNewUI();
  };

  const handleExampleClick = (example) => {
    setMessage(example);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-panel-container">
      <div className="chat-header">
        <div className="chat-header-left">
          <h3>UI Generator</h3>
          <div className="mode-indicator-header">
            {mode === 'new' ? (
              <span className="mode-badge mode-new">
                <span className="mode-icon">✨</span>
                New UI Mode
              </span>
            ) : (
              <span className="mode-badge mode-apply">
                <span className="mode-icon">🔄</span>
                Apply Changes Mode
              </span>
            )}
          </div>
        </div>
        <div className="chat-header-right">
          {hasExistingUI && (
            <Button 
              variant="outline" 
              size="small" 
              onClick={handleNewUIClick}
              disabled={loading}
              className="new-ui-header-button"
            >
              <span className="button-icon">✨</span>
              New UI
            </Button>
          )}
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            {mode === 'new' ? (
              <Card elevation={1} className="welcome-card">
                <div className="welcome-icon">✨</div>
                <h4>Create a New UI</h4>
                <p className="welcome-description">
                  Describe the interface you want to build. The AI will generate a complete React component using our fixed component library.
                </p>
                <div className="feature-list">
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Fresh component tree</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>New version created</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Previous UI preserved in history</span>
                  </div>
                </div>
                <div className="examples-section">
                  <p className="examples-title">Try an example:</p>
                  <div className="example-buttons">
                    <button 
                      className="example-button"
                      onClick={() => handleExampleClick('Create a dashboard with a chart showing sales data and a table of recent orders')}
                    >
                      📊 Dashboard
                    </button>
                    <button 
                      className="example-button"
                      onClick={() => handleExampleClick('Make a user registration form with name, email, password and submit button')}
                    >
                      📝 Registration Form
                    </button>
                    <button 
                      className="example-button"
                      onClick={() => handleExampleClick('Build a product card with image placeholder, title, price and add to cart button')}
                    >
                      🏷️ Product Card
                    </button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card elevation={1} className="welcome-card apply-mode-welcome">
                <div className="welcome-icon">🔄</div>
                <h4>Apply Changes to Existing UI</h4>
                <p className="welcome-description">
                  Describe what you want to change. The AI will only modify the specific components you mention, leaving everything else untouched.
                </p>
                <div className="feature-list">
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Only changes what you specify</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Preserves all other components</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Creates new version for rollback</span>
                  </div>
                </div>
                <div className="examples-section">
                  <p className="examples-title">Try these changes:</p>
                  <div className="example-buttons">
                    <button 
                      className="example-button"
                      onClick={() => handleExampleClick('Change the button label to "Submit Order" and make it primary')}
                    >
                      ✏️ Modify Button
                    </button>
                    <button 
                      className="example-button"
                      onClick={() => handleExampleClick('Add a table with columns: Product, Quantity, Price')}
                    >
                      ➕ Add Table
                    </button>
                    <button 
                      className="example-button"
                      onClick={() => handleExampleClick('Remove the sidebar and move the navigation to the top')}
                    >
                      🗑️ Remove & Move
                    </button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message chat-message-${msg.type}`}>
                <div className="message-avatar">
                  {msg.type === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content-wrapper">
                  <div className="message-header">
                    <span className="message-sender">
                      {msg.type === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    <span className="message-time">{formatTimestamp(msg.timestamp)}</span>
                  </div>
                  <div className="message-content">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Mode context indicator */}
            <div className="mode-context">
              <span className={`context-badge ${mode}`}>
                {mode === 'new' ? '✨ Currently creating new UI' : '🔄 Currently modifying existing UI'}
              </span>
            </div>
          </>
        )}
        
        {loading && (
          <div className="chat-message chat-message-ai">
            <div className="message-avatar">🤖</div>
            <div className="message-content-wrapper">
              <div className="message-header">
                <span className="message-sender">AI Assistant</span>
              </div>
              <div className="message-content loading-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="loading-text">
                  {mode === 'new' 
                    ? 'Generating your new UI...' 
                    : 'Applying targeted changes...'}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="chat-error">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <strong>Error:</strong> {error}
          </div>
          <button className="dismiss-error" onClick={() => window.location.reload()}>
            Dismiss
          </button>
        </div>
      )}
      
      <form className="chat-input" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          {mode === 'new' ? (
            <Input
              placeholder="Describe the UI you want to create..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              className="chat-input-field"
            />
          ) : (
            <Input
              placeholder="Describe what changes to apply..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading || !hasExistingUI}
              className="chat-input-field"
            />
          )}
          <Button 
            type="submit" 
            disabled={!message.trim() || loading || (mode === 'apply' && !hasExistingUI)}
            className={`submit-button ${mode}`}
          >
            {mode === 'new' ? (
              <>
                <span className="button-icon">✨</span>
                Generate UI
              </>
            ) : (
              <>
                <span className="button-icon">🔄</span>
                Apply Changes
              </>
            )}
          </Button>
        </div>
      </form>
      
      {mode === 'apply' && hasExistingUI && (
        <div className="modification-hint">
          <div className="hint-icon">💡</div>
          <div className="hint-text">
            Only the components you mention will be modified. Everything else stays exactly the same.
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;