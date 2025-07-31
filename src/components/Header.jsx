import React,{useState, useEffect, useRef} from "react";
import { Link} from "react-router-dom";
import "../css/header.css";

const Header = () => {
  const [isHidden, setIsHidden] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const headerRef = useRef();

  useEffect(() => {
    const handleScroll = () => {
      const triggerY = window.innerHeight * 0.2;
      if (window.scrollY > triggerY && !isHovered) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHovered]);

  const showHeader = isHovered || !isHidden;
  return (
    <>
    <div className="header-hover-trigger" onMouseEnter={() => {setIsHovered(true)}}></div>
    <div className={`header-wrapper${showHeader ? "" : " hide"}`} 
    onMouseEnter={() => setIsHovered(true)} 
    onMouseLeave={() => setIsHovered(false)} 
    ref={headerRef}>
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
          <Link to="/sevas">Sevas & Bookings</Link>
          <Link to="/donation">Donation</Link>
          <Link to="/media">Media Room</Link>
          <Link to="/support">Support</Link>
        </nav>
      </header>
      </div>
    </>
  );
};

export default Header;
