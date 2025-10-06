import { useState, useContext, useEffect } from "react";
import "../css/SignUp.css";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Lottie from "lottie-react";
import IndiaFlag from "../assets/India-flag.png";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { AuthContext } from "../AuthContext";
import adminLoginAnimation from "../loader/admin.json";

const WEBHOOK_URL = process.env.REACT_APP_WEBHOOK_URL;

const SignupPage = () => {
  useScrollAnimation();
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    mobile: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrengthError, setPasswordStrengthError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const StrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "mobile" ? value.replace(/\D/g, "") : value;

    if (name === "password") {
      setPasswordStrengthError(
        StrongPassword.test(value)
          ? ""
          : "Weak password. Use 8+ chars, uppercase, lowercase, number, special char."
      );
    }

    if (isEmailVerified) setError(""); 

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const validate = () => {
    const { firstName, lastName, email, mobile, gender, password, confirmPassword } = form;

    if (!firstName.trim()) return "First name is required.";
    if (!lastName.trim()) return "Last name is required.";

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim()))
      return "Please enter a valid email address.";

    if (mobile.length !== 10) return "Please enter a valid 10-digit mobile number.";

    if (!gender) return "Please select gender.";

    if (!isEmailVerified) return "Please verify your email with OTP first.";

    if (!StrongPassword.test(password)) {
      return "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
    }

    if (password !== confirmPassword) return "Passwords do not match.";

    return null;
  };

  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const sendToN8n = async (payload) => {
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn("Failed to call n8n webhook:", err);
    }
  };

  const handleSendOtp = async () => {
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError("Please enter a valid email address first.");
      return;
    }

    setSendingOtp(true);
    setError("");

    const otp = generateOTP();
    setGeneratedOtp(otp);

    await sendToN8n({
      email: form.email.trim(),
      otp,
      subject: "Your Mandir Darshan OTP",
      firstName: form.firstName || "User",
    });

    setSendingOtp(false);
    setIsOtpDialogOpen(true);
    setTimer(60);
    setCanResend(false);
    setOtpInput("");
    setOtpError("");
  };

  const handleVerifyOtp = () => {
    if (otpInput === generatedOtp) {
      setIsEmailVerified(true);
      setIsOtpDialogOpen(false);
      setOtpError("");
      setError("");
    } else {
      setOtpError("OTP does not match. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setSendingOtp(true);
    const otp = generateOTP();
    setGeneratedOtp(otp);

    await sendToN8n({
      email: form.email.trim(),
      otp,
      subject: "Your Mandir Darshan OTP",
      firstName: form.firstName || "User",
    });

    setSendingOtp(false);
    setTimer(60);
    setCanResend(false);
    setOtpInput("");
    setOtpError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedForm = {
      ...form,
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
    };

    setForm(normalizedForm);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const { firstName, middleName, lastName, mobile, gender, password, email } = normalizedForm;

      await signup({ firstName, middleName, lastName, mobile, gender, password, email });

      navigate("/");
    } catch (err) {
      setError(err?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="signup-section" aria-labelledby="signup-heading">
      <div className="signup-page">
        <div className="signup-left">
          <form
            className="signup-container animate-on-scroll"
            onSubmit={handleSubmit}
            noValidate
            aria-describedby={error ? "signup-error" : undefined}
          >
            <h2 id="signup-heading">Sign Up</h2>

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
                  autoComplete="given-name"
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
                  autoComplete="additional-name"
                />
              </div>

              <div className="last-name-gender-row">
                <div className="name-input">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    autoComplete="family-name"
                  />
                </div>

                <div className="gender-selection">
                  <label className="gender-label" htmlFor="gender">Gender *</label>
                  <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    {/* <option value="other">Other</option> */}
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="signup-contact-row">
              <div className="contact-left">
                <label className="email-label" htmlFor="email">Email *</label>
                <div className={`signup-email-input ${isEmailVerified ? 'email-verified' : ''}`}>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isEmailVerified}
                    aria-label="email"
                  />
                  {!isEmailVerified ? (
                    <button
                      type="button"
                      className="send-otp-btn"
                      onClick={handleSendOtp}
                      disabled={sendingOtp}
                      aria-live="polite"
                    >
                      {sendingOtp ? "Sending..." : "Send OTP"}
                    </button>
                  ) : (
                    <span className="verified-badge" aria-hidden="true" title="Email verified">Verified ✓</span>
                  )}
                </div>
              </div>

              <div className="contact-right">
                <label className="mobile-label" htmlFor="mobile">Mobile Number *</label>
                <div className="signup-mobile-input">
                  <img src={IndiaFlag} alt="India flag" className="signup-flag" />
                  <span className="signup-code">+91</span>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    maxLength="10"
                    required
                    value={form.mobile}
                    onChange={handleChange}
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    placeholder="9876543210"
                    aria-label="10 digit mobile number"
                  />
                </div>
              </div>
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
                autoComplete="new-password"
                aria-describedby="password-help"
                disabled={!isEmailVerified}
                className={!isEmailVerified ? "disabled-input" : ""}
                onClick={() => !isEmailVerified && setError("Please verify your email first.")}
                onFocus={() => !isEmailVerified && setError("Please verify your email first.")}
              />
              <span
                className="signup-eye-icon"
                onClick={() => isEmailVerified && setShowPassword(!showPassword)}
                role="button"
                aria-pressed={showPassword}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && isEmailVerified && setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                style={{
                  opacity: isEmailVerified ? 1 : 0.5,
                  cursor: isEmailVerified ? "pointer" : "not-allowed"
                }}
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
                autoComplete="new-password"
                disabled={!isEmailVerified}
              />
              <span
                className="signup-eye-icon"
                onClick={() => isEmailVerified && setShowConfirmPassword(!showConfirmPassword)}
                role="button"
                aria-pressed={showConfirmPassword}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && isEmailVerified && setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? "Hide password" : "Show password"}
                style={{ opacity: isEmailVerified ? 1 : 0.5, cursor: isEmailVerified ? 'pointer' : 'not-allowed' }}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {error && <div id="signup-error" className="signup-error" role="alert">{error}</div>}

            <button
              className="signup-button"
              type="submit"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Signing up…" : "Sign Up"}
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className={`star-${num}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 784.11 815.53">
                    <path
                      className="fil0"
                      d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 
             207.96,29.37 371.12,197.68 392.05,407.74 
             20.93,-210.06 184.09,-378.37 392.05,-407.74 
             -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
                    />
                  </svg>
                </div>
              ))}
            </button>

            <hr className="signup-divider" />
            <div className="signup-login-prompt">
              Already have an account?{" "}
              <Link to="/login" className="signup-login-link">Login</Link>
            </div>
          </form>
        </div>

        <div className="signup-right animate-on-scroll">
          <Lottie
            animationData={adminLoginAnimation}
            loop={true}
            autoplay={true}
            style={{ maxWidth: "400px", width: "100%", height: "auto" }}
          />
        </div>
      </div>
      {isOtpDialogOpen && (
        <div className="otp-dialog-overlay" onClick={() => setIsOtpDialogOpen(false)}>
          <div className="otp-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="otp-dialog-title">Verify Your Email</h3>
            <p className="otp-dialog-subtitle">Enter the 6-digit OTP sent to {form.email}</p>

            <input
              type="text"
              className="otp-input-field"
              value={otpInput}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 6) {
                  setOtpInput(value);
                  setOtpError("");
                }
              }}
              placeholder="Enter OTP"
              maxLength="6"
              inputMode="numeric"
            />

            {otpError && <div className="otp-error-message">{otpError}</div>}

            <button
              className="verify-otp-btn"
              onClick={handleVerifyOtp}
              disabled={otpInput.length !== 6}
            >
              Verify OTP
            </button>

            <div className="otp-resend-section">
              <span className="otp-resend-text">OTP not received?</span>
              <button
                type="button"
                className={`resend-otp-btn ${canResend ? 'active' : 'inactive'}`}
                onClick={handleResendOtp}
                disabled={!canResend || sendingOtp}
              >
                {sendingOtp ? "Sending..." : "Resend"}
              </button>
              {timer > 0 && <span className="otp-timer">{timer}s</span>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SignupPage;
