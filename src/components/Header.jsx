import { useState, useEffect, useRef, useContext } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "../css/header.css";
import MandirLogo from "../assets/logo.png";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-regular-svg-icons";
import ThemeToggle from "../components/ThemeToggle";
import { AuthContext } from "../AuthContext";
import API_BASE_URL from "../config/apiConfig";

const Header = () => {
  const [hide, setHide] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const { auth, setUser, logout, loading, deleteAccount } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef();
  const menuRef = useRef();
  const toggleRef = useRef();

  const handleDeleteClick = () => setShowDeleteDialog(true);

  const handleLogout = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Logout failed");

    setUser(null);
    setDropdownOpen(false);
    setShowDeleteDialog(false);
    sessionStorage.setItem("justLoggedOut", "true");
    sessionStorage.removeItem("showWelcome");
    navigate("/Login", { replace: true });

  } catch (err) {
    console.error("Logout failed", err);
    setDropdownOpen(false);
  }
};

  const confirmDeleteAccount = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/delete-account`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${auth?.token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      setUser(null);
      localStorage.removeItem("auth");
      setDropdownOpen(false);
      setShowDeleteDialog(false);
      navigate("/Login", { replace: true });
      return;
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error(data.error || "Failed to delete account");
      setShowDeleteDialog(false);

      return;
    }

    setUser(null);
    localStorage.removeItem("auth");
    setShowDeleteDialog(false); 
    setDropdownOpen(false);
    navigate("/SignUp", { replace: true });

  } catch (error) {
    console.error("Error deleting account:", error);
    setShowDeleteDialog(false);
  }
};

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const showHeader = hovered || !hide;

  useEffect(() => {
    const handleScroll = () => {
      const isTablet = window.innerWidth <= 768;
      const triggerY = window.innerHeight * 0.2;
      setHide(!isTablet && window.scrollY > triggerY && !hovered);
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
  }, [hovered]);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (menuRef.current && isMobile) {
      menuRef.current.toggleAttribute("inert", !menuOpen);
    } else if (menuRef.current) {
      menuRef.current.removeAttribute("inert");
    }
  }, [menuOpen, isMobile]);

  const welcomeShownRef = useRef(false);
  useEffect(() => {
  if (
    location.pathname === "/" &&
    auth?.user &&
    sessionStorage.getItem("showWelcome") === "true"
  ) {
    setShowWelcome(true);
    sessionStorage.removeItem("showWelcome");
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2000);
    return () => clearTimeout(timer);
  }
}, [location.pathname, auth?.user]);

  useEffect(() => {
    if (!menuOpen && document.activeElement && menuRef.current?.contains(document.activeElement)) {
      toggleRef.current?.focus();
    }
  }, [menuOpen]);

  useEffect(() => {
    document.body.classList.toggle("modal-open", showDeleteDialog);
  }, [showDeleteDialog]);

  return (
    <>
      <div
        className="header-hover-trigger"
        onMouseEnter={() => setHovered(true)}
      ></div>

      <div
        className={`header-wrapper${showHeader ? "" : " hide"}${loaded ? " loaded" : ""}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        ref={headerRef}
      >
        <header className="header">
          <FontAwesomeIcon
            icon={faBars}
            className="menu-toggle fade-in delay-1"
            role="button"
            tabIndex={0}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={toggleMenu}
            onKeyDown={(e) => {
              if (["Enter", " "].includes(e.key)) toggleMenu();
            }}
            ref={toggleRef}
          />
          <NavLink to="/" onClick={() => navigate("/")} className="logo-img fade-in delay-1">
            <img src={MandirLogo} alt="Mandir Logo" />
          </NavLink>
          {isMobile && (
            <div className="mobile-header-actions fade-in delay-3">
              {!loading && auth?.user ? (
                <div className="welcome-container-mobile">
                  <div className="Welcome-text-mobile"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <FontAwesomeIcon icon={faUserCircle} className="avatar-icon" />
                    <span>
                      {showWelcome ? `Welcome ${auth.user?.firstName || "User"}` : auth.user?.firstName || "User"}
                      </span>
                    </div>
                    {dropdownOpen && (
                    <div className="dropdown-menu">
                      <button className="logout-btn" onClick={handleLogout}>Logout</button>
                      <button className="delete-account-btn" onClick={handleDeleteClick}>
                        Delete Account
                      </button> 
                    </div>
                  )}
                </div>
                ) : (
                <NavLink to="/Login" className="nav-link">
                  <FontAwesomeIcon icon={faUserCircle} className="avatar-icon" />
                </NavLink>
              )}
            </div>
          )}

          <nav
            ref={menuRef}
            id="main-navigation"
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

                {!loading && auth?.user ? (
                  <div className="welcome-container fade-in delay-4">
                    <div
                      className="welcome-text"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <span className="signin-text">
                        {showWelcome ? `Welcome ${auth.user?.firstName || "User"}` : auth.user?.firstName || "User"}
                      </span>
                      <FontAwesomeIcon icon={faUserCircle} className="avatar-icon" />
                    </div>

                    {dropdownOpen && (
                      <div className="dropdown-menu">
                        <button className="logout-btn" onClick={handleLogout}>Logout</button>
                        <button className="delete-account-btn" onClick={handleDeleteClick}>
                          Delete Account
                        </button>
                      </div>
                    )}
                  </div>
                  ) : (
                  <NavLink to="/Login" className="signin-btn fade-in delay-4 nav-link">
                    <span className="signin-text">DEVOTE SIGN IN</span>
                    <FontAwesomeIcon icon={faUserCircle} className="avatar-icon" />
                  </NavLink>
                )}
              </div>
            </div>
          )}
        </header>
      </div>

      {showDeleteDialog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Are you sure you want to delete your account?</h3>
            <div className="modal-actions">
              <button className="yes-btn" onClick={confirmDeleteAccount}>Yes</button>
              <button className="cancel-btn" onClick={() => setShowDeleteDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
