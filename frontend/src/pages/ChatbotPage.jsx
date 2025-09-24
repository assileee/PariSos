import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const VITE_API_URL = import.meta.env.VITE_API_URL;

const ChatbotPage = () => {
  const [mode, setMode] = useState(null); // null, 'checklist', 'chat'
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [checklistItems, setChecklistItems] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === 'checklist') {
      setMessages([{
        role: 'assistant',
        content: "Welcome! I'll help you create a personalized checklist for settling in Paris. Let me ask you a few questions:\n\n1. What's your nationality?\n2. Are you an EU citizen?\n3. What's your student status (Bachelor/Master/PhD)?\n4. Do you already have accommodation?\n5. How long will you stay in Paris?"
      }]);
    } else {
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm here to help you with any questions about settling in Paris as a student. Feel free to ask me about:\n- Visa and residence permits\n- CAF housing assistance\n- Opening a bank account\n- Getting a SIM card\n- Student discounts\n- Transportation\n- Healthcare\n\nWhat would you like to know?"
      }]);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${VITE_API_URL}/api/chatbot/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: input,
          mode: mode,
          conversationHistory: messages,
          userProfile: userProfile
        })
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      
      if (mode === 'checklist' && data.checklist) {
        setChecklistItems(data.checklist);
        setUserProfile(data.userProfile || userProfile);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response
      }]);

    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChecklistItemToggle = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${VITE_API_URL}/api/checklist/toggle/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setChecklistItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, completed: !item.completed } : item
        ));
      }
    } catch (error) {
      console.error("Error toggling checklist item:", error);
    }
  };

  const resetChat = () => {
    setMode(null);
    setMessages([]);
    setChecklistItems([]);
    setUserProfile(null);
  };

  if (!mode) {
    return (
      <div className="container" style={{ maxWidth: '800px', marginTop: '50px' }}>
        <h2 className="text-center mb-4">Paris Student Assistant</h2>
        <div className="row g-4">
          <div className="col-md-6">
            <div 
              className="card h-100 shadow-sm border-0" 
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onClick={() => handleModeSelect('checklist')}
            >
              <div className="card-body text-center p-4">
                <i className="bi bi-list-check" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                <h4 className="mt-3">Create Personalized Checklist</h4>
                <p className="text-muted">
                  Answer a few questions and get a customized checklist of all administrative 
                  tasks you need to complete based on your situation.
                </p>
                <button className="btn btn-primary mt-2">
                  Start Checklist <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div 
              className="card h-100 shadow-sm border-0"
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onClick={() => handleModeSelect('chat')}
            >
              <div className="card-body text-center p-4">
                <i className="bi bi-chat-dots" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                <h4 className="mt-3">Ask Questions</h4>
                <p className="text-muted">
                  Have specific questions? Chat with our AI assistant about visa, housing, 
                  banking, or any other topic related to student life in Paris.
                </p>
                <button className="btn btn-success mt-2">
                  Start Chat <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ height: 'calc(100vh - 200px)' }}>
      <div className="row h-100">
        {/* Main Chat Area */}
        <div className={checklistItems.length > 0 ? "col-md-8" : "col-12"}>
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                {mode === 'checklist' ? 
                  <><i className="bi bi-list-check me-2"></i>Checklist Creator</> : 
                  <><i className="bi bi-chat-dots me-2"></i>Student Assistant</>
                }
              </h5>
              <button className="btn btn-sm btn-light" onClick={resetChat}>
                <i className="bi bi-arrow-left me-1"></i> Back
              </button>
            </div>
            
            <div className="card-body overflow-auto" style={{ backgroundColor: '#f8f9fa' }}>
              <div className="messages-container">
                {messages.map((msg, index) => (
                  <div key={index} className={`message mb-3 ${msg.role === 'user' ? 'text-end' : ''}`}>
                    <div 
                      className={`d-inline-block p-3 rounded-3 ${
                        msg.role === 'user' 
                          ? 'bg-primary text-white' 
                          : 'bg-white border'
                      }`}
                      style={{ 
                        maxWidth: '70%',
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="message mb-3">
                    <div className="d-inline-block p-3 rounded-3 bg-white border">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <div className="card-footer bg-white">
              <div className="input-group">
                <textarea
                  className="form-control"
                  placeholder={mode === 'checklist' ? 
                    "Answer the questions to build your checklist..." : 
                    "Type your question here..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows="2"
                  style={{ resize: 'none' }}
                />
                <button 
                  className="btn btn-primary" 
                  onClick={handleSendMessage}
                  disabled={loading || !input.trim()}
                >
                  <i className="bi bi-send-fill"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Checklist Sidebar */}
        {checklistItems.length > 0 && (
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="bi bi-check2-square me-2"></i>Your Checklist
                </h5>
              </div>
              <div className="card-body overflow-auto">
                <div className="checklist">
                  {checklistItems.map((item, index) => (
                    <div key={item.id || index} className="form-check mb-3 p-3 bg-light rounded">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={item.completed || false}
                        onChange={() => handleChecklistItemToggle(item.id || index)}
                        id={`check-${item.id || index}`}
                      />
                      <label 
                        className="form-check-label" 
                        htmlFor={`check-${item.id || index}`}
                        style={{
                          textDecoration: item.completed ? 'line-through' : 'none',
                          opacity: item.completed ? 0.6 : 1
                        }}
                      >
                        <strong>{item.title}</strong>
                        {item.description && (
                          <small className="d-block text-muted mt-1">{item.description}</small>
                        )}
                        {item.deadline && (
                          <small className="d-block text-danger mt-1">
                            <i className="bi bi-calendar-event me-1"></i>
                            Deadline: {item.deadline}
                          </small>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-footer bg-white">
                <div className="d-flex justify-content-between">
                  <small className="text-muted">
                    Progress: {checklistItems.filter(item => item.completed).length}/{checklistItems.length}
                  </small>
                  <button className="btn btn-sm btn-outline-primary">
                    <i className="bi bi-download me-1"></i> Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotPage;