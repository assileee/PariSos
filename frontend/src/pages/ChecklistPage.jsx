import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const VITE_API_URL = import.meta.env.VITE_API_URL;

const ChecklistPage = () => {
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchChecklist();
  }, [navigate]);

  const fetchChecklist = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${VITE_API_URL}/api/chatbot/checklist`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        setError("No checklist found. Create one with the chatbot first!");
        setLoading(false);
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch checklist");

      const data = await response.json();
      setChecklist(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${VITE_API_URL}/api/chatbot/checklist/toggle/${itemId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setChecklist(prev => ({
          ...prev,
          items: prev.items.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
          )
        }));
      }
    } catch (error) {
      console.error("Error toggling item:", error);
    }
  };

  const exportChecklist = async (format) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${VITE_API_URL}/api/chatbot/checklist/export?format=${format}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `paris-checklist.${format}`;
        a.click();
      }
    } catch (error) {
      console.error("Error exporting checklist:", error);
    }
  };

  const getFilteredItems = () => {
    if (!checklist || !checklist.items) return [];
    
    switch(filter) {
      case "pending":
        return checklist.items.filter(item => !item.completed);
      case "completed":
        return checklist.items.filter(item => item.completed);
      case "urgent":
        return checklist.items.filter(item => 
          !item.completed && (item.priority === "critical" || item.priority === "high")
        );
      default:
        return checklist.items;
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      visa: "bi-passport",
      housing: "bi-house-door",
      banking: "bi-bank",
      health: "bi-heart-pulse",
      transport: "bi-train-front",
      university: "bi-mortarboard",
      utilities: "bi-phone",
      other: "bi-three-dots"
    };
    return icons[category] || "bi-circle";
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      critical: "badge bg-danger",
      high: "badge bg-warning text-dark",
      medium: "badge bg-info",
      low: "badge bg-secondary"
    };
    return badges[priority] || "badge bg-secondary";
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ maxWidth: '800px', marginTop: '50px' }}>
        <div className="alert alert-info text-center">
          <h4>{error}</h4>
          <p>Start a conversation with our chatbot to create your personalized checklist!</p>
          <Link to="/chatbot" className="btn btn-primary mt-3">
            <i className="bi bi-chat-dots me-2"></i>Go to Chatbot
          </Link>
        </div>
      </div>
    );
  }

  const filteredItems = getFilteredItems();
  const completedCount = checklist.items.filter(item => item.completed).length;
  const completionRate = Math.round((completedCount / checklist.items.length) * 100);

  return (
    <div className="container" style={{ maxWidth: '1200px', marginTop: '30px' }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h2>
            <i className="bi bi-list-check me-2"></i>
            Your Paris Checklist
          </h2>
          <p className="text-muted">
            Track your progress on all administrative tasks for settling in Paris
          </p>
        </div>
        <div className="col-md-4 text-md-end">
          <div className="dropdown d-inline-block me-2">
            <button className="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              <i className="bi bi-download me-1"></i> Export
            </button>
            <ul className="dropdown-menu">
              <li>
                <button className="dropdown-item" onClick={() => exportChecklist('json')}>
                  <i className="bi bi-filetype-json me-2"></i>JSON Format
                </button>
              </li>
            </ul>
          </div>
          <Link to="/chatbot" className="btn btn-primary">
            <i className="bi bi-chat-dots me-1"></i> Update with Chatbot
          </Link>
        </div>
      </div>

      {/* Progress Card */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h5>Overall Progress</h5>
              <div className="progress" style={{ height: '25px' }}>
                <div 
                  className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                  role="progressbar"
                  style={{ width: `${completionRate}%` }}
                  aria-valuenow={completionRate}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {completionRate}%
                </div>
              </div>
              <small className="text-muted">
                {completedCount} of {checklist.items.length} tasks completed
              </small>
            </div>
            <div className="col-md-4 text-md-end">
              <div className="d-flex justify-content-md-end gap-2 mt-3 mt-md-0">
                <div className="text-center">
                  <h3 className="mb-0 text-success">{completedCount}</h3>
                  <small className="text-muted">Completed</small>
                </div>
                <div className="text-center ms-3">
                  <h3 className="mb-0 text-warning">{checklist.items.length - completedCount}</h3>
                  <small className="text-muted">Remaining</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Tasks ({checklist.items.length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'urgent' ? 'active' : ''}`}
            onClick={() => setFilter('urgent')}
          >
            <i className="bi bi-exclamation-triangle me-1"></i>
            Urgent
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({checklist.items.filter(i => !i.completed).length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            <i className="bi bi-check-circle me-1"></i>
            Completed ({completedCount})
          </button>
        </li>
      </ul>

      {/* Checklist Items */}
      <div className="row">
        {filteredItems.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info text-center">
              No tasks found for the selected filter.
            </div>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="col-12 mb-3">
              <div className={`card border-0 shadow-sm ${item.completed ? 'opacity-75' : ''}`}>
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={item.completed || false}
                          onChange={() => handleToggle(item.id)}
                          id={`check-${item.id}`}
                          style={{ transform: 'scale(1.5)' }}
                        />
                      </div>
                    </div>
                    <div className="col">
                      <div className="d-flex align-items-start justify-content-between">
                        <div>
                          <h5 
                            className={`mb-1 ${item.completed ? 'text-decoration-line-through text-muted' : ''}`}
                          >
                            <i className={`${getCategoryIcon(item.category)} me-2`}></i>
                            {item.title}
                          </h5>
                          {item.description && (
                            <p className="mb-2 text-muted">{item.description}</p>
                          )}
                          <div className="d-flex gap-2 align-items-center">
                            <span className={getPriorityBadge(item.priority)}>
                              {item.priority}
                            </span>
                            {item.deadline && (
                              <small className="text-danger">
                                <i className="bi bi-calendar-event me-1"></i>
                                {item.deadline}
                              </small>
                            )}
                            {item.link && (
                              <a 
                                href={item.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary"
                              >
                                <i className="bi bi-link-45deg"></i> Resource
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tips Section */}
      <div className="card mt-5 border-0 bg-light">
        <div className="card-body">
          <h5><i className="bi bi-lightbulb me-2"></i>Pro Tips</h5>
          <ul className="mb-0">
            <li>Start with "Critical" and "High" priority tasks first</li>
            <li>Many tasks depend on each other - open a bank account before applying for CAF</li>
            <li>Keep all documents organized - you'll need them multiple times</li>
            <li>Don't hesitate to ask for help at your university's international office</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChecklistPage;