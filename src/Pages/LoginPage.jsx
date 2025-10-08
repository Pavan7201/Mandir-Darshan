import { useState, useEffect, useContext } from "react";
import "../css/LoginPage.css";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import IndiaFlag from "../assets/India-flag.png";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { AuthContext } from "../AuthContext";

const LoginPage = () => {
  useScrollAnimation();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [faqs, setFaqs] = useState([]); //--------------------------------present we do not need faq in login page so i have commented this.
  const [banner, setBanner] = useState([])
  const [otp, setOtp] = useState(""); //intial otp state
  const [info, setInfo] = useState("");//intial status of success
  const [isOtpSending, setIsOtpSending] = useState(false); //state for sending OTP
  const [loginMode, setLoginMode] = useState("password"); // state for toggelling forms (pass to otp || otp to pass)  .
  const [countdown, setCountdown] = useState(0);
  const { login, loginWithToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const API_BASE_URL =
    import.meta.env.MODE === "production"
      ? "https://mandir-darshan.onrender.com"
      : "http://localhost:4000";

  // Auto-hide error after 3 seconds (preserves all existing commented lines)
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const fetchAssets = async () => {
      const cachedAssets = sessionStorage.getItem("assets");

      if (cachedAssets) {
        const data = JSON.parse(cachedAssets);
        // const faqData = data.find((item) => item.category === "faq");
        const bannerData = data.find((b) => b.category === "Banner");
        // if (faqData && faqData.items) {
        //   setFaqs(faqData.items.slice(12));
        // }
        if (bannerData && bannerData.items && bannerData.items.length > 0) {
          setBanner(bannerData.items[0].bannerUrl)
        }
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/assets`);
        const data = await res.json();
        sessionStorage.setItem("assets", JSON.stringify(data));

        // const faqData = data.find((item) => item.category === "faq");
        const bannerData = data.find((b) => b.category === "Banner");
        // if (faqData && faqData.items) {
        //   setFaqs(faqData.items.slice(12));
        // }
        if (bannerData && bannerData.items && bannerData.items.length > 0) {
          setBanner(bannerData.items[0].bannerUrl)
        }
      } catch (err) {
        console.error("Error fetching FAQs:", err);
      }
    };

    fetchAssets();
  }, [API_BASE_URL]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);
    setError("");
    setInfo("");

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

  const handleSendOtp = async () => {
    if (mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number to receive an OTP.");
      return;
    }
    setIsOtpSending(true);
    setError("");
    setInfo("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/send-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP.");
      }
      setInfo(data.message);
      setCountdown(45);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsOtpSending(false);
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }
    setIsLoading(true);
    setError("");
    setInfo("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/login-with-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to login.");
      }

      loginWithToken(data.token, data.user);
      sessionStorage.removeItem("justLoggedOut");
      sessionStorage.setItem("showWelcome", "true");
      navigate("/");

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (mode) => {
    setLoginMode(mode);
    setError("");
    setInfo("");
    setPassword("");
    setOtp("");
  };

  return (
    <>
      <section className="login-section">
        <div className="login-page">
          <div className="login-left">
            <div className="login-container animate-on-scroll">

              <div className={`form-container ${loginMode === 'otp' ? 'otp-active' : ''}`}>
                <div className="form-wrapper" id="password-form">
                  <h2>Login</h2>
                  <form onSubmit={handlePasswordLogin}>
                    <label htmlFor="mobile">Mobile Number</label>
                    <div className="mobile-input">
                      <img src={IndiaFlag} alt="India" className="country-flag" />
                      <span className="country-code">+91</span>
                      <input type="tel" id="mobile" name="mobile" placeholder="Enter mobile number" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} maxLength="10" required />
                    </div>
                    <label htmlFor="password">Password</label>
                    <div className="password-input">
                      <input type={showPassword ? "text" : "password"} id="password" name="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                    <div className={`login-error ${error ? 'visible' : ''}`}>{error || '\u00A0'}</div>
                    <button className="login-button" type="submit" disabled={isLoading}>
                      <span>{isLoading ? "Logging in..." : "Login"}</span>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <span key={num} className={`star-${num}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 784.11 815.53">
                            <path
                              className="fil0"
                              d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 
                          207.96,29.37 371.12,197.68 392.05,407.74 
                          20.93,-210.06 184.09,-378.37 392.05,-407.74 
                          -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
                            />
                          </svg>
                        </span>
                      ))}
                    </button>
                  </form>
                  <div className="login-options">
                    <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
                    <button onClick={() => switchMode('otp')} className="switch-mode-btn">Login with OTP</button>
                  </div>
                  <hr className="divider" />
                  <div className="signup-prompt">
                    <span>Don't have an account? </span>
                    <Link to="/signup" className="signup-link">Sign Up</Link>
                  </div>
                </div>
                <div className="form-wrapper" id="otp-form">
                  <h2>Login</h2>
                  <form onSubmit={handleOtpLogin}>
                    <label htmlFor="mobile-otp">Mobile Number</label>
                    <div className="mobile-input">
                      <img src={IndiaFlag} alt="India" className="country-flag" />
                      <span className="country-code">+91</span>
                      <input type="tel" id="mobile-otp" name="mobile" placeholder="Enter mobile number" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} maxLength="10" required />
                    </div>
                    <div className="otp-input-container">
                      <input type="text" id="otp" name="otp" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} maxLength="6" required />
                      <button
                        type="button"
                        className="send-otp-btn"
                        onClick={handleSendOtp}
                        disabled={isOtpSending || countdown > 0}
                      >
                        {isOtpSending
                          ? "Sending..."
                          : countdown > 0
                            ? `Resend in ${countdown}s`
                            : "Send OTP"}
                      </button>
                    </div>
                    <div className={`login-error ${error ? 'visible' : ''}`}>{error || '\u00A0'}</div>
                    <div className={`login-info ${info ? 'visible' : ''}`}>{info || '\u00A0'}</div>
                    <button className="login-button" type="submit" disabled={isLoading}>
                      <span>{isLoading ? "Verifying..." : "Login"}</span>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <span key={num} className={`star-${num}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 784.11 815.53">
                            <path
                              className="fil0"
                              d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 
                          207.96,29.37 371.12,197.68 392.05,407.74 
                          20.93,-210.06 184.09,-378.37 392.05,-407.74 
                          -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
                            />
                          </svg>
                        </span>
                      ))}
                    </button>
                  </form>
                  <div className="login-options">
                    <span />
                    <button onClick={() => switchMode('password')} className="switch-mode-btn">Login with Password</button>
                  </div>
                  <hr className="divider" />
                  <div className="signup-prompt">
                    <span>Don't have an account? </span>
                    <Link to="/signup" className="signup-link">Sign Up</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="login-right animate-on-scroll">
            <img src={banner} alt="Mandir Darshan" loading="lazy" />
          </div>
        </div>
      </section>
      {/* <section>
        <hr />
        <Faq className="animate-on-scroll" faqs={faqs} />
      </section> */}
    </>
  );
};

export default LoginPage;
