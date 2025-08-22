import { useState, useContext } from "react";
import "../css/LoginPage.css";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import IndiaFlag from "../assets/India-flag.png";
import loginBanner from "../assets/Loginbanner.png";
import Faq from "../components/Faq's";
import { faqData } from "../components/FaqData";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { AuthContext } from "../AuthContext";

const LoginPage = () => {
  useScrollAnimation();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await login(mobile, password);
      sessionStorage.removeItem("justLoggedOut");
      sessionStorage.setItem("showWelcome", "true");
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="login-section">
        <div className="login-page">
          <div className="login-left">
            <div className="login-container animate-on-scroll">
              <h2>Login</h2>
              <form onSubmit={handleLogin}>
                <label htmlFor="mobile">Mobile Number</label>
                <div className="mobile-input">
                  <img src={IndiaFlag} alt="India" className="country-flag" />
                  <span className="country-code">+91</span>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    placeholder="Enter mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    maxLength="10"
                    required
                  />
                </div>
                <label htmlFor="password">Password</label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="eye-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {error && <div className="login-error">{error}</div>}
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </button>
              </form>
              <div className="forgot-password">
                <Link to="/forgot-password" className="forgot-password-link">
                  Forgot Password?
                </Link>
              </div>
              <hr className="divider" />
              <div className="signup-prompt">
                <span>Don't have an account? </span>
                <Link to="/signup" className="signup-link">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
          <div className="login-right animate-on-scroll">
            <img src={loginBanner} alt="Mandir Darshan" loading="lazy" />
          </div>
        </div>
      </section>
      <section>
        <hr />
        <Faq className="animate-on-scroll" faqs={faqData.slice(12)} />
      </section>
    </>
  );
};

export default LoginPage;
