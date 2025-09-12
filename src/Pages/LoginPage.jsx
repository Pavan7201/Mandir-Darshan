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
  const [faqs, setFaqs] = useState([]);
  const [banner, setBanner] = useState([])

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const API_BASE_URL =
    import.meta.env.MODE === "production"
      ? "https://mandir-darshan.onrender.com"
      : "http://localhost:4000";

  useEffect(() => {
    const fetchFaqs = async () => {
      const cachedAssets = sessionStorage.getItem("assets");

      if (cachedAssets) {
        const data = JSON.parse(cachedAssets);
        const faqData = data.find((item) => item.category === "faq");
        const bannerData = data.find((b) => b.category === "Banner");
        if (faqData && faqData.items) {
          setFaqs(faqData.items.slice(12));
        }
        if (bannerData && bannerData.items && bannerData.items.length > 0) {
          setBanner(bannerData.items[0].bannerUrl)
        }
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/assets`);
        const data = await res.json();
        sessionStorage.setItem("assets", JSON.stringify(data));

        const faqData = data.find((item) => item.category === "faq");
        const bannerData = data.find((b) => b.category === "Banner");
        if (faqData && faqData.items) {
          setFaqs(faqData.items.slice(12));
        }
        if (bannerData && bannerData.items && bannerData.items.length > 0) {
          setBanner(bannerData.items[0].bannerUrl)
        }
      } catch (err) {
        console.error("Error fetching FAQs:", err);
      }
    };

    fetchFaqs();
  }, []);

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
                {/* <button className="login-button" type="submit" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </button> */}
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
