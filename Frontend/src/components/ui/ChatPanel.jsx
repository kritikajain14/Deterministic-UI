
import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Card } from './ui';
import './ChatPanel.css';

const ChatPanel = ({ onGenerate, onIterate, loading, error, currentIntent }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentIntent) {
      setMessages(prev => {
        const exists = prev.some(m => m.content === currentIntent);
        if (!exists) {
          return [...prev, { type: 'user', content: currentIntent }];
        }
        return prev;
      });
    }
  }, [currentIntent]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = { type: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    if (currentIntent) {
      await onIterate(message);
    } else {
      await onGenerate(message);
    }
  };

  const handleSuggestion = (suggestion) => {
    setMessage(suggestion);
  };

  return (
    <div className="chat-panel-container">
      <div className="chat-header">
        <h3>UI Generator Chat</h3>
        <span className="chat-status">
          {loading ? 'Generating...' : currentIntent ? 'Editing mode' : 'Ready'}
        </span>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <Card elevation={1}>
              <h4>Welcome to AI UI Generator</h4>
              <p>Describe the interface you want to create using our deterministic component library.</p>
              <div className="suggestions">
                <Button 
                  variant="outline" 
                  size="small" 
                  onClick={() => handleSuggestion('Create a dashboard with a chart and data table')}
                >
                  Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  size="small" 
                  onClick={() => handleSuggestion('Make a form with input fields and submit button')}
                >
                  Form
                </Button>
                <Button 
                  variant="outline" 
                  size="small" 
                  onClick={() => handleSuggestion('Show a modal with confirmation')}
                >
                  Modal
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`chat-message chat-message-${msg.type}`}>
              <div className="message-avatar">
                {msg.type === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="chat-message chat-message-ai">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="chat-error">
          Error: {error}
        </div>
      )}
      
      <form className="chat-input" onSubmit={handleSubmit}>
        <Input
          placeholder={currentIntent ? "Modify the current UI..." : "Describe your UI..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
        />
        <Button 
          type="submit" 
          disabled={!message.trim() || loading}
        >
          {currentIntent ? 'Modify' : 'Generate'}
        </Button>
      </form>
    </div>
  );
};

export default ChatPanel;