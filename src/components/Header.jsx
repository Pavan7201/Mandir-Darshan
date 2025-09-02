import { useState, useEffect, useRef, useContext } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "../css/header.css";
import MandirLogo from "../assets/logo.webp";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-regular-svg-icons";
import ThemeToggle from "../components/ThemeToggle";
import { AuthContext } from "../AuthContext";
import { faSignOutAlt, faTrashAlt, faUserEdit } from "@fortawesome/free-solid-svg-icons";
import womenAvatar from "../assets/woman.png";
import menAvatar from "../assets/boy.png";

const Header = () => {
  const [hide, setHide] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const { user, logout, loading, deleteAccount, welcomeMessage, setWelcomeMessage } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef();
  const menuRef = useRef();
  const toggleRef = useRef();

  const getAvatarUrl = (user) => {
    if (!user) return menAvatar;
    return user.avatar || (user.gender === "female" ? womenAvatar : menAvatar);
  };

  const handleDeleteClick = () => setShowDeleteDialog(true);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setShowDeleteDialog(false);
    sessionStorage.setItem("redirectAfterLogout", "login");
    navigate("/login");
  };

  const confirmDeleteAccount = async () => {
    await deleteAccount();
    setDropdownOpen(false);
    setShowDeleteDialog(false);
    sessionStorage.setItem("redirectAfterLogout", "signup");
    navigate("/signup");
  };
  const handleEditProfile = () => {
    setDropdownOpen(false);
    setShowDeleteDialog(false);
    navigate("/editprofile");
  };
  const toggleMenu = () => setMenuOpen(prev => !prev);

  const showHeader = hovered || !hide;

  useEffect(() => {
    const handleScroll = () => {
      const isTablet = window.innerWidth <= 768;
      const triggerY = window.innerHeight * 0.2;
      if (window.scrollY > window.innerHeight * 0.2) {
        setDropdownOpen(false);
      }
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
    const handleClickOutside = event => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
      if (
        dropdownOpen &&
        !event.target.closest(".welcome-container") &&
        !event.target.closest(".welcome-container-mobile")
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, dropdownOpen]);

  useEffect(() => {
    if (menuRef.current && isMobile) {
      menuRef.current.toggleAttribute("inert", !menuOpen);
    } else if (menuRef.current) {
      menuRef.current.removeAttribute("inert");
    }
  }, [menuOpen, isMobile]);

  useEffect(() => {
    if (location.pathname === "/" && welcomeMessage) {
      setShowWelcome(true);
      const timer = setTimeout(() => {
        setShowWelcome(false);
        setWelcomeMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowWelcome(false);
    }
  }, [location.pathname, welcomeMessage, setWelcomeMessage]);

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
      <div className="header-hover-trigger" onMouseEnter={() => setHovered(true)}></div>

      <div
        className={`header-wrapper${showHeader ? "" : " hide"}${loaded ? " loaded" : ""}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        ref={headerRef}
      >
        <header className="header">
          <button className="menu-toggle fade-in delay-1" aria-label="Toggle menu" aria-expanded={menuOpen} aria-controls="main-navigation" onClick={toggleMenu} ref={toggleRef} >
            <FontAwesomeIcon icon={faBars} aria-hidden="true" />
          </button>

          <NavLink
            to="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
            className="logo-img fade-in delay-1"
          >
            <img src={MandirLogo} alt="Mandir Logo" />
          </NavLink>

          {isMobile && (
            <div className="mobile-header-actions fade-in delay-3">
              {!loading && user ? (
                <div className="welcome-container-mobile">
                  <div
                    className="avatar-and-welcome-mobile"
                    onClick={() => setDropdownOpen(prev => !prev)}
                  >
                    <img src={getAvatarUrl(user)} alt="Avatar" className="avatar-img-mobile" />
                    <span className="welcome-firstname">{showWelcome ? `Welcome ${user.firstName}` : user.firstName}</span>
                  </div>
                  <div className={`dropdown-menu ${dropdownOpen ? "open" : ""}`}>
                    <button className="edit-profile-btn" onClick={handleEditProfile}>
                      Edit Profile <FontAwesomeIcon icon={faUserEdit} />
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                      Logout <FontAwesomeIcon icon={faSignOutAlt} />
                    </button>
                    <button className="delete-account-btn" onClick={handleDeleteClick}>
                      Delete Account <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </div>
                </div>
              ) : (
                <NavLink to="/login" className="nav-link">
                  <FontAwesomeIcon icon={faUserCircle} className="avatar-icon" />
                </NavLink>
              )}
            </div>
          )}

          <nav ref={menuRef} id="main-navigation" className={`sub-header fade-in delay-2 ${menuOpen ? "menu-open" : ""}`}>
            <NavLink to="/Temples" className="nav-link" onClick={() => setMenuOpen(false)}>Temples</NavLink>
            <NavLink to="/Sevas-&-Booking" className="nav-link" onClick={() => setMenuOpen(false)}>Sevas & Bookings</NavLink>
            <NavLink to="/Donation" className="nav-link" onClick={() => setMenuOpen(false)}>Donation</NavLink>
            <NavLink to="/Media" className="nav-link" onClick={() => setMenuOpen(false)}>Media Room</NavLink>
            <NavLink to="/Support" className="nav-link" onClick={() => setMenuOpen(false)}>Support</NavLink>
            {isMobile && <div className="theme-toggle-mobile"><ThemeToggle /></div>}
          </nav>

          {!isMobile && (
            <div className="header-actions">
              <button className="dashboard-btn fade-in delay-5">
                <ThemeToggle />
                <span className="dashboard-label">PUBLIC DASHBOARD</span>
              </button>

              <div className="search-signin">
                <input type="text" placeholder="Search Temples" className="search-bar fade-in delay-3" />

                {!loading && user ? (
                  <div className="welcome-container fade-in delay-4">
                    <div className="avatar-and-welcome" onClick={() => setDropdownOpen(prev => !prev)}>
                      <img src={getAvatarUrl(user)} alt={`${user.firstName || "User"} avatar`} className="avatar-img" />
                      <span className="welcome-firstname">{showWelcome ? `Welcome ${user.firstName}` : user.firstName}</span>
                    </div>

                    <div className={`dropdown-menu ${dropdownOpen ? "open" : ""}`}>
                      <button className="edit-profile-btn" onClick={handleEditProfile}>
                        Edit Profile <FontAwesomeIcon icon={faUserEdit} />
                      </button>
                      <button className="logout-btn" onClick={handleLogout}>
                        Logout <FontAwesomeIcon icon={faSignOutAlt} />
                      </button>
                      <button className="delete-account-btn" onClick={handleDeleteClick}>
                        Delete Account <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <NavLink to="/login" className="signin-btn fade-in delay-4 nav-link">
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
        <div className="modal-overlay" role="dialog" aria-modal="true">
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
