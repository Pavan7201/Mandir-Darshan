import React, { useState } from "react";
import "../css/LoginPage.css";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import IndiaFlag from "../assets/India-flag.png";
import loginBanner from "../assets/Loginbanner.png";
import Faq from "../components/Faq's";
import { faqData } from "../components/FaqData";
import { useScrollAnimation } from "../hooks/useScrollAnimation";


const LoginPage = () => {
    useScrollAnimation();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    alert(`Logging in with Mobile: +91-${mobile}`);
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
              <img
                src={IndiaFlag}
                alt="India"
                className="country-flag"
              />
              <span className="country-code">+91</span>
              <input type="tel" id="mobile" placeholder="Enter mobile number" value={mobile} onChange={(e) => { const onlyNums = e.target.value.replace(/\D/g, ''); setMobile(onlyNums); }}maxLength="10" title="Enter a valid 10-digit mobile number" required/>
            </div>
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
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

            <button type="submit">Login</button>
          </form>

          <div className="forgot-password">
  <Link to="/forgot-password" className="forgot-password-link">
    Forgot Password?
  </Link>
</div>

<hr className="divider" />

<div className="signup-prompt">
  <span>Don't have an account? </span>
  <Link to="/SignUp" className="signup-link">Sign Up</Link>
</div>
        </div>
      </div>

      <div className="login-right animate-on-scroll">
        <img src={loginBanner} alt="Mandir Darshan" />
      </div>
    </div>
    </section>
    <section>
      <hr />
      <Faq AnimateOnScroll="animate-on-scroll" faqs={faqData.slice(12)} />
    </section>
    </>
  );
};

export default LoginPage;
