import { useState, useEffect, useRef, useContext } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "../css/header.css";
import MandirLogo from "../assets/logo.webp";
import { faBars, faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-regular-svg-icons";
import ThemeToggle from "../components/ThemeToggle";
import { AuthContext } from "../AuthContext";
import { faSignOutAlt, faTrashAlt, faUserEdit, faUserTie, faUser } from "@fortawesome/free-solid-svg-icons";
import womenAvatar from "../assets/woman.png";
import menAvatar from "../assets/boy.png";
import Lottie from "lottie-react";
import logoAnimation from "../loader/Logo.json";

const Header = () => {
  const [hide, setHide] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const { user, logout, loading, deleteAccount, welcomeMessage, setWelcomeMessage, isAdmin } =
    useContext(AuthContext);

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
    if (isAdmin) {
      sessionStorage.setItem("redirectAfterLogout", "adminlogin");
      navigate("/adminlogin");
    } else {
      sessionStorage.setItem("redirectAfterLogout", "login");
      navigate("/login");
    }
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

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const showHeader = hovered || !hide;

  useEffect(() => {
    const handleScroll = () => {
      const isTablet = window.innerWidth <= 768;
      const triggerY = window.innerHeight * 0.2;
      if (window.scrollY > triggerY) setDropdownOpen(false);
      setHide(!isTablet && window.scrollY > triggerY && !hovered);
    };

    const handleResize = () => setIsMobile(window.innerWidth <= 480);

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
    if ((location.pathname === "/" || location.pathname === "/admin") && welcomeMessage) {
      setShowWelcome(true);
      const timer = setTimeout(() => {
        setShowWelcome(false);
        setWelcomeMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    } else setShowWelcome(false);
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
          <button
            className="menu-toggle fade-in delay-1"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={toggleMenu}
            ref={toggleRef}
          >
            <FontAwesomeIcon icon={faBars} aria-hidden="true" />
          </button>

          {!isAdmin ? (
            <NavLink
              to="/"
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
              className="logo-img fade-in delay-1"
            >
              <div className="logo-container">
              <Lottie
                animationData={logoAnimation}
                loop={true}
                autoplay={true}
              />
              </div>
            </NavLink>

          ) : (
            <div className="logo-img fade-in delay-1">
              <div className="logo-container">
              <Lottie
                animationData={logoAnimation}
                loop={true}
                autoplay={true}
              />
              </div>
            </div>
          )}

          {/* Mobile Header */}
          {isMobile && (
            <div className="mobile-header-actions fade-in delay-3">
              {!loading && user ? (
                <div className="welcome-container-mobile">
                  <div
                    className="avatar-and-welcome-mobile"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                  >
                    <img
                      src={getAvatarUrl(user)}
                      alt={`${user.firstName || "User"} avatar`}
                      className="avatar-img-mobile"
                    />
                    <span className="welcome-firstname">
                      {showWelcome ? `Welcome ${user.firstName}` : user.firstName}
                    </span>
                  </div>
                  <div className={`dropdown-menu ${dropdownOpen ? "open" : ""}`}>
                    {!isAdmin && (
                      <>
                        <button className="edit-profile-btn" onClick={handleEditProfile}>
                          Edit Profile <FontAwesomeIcon icon={faUserEdit} />
                        </button>
                        <button
                          className="change-password-btn"
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate("/changepassword");
                          }}
                        >
                          Change Password <FontAwesomeIcon icon={faLock} />
                        </button>
                        <button className="delete-account-btn" onClick={handleDeleteClick}>
                          Delete Account <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      </>
                    )}
                    <button className="logout-btn" onClick={handleLogout}>
                      Logout <FontAwesomeIcon icon={faSignOutAlt} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="welcome-container-mobile">
                  <div
                    className="avatar-and-welcome-mobile"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                  >
                    <img src={menAvatar} alt="Avatar" className="avatar-img-mobile" />
                    <span className="welcome-firstname">Sign In</span>
                  </div>
                  <div className={`dropdown-menu ${dropdownOpen ? "open" : ""}`}>
                    <button
                      className="user-login-btn"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/login");
                      }}
                    >
                      User Login
                      <FontAwesomeIcon icon={faUser} />
                    </button>
                    <button
                      className="admin-login-btn"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/adminlogin");
                      }}
                    >
                      Admin Login
                      <FontAwesomeIcon icon={faUserTie} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Menu */}
          <nav
            ref={menuRef}
            id="main-navigation"
            className={`sub-header fade-in delay-2 ${menuOpen ? "menu-open" : ""}`}
          >
            {!isAdmin ? (
              <>
                <NavLink to="/Temples" className="nav-link" onClick={() => setMenuOpen(false)}>
                  Temples
                </NavLink>
                <NavLink
                  to="/Sevas-&-Booking"
                  className="nav-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Sevas & Bookings
                </NavLink>
                <NavLink to="/Donation" className="nav-link" onClick={() => setMenuOpen(false)}>
                  Donation
                </NavLink>
                <NavLink to="/Media" className="nav-link" onClick={() => setMenuOpen(false)}>
                  Media Room
                </NavLink>
                <NavLink to="/Support" className="nav-link" onClick={() => setMenuOpen(false)}>
                  Support
                </NavLink>
                {isMobile && <ThemeToggle />}
              </>
            ) : (
              <>
                <NavLink to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>
                  Update Temple
                </NavLink>
                {isMobile && <ThemeToggle />}
              </>
            )}
          </nav>

          {/* Desktop Header Actions */}
          {!isMobile && !isAdmin && (
            <div className="header-actions">
              <div className="toggle fade-in delay-5">
                <ThemeToggle />
                {!loading && !user && (
                  <button className="dashboard-btn fade-in delay-5" onClick={() => navigate("/adminlogin")}>
                    <span className="dashboard-label">ADMIN LOGIN</span>
                  </button>
                )}
                {!loading && user && (
                  <button className="dashboard-btn fade-in delay-5" onClick={() => navigate("/publicdashboard")}>
                    <span className="dashboard-label">PUBLIC DASHBOARD</span>
                  </button>
                )}
              </div>

              <div className="search-signin">
                <input
                  type="text"
                  placeholder="Search Temples"
                  className="search-bar fade-in delay-3"
                />

                {!loading && user ? (
                  <div className="welcome-container fade-in delay-4">
                    <div
                      className="avatar-and-welcome"
                      onClick={() => setDropdownOpen((prev) => !prev)}
                    >
                      <img
                        src={getAvatarUrl(user)}
                        alt={`${user.firstName || "User"} avatar`}
                        className="avatar-img"
                      />
                      <span className="welcome-firstname">
                        {showWelcome ? `Welcome ${user.firstName}` : user.firstName}
                      </span>
                    </div>
                    <div className={`dropdown-menu ${dropdownOpen ? "open" : ""}`}>
                      <button className="edit-profile-btn" onClick={handleEditProfile}>
                        Edit Profile <FontAwesomeIcon icon={faUserEdit} />
                      </button>
                      <button
                        className="change-password-btn"
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate("/changepassword");
                        }}
                      >
                        Change Password <FontAwesomeIcon icon={faLock} />
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

          {!isMobile && isAdmin && (
            <div className={`header-actions${isAdmin ? " admin" : ""}`}>
              <ThemeToggle />
              <div className="welcome-container fade-in delay-4">
                <div
                  className="avatar-and-welcome"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                >
                  <img
                    src={getAvatarUrl(user)}
                    alt={`${user.firstName || "Admin"} avatar`}
                    className="avatar-img"
                  />
                  <span className="welcome-firstname">
                    {showWelcome ? `Welcome ${user.firstName}` : user.firstName}
                  </span>
                </div>
                <div className={`dropdown-menu ${dropdownOpen ? "open" : ""}`}>
                  <button className="logout-btn" onClick={handleLogout}>
                    Logout <FontAwesomeIcon icon={faSignOutAlt} />
                  </button>
                </div>
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
              <button className="yes-btn" onClick={confirmDeleteAccount}>
                Yes
              </button>
              <button className="cancel-btn" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
