import React from "react";
import "../css/header.css";

const Header = () => {
  return (
    <>
      <header className="header">
        <h1 className="logo">Mandir Darshan</h1>
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
          <a href="#home">Temples</a>
          <a href="#about">Sevas & Darshanam</a>
          <a href="#services">Donation</a>
          <a href="#contact">Online Booking</a>
          <a href="#media-room">Media Room</a>
          <a href="#support">Support</a>
        </nav>
      </header>
    </>
  );
};

export default Header;
