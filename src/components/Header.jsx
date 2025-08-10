import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import "../css/header.css";
import MandirLogo from "../assets/logo.png";
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-regular-svg-icons';
import ThemeToggle from "../components/ThemeToggle";

const Header = () => {
  const [Hide, setHide] = useState(false);
  const [Hovered, SetHovered] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  const headerRef = useRef();
  const menuRef = useRef();
  const toggleRef = useRef();

  useEffect(() => {
    const handleScroll = () => {
      const isTablet = window.innerWidth <= 768;
      const triggerY = window.innerHeight * 0.2;
      if (isTablet) {
        setHide(false);
      } else {
        setHide(window.scrollY > triggerY && !Hovered);
      }
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [Hovered]);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const showHeader = Hovered || !Hide;

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <div
        className="header-hover-trigger"
        onMouseEnter={() => SetHovered(true)}
      ></div>

      <div
        className={`header-wrapper${showHeader ? "" : " hide"}${loaded ? " loaded" : ""}`}
        onMouseEnter={() => SetHovered(true)}
        onMouseLeave={() => SetHovered(false)}
        ref={headerRef}
      >
        <header className="header">
          <FontAwesomeIcon
            icon={faBars}
            className="menu-toggle fade-in delay-1"
            role="button"
            tabIndex={0}
            aria-label="Toggle menu"
            onClick={toggleMenu}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                toggleMenu();
              }
            }}
            ref={toggleRef}
          />

          <NavLink to="/" className="logo-img fade-in delay-1">
            <img src={MandirLogo} alt="Mandir Logo" />
          </NavLink>

          {isMobile && (
            <div className="mobile-header-actions fade-in delay-3">
              <NavLink to="/Login" className="nav-link">
              <FontAwesomeIcon icon={faUserCircle} className="avatar-icon" />
              </NavLink>
            </div>
          )}

          <nav
            ref={menuRef}
            className={`sub-header fade-in delay-2 ${menuOpen ? "menu-open" : ""}`}
          >
            <NavLink to="/Temples" className="nav-link" onClick={() => setMenuOpen(false)}>Temples</NavLink>
            <NavLink to="/Sevas-&-Booking" className="nav-link" onClick={() => setMenuOpen(false)}>Sevas & Bookings</NavLink>
            <NavLink to="/Donation" className="nav-link" onClick={() => setMenuOpen(false)}>Donation</NavLink>
            <NavLink to="/Media" className="nav-link" onClick={() => setMenuOpen(false)}>Media Room</NavLink>
            <NavLink to="/Support" className="nav-link" onClick={() => setMenuOpen(false)}>Support</NavLink>
            {isMobile && (
              <div className="theme-toggle-mobile">
                <ThemeToggle />
              </div>
            )}
          </nav>

          {!isMobile && (
            <div className="header-actions">
              <button className="dashboard-btn fade-in delay-5">
                <ThemeToggle />
                <span className="dashboard-label">PUBLIC DASHBOARD</span>
              </button>

              <div className="search-signin">
                <input
                  type="text"
                  placeholder="Search Temples"
                  className="search-bar fade-in delay-3"
                />
                <NavLink to="/Login" className="signin-btn fade-in delay-4 nav-link">
                  <span className="signin-text">DEVOTE SIGN IN</span>
                  <FontAwesomeIcon icon={faUserCircle} className="avatar-icon" />
                </NavLink>
              </div>
            </div>
          )}
        </header>
      </div>
    </>
  );
};

export default Header;
