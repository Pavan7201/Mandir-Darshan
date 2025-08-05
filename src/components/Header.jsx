import {useState, useEffect, useRef} from "react";
import { NavLink} from "react-router-dom";
import "../css/header.css";
import MandirLogo from "../assets/logo.png";

const Header = () => {
  const [Hide, setHide] = useState(false);
  const [Hovered, SetHovered] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const headerRef = useRef();

  useEffect(() => {
    const handleScroll = () => {
      const triggerY = window.innerHeight * 0.2;
      if (window.scrollY > triggerY && !Hovered) {
        setHide(true);
      } else {
        setHide(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [Hovered]);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    window.scrollTo(0, 0);
  setTimeout(() => setLoaded(true), 100);
  }, []);

  const showHeader = Hovered || !Hide;
  return (
    <>
      <div
        className="header-hover-trigger"
        onMouseEnter={() => {
          SetHovered(true);
        }}
      ></div>
      <div
        className={`header-wrapper${showHeader ? "" : " hide"}${loaded ? " loaded" : ""}`}
        onMouseEnter={() => SetHovered(true)}
        onMouseLeave={() => SetHovered(false)}
        ref={headerRef}
      >
        <header className="header">
          <NavLink to="/" className="logo-img fade-in delay-1">
            <img src={MandirLogo} alt="Mandir Logo" />
          </NavLink>
          <nav className="sub-header fade-in delay-2">
            <NavLink to="/Temples" className="nav-link">Temples</NavLink>
            <NavLink to="/Sevas-&-Booking" className="nav-link">Sevas & Bookings</NavLink>
            <NavLink to="/Donation" className="nav-link">Donation</NavLink>
            <NavLink to="/Media" className="nav-link">Media Room</NavLink>
            <NavLink to="/Support" className="nav-link">Support</NavLink>
          </nav>
          <div className="header-actions">
            <button className="btn dashboard-btn fade-in delay-5">
              <span>PUBLIC DASHBOARD</span>
            </button>
            <div className="search-signin">
              <input
                type="text"
                placeholder="Search Temples"
                className="search-bar fade-in delay-3"
              />
              <button className="btn signin-btn fade-in delay-4">DEVOTE SIGN IN</button>
            </div>
          </div>
        </header>
      </div>
    </>
  );
};


export default Header;
