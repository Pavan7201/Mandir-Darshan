import { useState, useContext } from "react";
import "../css/SignUp.css";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import IndiaFlag from "../assets/India-flag.png";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { AuthContext } from "../AuthContext";

const SignupPage = () => {
  useScrollAnimation();
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    mobile: "",
    sex: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrengthError, setPasswordStrengthError] = useState("");
  const [error, setError] = useState("");

  const StrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "password") {
      setPasswordStrengthError(
        StrongPassword.test(value)
          ? ""
          : "Weak password. Use 8+ chars, uppercase, lowercase, number, special char."
      );
    }
    setForm((prev) => ({
      ...prev,
      [name]: name === "mobile" ? value.replace(/\D/g, "") : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { firstName, middleName, lastName, mobile, sex, password, confirmPassword } = form;

    if (mobile.length !== 10) {
      return setError("Please enter a valid 10-digit mobile number.");
    }

    if (!StrongPassword.test(password)) {
      return setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setError("");

    try {
      await signup({ firstName, middleName, lastName, mobile, sex, password });
      navigate("/");
    } catch (err) {
      setError(err?.message || "Signup failed");
    }
  };

  return (
    <section className="signup-section">
      <div className="blurred-circle circle-large"></div>
      <div className="blurred-circle circle-medium"></div>
      <div className="signup-page">
        <div className="signup-left">
          <form
            className="signup-container animate-on-scroll"
            onSubmit={handleSubmit}
          >
            <h2>Sign Up</h2>
            <div className="signup-name-row">
  <div className="name-input">
    <label htmlFor="firstName">First Name *</label>
    <input
      type="text"
      id="firstName"
      name="firstName"
      value={form.firstName}
      onChange={handleChange}
      required
    />
  </div>

  <div className="name-input">
    <label htmlFor="middleName">Middle Name</label>
    <input
      type="text"
      id="middleName"
      name="middleName"
      value={form.middleName}
      onChange={handleChange}
    />
  </div>

  <div className="last-name-sex-row">
    <div className="name-input">
      <label htmlFor="lastName">Last Name *</label>
      <input
        type="text"
        id="lastName"
        name="lastName"
        value={form.lastName}
        onChange={handleChange}
        required
      />
    </div>

    <div className="sex-selection">
      <label className="sex-label">Sex *</label>
        <select
      id="sex"
      name="sex"
      value={form.sex}
      onChange={handleChange}
      required
    >
      <option value="">Select</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
    </select>
    </div>
  </div>
</div>
            <label className="mobile-label" htmlFor="mobile">Mobile Number *</label>
            <div className="signup-mobile-input">
              <img src={IndiaFlag} alt="India" className="signup-flag" />
              <span className="signup-code">+91</span>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                maxLength="10"
                required
                value={form.mobile}
                onChange={handleChange}
              />
            </div>

            <label className="password-label" htmlFor="password">Password *</label>
            <div className="signup-password-input">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <span
                className="signup-eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {passwordStrengthError && <div className="signup-error">{passwordStrengthError}</div>}

            <label className="confirm-password-label" htmlFor="confirmPassword">Confirm Password *</label>
            <div className="signup-password-input">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              <span
                className="signup-eye-icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {error && <div className="signup-error">{error}</div>}
            <button className="signup-button" type="submit">Sign Up</button>
            <hr className="signup-divider" />
            <div className="signup-login-prompt">
              Already have an account?{" "}
              <Link to="/login" className="signup-login-link">Login</Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignupPage;