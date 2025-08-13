import { useState, useContext } from "react";
import "../css/SignUp.css";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import IndiaFlag from "../assets/India-flag.png";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { AuthContext } from "../AuthContext";
import API_BASE_URL from "../config/apiConfig";

const SignupPage = () => {
  useScrollAnimation();
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", middleName: "", lastName: "", mobile: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrengthError, setPasswordStrengthError] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "password") setPasswordStrengthError(strongPasswordRegex.test(value) ? "" : "Weak password. Use 8+ chars, uppercase, lowercase, number, special char.");
    setForm((prev) => ({ ...prev, [name]: name === "mobile" ? value.replace(/\D/g, "") : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, mobile, password, confirmPassword } = form;
    if (mobile.length !== 10) return setError("Please enter a valid 10-digit mobile number.");
    if (!strongPasswordRegex.test(password)) return setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/signup`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstName, middleName: form.middleName, lastName, mobile, password }) });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Signup failed");
      const userRes = await fetch(`${API_BASE_URL}/api/me`, { credentials: "include" });
      const userData = await userRes.json();
      setUser(userData);
      navigate("/");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="signup-section">
      <div className="blurred-circle circle-large"></div>
      <div className="blurred-circle circle-medium"></div>
      <div className="signup-page">
        <div className="signup-left">
          <form className="signup-container animate-on-scroll" onSubmit={handleSubmit}>
            <h2>Sign Up</h2>
            <div className="signup-name-row">
              <div className="name-input">
                <label htmlFor="firstName">First Name *</label>
                <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required />
              </div>
              <div className="name-input">
                <label htmlFor="middleName">Middle Name</label>
                <input type="text" name="middleName" value={form.middleName} onChange={handleChange} />
              </div>
              <div className="name-input">
                <label htmlFor="lastName">Last Name *</label>
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
              </div>
            </div>
            <label className="mobile-label" htmlFor="mobile">Mobile Number *</label>
            <div className="signup-mobile-input">
              <img src={IndiaFlag} alt="India" className="signup-flag" />
              <span className="signup-code">+91</span>
              <input type="tel" name="mobile" maxLength="10" required value={form.mobile} onChange={handleChange} />
            </div>
            <label className="password-label" htmlFor="password">Password *</label>
            <div className="signup-password-input">
              <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} required />
              <span className="signup-eye-icon" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
            </div>
            {passwordStrengthError && <div className="signup-error">{passwordStrengthError}</div>}
            <label className="confirm-password-label" htmlFor="confirmPassword">Confirm Password *</label>
            <div className="signup-password-input">
              <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
              <span className="signup-eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</span>
            </div>
            {error && <div className="signup-error">{error}</div>}
            <button type="submit" className="signup-btn" disabled={isLoading}>{isLoading ? "Signing up..." : "Sign Up"}</button>
            <p className="signup-bottom-text">Already have an account? <Link to="/login">Log in</Link></p>
          </form>
        </div>
        <div className="signup-right animate-on-scroll">
          <h2>Welcome!</h2>
          <p>Join our community and start your journey today.</p>
        </div>
      </div>
    </section>
  );
};

export default SignupPage;
