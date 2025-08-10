import React, { useState } from "react";
import "../css/SignUp.css";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import IndiaFlag from "../assets/India-flag.png";
import Faq from "../components/Faq's";
import { faqData } from "../components/FaqData";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const SignupPage = () => {
  useScrollAnimation();

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "mobile" ? value.replace(/\D/g, "") : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.mobile.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    alert(`Signed up as ${form.firstName} +91-${form.mobile}`);
  };

  return (
    <>
      <section className="signup-section">
        <div class="blurred-circle circle-large"></div>
        <div class="blurred-circle circle-medium"></div>
        <div className="signup-page">
          <div className="signup-left">
            <div className="signup-container animate-on-scroll">
              <h2>Sign Up</h2>
              <div className="signup-name-row">
                <div className="name-input">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    // placeholder="First name"
                  />
                </div>
                <div className="name-input">
                  <label htmlFor="middleName">Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={form.middleName}
                    onChange={handleChange}
                    // placeholder="Middle name"
                  />
                </div>
                <div className="name-input">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    // placeholder="Last name"
                  />
                </div>
              </div>

              <label className="mobile-label" htmlFor="mobile">Mobile Number *</label>
              <div className="signup-mobile-input">
                <img src={IndiaFlag} alt="India" className="signup-flag" />
                <span className="signup-code">+91</span>
                <input
                  type="tel"
                  name="mobile"
                  maxLength="10"
                  required
                  value={form.mobile}
                  onChange={handleChange}
                  // placeholder="Enter mobile number"
                />
              </div>

              <label className="password-label" htmlFor="password">Password *</label>
              <div className="signup-password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  // placeholder="Enter password"
                />
                <span
                  className="signup-eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <label className="confirm-password-label" htmlFor="confirmPassword">Confirm Password *</label>
              <div className="signup-password-input">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  // placeholder="Confirm password"
                />
                <span
                  className="signup-eye-icon"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <button className="signup-button" type="submit">Sign Up</button>

              <hr className="signup-divider" />

              <div className="signup-login-prompt">
                Already have an account?{" "}
                <Link to="/login" className="signup-login-link">
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SignupPage;
