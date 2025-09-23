import React from 'react'
import { Link } from "react-router-dom";

const FooterComp = () => {
  const token = localStorage.getItem("token");

  return (
    <footer className="py-3 bg-light mt-auto">
      <ul className="nav justify-content-center pb-3">
        {token && (
          <li className="nav-item">
            <Link to="/" className="nav-link px-2">
              Home
            </Link>
          </li>
        )}
        {!token && (
          <>
            <li className="nav-item">
              <Link to="/login" className="nav-link px-2">
                Login
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/signup" className="nav-link px-2">
                Sign-up
              </Link>
            </li>
          </>
        )}
      </ul>
    </footer>
  );
};

export default FooterComp;
