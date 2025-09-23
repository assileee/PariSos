import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import.meta.env.VITE_API_URL

const VITE_API_URL = import.meta.env.VITE_API_URL;

const NavBar = () => {
  const token = localStorage.getItem("token");
  const avatar = localStorage.getItem("avatar");
  const location = useLocation();
  const navigate = useNavigate();

  const [fridgeQuantity, setFridgeQuantity] = useState(0);
  useEffect(() => {
    const fetchFridge = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setFridgeQuantity(0);
        return;
      }

      try {
        const res = await fetch(`${VITE_API_URL}/api/fridge`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          setFridgeQuantity(0);
          return;
        }

        const data = await res.json();
        const total = (data.items || []).reduce((sum, item) => sum + item.quantity, 0);
        setFridgeQuantity(total);
      } catch (err) {
        setFridgeQuantity(0);
      }
    };

    fetchFridge();
  }, []);

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
          <Link className="navbar-brand" to="/">
            PariSos
          </Link>
        )}
        {token && (
          <Link to="/what-i-can-make" className="btn btn-outline-light me-2">
            Checklist
          </Link>
        )}

        {/* Drinks page link (only when logged in) */}
        {!hideNav && token && (
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link text-white" to="/drinks">
                Chatbot
              </Link>
            </li>
          </ul>
        )}

        <div className="col-md-3 text-end d-flex align-items-center justify-content-end gap-2">
          {token && (
            <Link to="/fridge" className="btn btn-outline-light me-2">
              Fridge
            </Link>

          )}

          {token && avatar && avatar !== "" && (
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
          {token && (
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
