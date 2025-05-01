import React from "react";
import { Link } from "react-router-dom";
import "../css/header.css";

const Header = () => {
  return (
    <>
      <header className="header">
        <Link to="/" className="logo-link">
          <h1>Mandir Darshan</h1>
        </Link>
        <div className="header-actions">
          <button className="btn dashboard-btn">
            <span>PUBLIC DASHBOARD</span>
          </button>
          <div className="search-signin">
            <input
              type="text"
              placeholder="Search temples..."
              className="search-bar"
            />
            <button className="btn signin-btn">DEVOTE SIGN IN</button>
          </div>
        </div>
      </header>

      <header className="sub-header">
        <nav>
          <Link to="/temples">Temples</Link>
          <Link to="/sevas">Sevas & Darshanam</Link>
          <Link to="/donation">Donation</Link>
          <Link to="/booking">Online Booking</Link>
          <Link to="/media">Media Room</Link>
          <Link to="/support">Support</Link>
        </nav>
      </header>
    </>
  );
};

export default Header;
