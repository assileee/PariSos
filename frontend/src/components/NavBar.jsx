import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const VITE_API_URL = import.meta.env.VITE_API_URL;

const NavBar = () => {
  const token = localStorage.getItem("token");
  const avatar = localStorage.getItem("avatar");
  const location = useLocation();
  const navigate = useNavigate();
  
  const [hasChecklist, setHasChecklist] = useState(false);

  useEffect(() => {
    // Check if user has a checklist
    const checkForChecklist = async () => {
      if (!token) return;
      
      try {
        const res = await fetch(`${VITE_API_URL}/api/chatbot/checklist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setHasChecklist(res.ok);
      } catch (err) {
        setHasChecklist(false);
      }
    };

    checkForChecklist();
  }, [token, location]);

  const hideNav =
    location.pathname === "/login" ||
    location.pathname === "/signup";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("avatar");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-primary navbar-dark d-flex align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom">
      <div className="container-fluid">
        {!hideNav && (
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🇫🇷</span>
            <i className="bi bi-geo-alt-fill me-2"></i>
            PariSos
          </Link>
        )}
        
        {/* Navigation Links - Only show when logged in */}
        {!hideNav && token && (
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link text-white" to="/chatbot">
                <i className="bi bi-chat-dots me-1"></i>
                Chatbot
              </Link>
            </li>
            {hasChecklist && (
              <li className="nav-item">
                <Link className="nav-link text-white" to="/checklist">
                  <i className="bi bi-list-check me-1"></i>
                  My Checklist
                </Link>
              </li>
            )}
          </ul>
        )}

        <div className="col-md-3 text-end d-flex align-items-center justify-content-end gap-2">
          {token && (
            <>
              {/* Quick Actions Dropdown */}
              <div className="dropdown">
                <button 
                  className="btn btn-outline-light dropdown-toggle me-2" 
                  type="button" 
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-lightning-charge me-1"></i>
                  Quick Links
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <a className="dropdown-item" href="https://www.caf.fr" target="_blank" rel="noopener noreferrer">
                      <i className="bi bi-house-door me-2"></i>CAF Website
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="https://administration-etrangers-en-france.interieur.gouv.fr/" target="_blank" rel="noopener noreferrer">
                      <i className="bi bi-passport me-2"></i>OFII/Visa
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="https://www.ameli.fr/" target="_blank" rel="noopener noreferrer">
                      <i className="bi bi-heart-pulse me-2"></i>Ameli (Health)
                    </a>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item" to="/chatbot">
                      <i className="bi bi-chat-dots me-2"></i>Ask Assistant
                    </Link>
                  </li>
                </ul>
              </div>

              {/* User Avatar */}
              {avatar && avatar !== "" && (
                <img
                  src={`${VITE_API_URL}/${avatar.replace(/\\/g, "/")}`}
                  alt="avatar"
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid white",
                    marginLeft: "10px"
                  }}
                />
              )}
              
              {/* Logout Button */}
              <button className="btn btn-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-1"></i>
                Logout
              </button>
            </>
          )}
          
          {/* Not Logged In */}
          {!token && location.pathname !== "/login" && (
            <Link className="btn btn-outline-dark me-2" to="/login">
              Login
            </Link>
          )}
          {!token && location.pathname !== "/signup" && (
            <Link className="btn btn-success" to="/signup">
              Sign-up
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;