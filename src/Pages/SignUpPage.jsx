import { useState, useContext, useEffect, useRef } from "react";
import "../css/SignUp.css";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Lottie from "lottie-react";
import IndiaFlag from "../assets/India-flag.png";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { AuthContext } from "../AuthContext";
import adminLoginAnimation from "../loader/admin.json";

const API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://mandir-darshan.onrender.com"
    : "http://localhost:4000";

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const [enabled, setEnabled] = useState({
    firstName: true,
    middleName: false,
    lastName: false,
    gender: false,
    email: false,
    mobile: false,
    password: false,
    confirmPassword: false,
  });

  const StrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const firstNameRef = useRef(null);
  const middleNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const genderRef = useRef(null);
  const emailRef = useRef(null);
  const mobileRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const otpInputRef = useRef(null);

  const flowTimerRef = useRef(null);

  useEffect(() => {
    let intervalId = null;
    if (timer > 0) {
      intervalId = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(intervalId);
  }, [timer]);

  useEffect(() => {
    firstNameRef.current?.focus?.();
  }, []);

  useEffect(() => {
    if (form.firstName.trim() && !enabled.middleName) {
      if (flowTimerRef.current) clearTimeout(flowTimerRef.current);
      flowTimerRef.current = setTimeout(() => {
        setEnabled((prev) => ({ ...prev, middleName: true }));
        setTimeout(() => middleNameRef.current?.focus(), 50);
      }, 2000);
    }
    return () => clearTimeout(flowTimerRef.current);
  }, [form.firstName, enabled.middleName]);

  useEffect(() => {
    if (enabled.middleName && !enabled.lastName) {
      if (flowTimerRef.current) clearTimeout(flowTimerRef.current);
      if (form.middleName.trim()) {
        flowTimerRef.current = setTimeout(() => {
          setEnabled(prev => ({ ...prev, lastName: true }));
          setTimeout(() => lastNameRef.current?.focus(), 50);
        }, 1500);
      } else {
        flowTimerRef.current = setTimeout(() => {
          if (!form.middleName.trim()) {
            setEnabled((prev) => ({ ...prev, lastName: true }));
            setTimeout(() => lastNameRef.current?.focus(), 50);
          }
        }, 3000);
      }
    }
    return () => clearTimeout(flowTimerRef.current);
  }, [enabled.middleName, form.middleName, enabled.lastName]);

  useEffect(() => {
    if (form.lastName.trim() && !enabled.gender) {
      if (flowTimerRef.current) clearTimeout(flowTimerRef.current);
      flowTimerRef.current = setTimeout(() => {
        setEnabled((prev) => ({ ...prev, gender: true }));
        setTimeout(() => genderRef.current?.focus(), 50);
      }, 2000);
    }
    return () => clearTimeout(flowTimerRef.current);
  }, [form.lastName, enabled.gender]);

  useEffect(() => {
    if (form.gender && !enabled.email) {
      setEnabled((prev) => ({ ...prev, email: true }));
      setTimeout(() => emailRef.current?.focus(), 50);
    }
  }, [form.gender, enabled.email]);

  useEffect(() => {
    if (isEmailVerified && !enabled.mobile) {
      setEnabled((prev) => ({ ...prev, mobile: true }));
      setTimeout(() => mobileRef.current?.focus(), 50);
    }
  }, [isEmailVerified, enabled.mobile]);

  useEffect(() => {
    if (form.mobile.replace(/\D/g, "").length === 10 && !enabled.password) {
      setEnabled((prev) => ({ ...prev, password: true }));
      setTimeout(() => passwordRef.current?.focus(), 50);
    }
  }, [form.mobile, enabled.password]);

  useEffect(() => {
    if (form.password && !enabled.confirmPassword) {
      if (flowTimerRef.current) clearTimeout(flowTimerRef.current);
      flowTimerRef.current = setTimeout(() => {
        setEnabled((prev) => ({ ...prev, confirmPassword: true }));
        setTimeout(() => confirmPasswordRef.current?.focus(), 50);
      }, 2000);
    }
    return () => clearTimeout(flowTimerRef.current);
  }, [form.password, enabled.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
    if (error) setError("");
    const newValue = name === "mobile" ? value.replace(/\D/g, "") : value;
    if (name === "password") {
      setPasswordStrengthError(
        StrongPassword.test(value)
          ? ""
          : "Weak password. Use 8+ chars, uppercase, lowercase, number, special char."
      );
    }
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const validate = () => {
    const errors = {};
    const { firstName, lastName, email, mobile, gender, password, confirmPassword } = form;
    if (!firstName.trim()) errors.firstName = "First name is required.";
    if (!lastName.trim()) errors.lastName = "Last name is required.";
    if (!gender) errors.gender = "Please select your gender.";
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = "Please enter a valid email address.";
    if (mobile.length !== 10) errors.mobile = "Please enter a valid 10-digit mobile number.";
    if (!StrongPassword.test(password)) errors.password = "Password is too weak.";
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
    return errors;
  };

  const requestOtp = async () => {
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setFieldErrors((prev) => ({ ...prev, email: "A valid email is required to send OTP." }));
      return;
    }
    setSendingOtp(true);
    setOtpError("");
    setCanResend(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, firstName: form.firstName || "User" }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP.");
      }
      setIsOtpDialogOpen(true);
      setTimer(60);
      setOtpInput("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSendOtp = () => {
    requestOtp();
  };

  const handleResendOtp = () => {
    if (!canResend || sendingOtp) return;
    requestOtp();
  };

  const handleVerifyOtp = async () => {
    if (otpInput.length !== 6) {
      setOtpError("OTP must be 6 digits.");
      return;
    }
    setOtpError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: otpInput }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Verification failed.");
      }
      setIsEmailVerified(true);
      setIsOtpDialogOpen(false);
      setOtpError("");
      setError("");
    } catch (err) {
      setOtpError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError(Object.values(validationErrors)[0]);
      return;
    }

    if (!isEmailVerified) {
      setError("Please verify your email to proceed.");
      setFieldErrors((prev) => ({ ...prev, email: "Verification required" }));
      return;
    }

    setLoading(true);
    try {
      await signup(form);
      navigate("/");
    } catch (err) {
      setError(err?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFieldClass = (fieldName) => {
    let classes = [];
    if (!enabled[fieldName] && !isEmailVerified) classes.push("disabled-input");
    if (fieldErrors[fieldName]) classes.push("error-field");
    return classes.join(" ");
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
                  ref={firstNameRef} type="text" id="firstName" name="firstName"
                  value={form.firstName} onChange={handleChange} required
                  autoComplete="given-name" disabled={!enabled.firstName || isEmailVerified}
                  className={getFieldClass('firstName')}
                />
              </div>

              <div className="name-input">
                <label htmlFor="middleName">Middle Name</label>
                <input
                  ref={middleNameRef} type="text" id="middleName" name="middleName"
                  value={form.middleName} onChange={handleChange}
                  autoComplete="additional-name" disabled={!enabled.middleName || isEmailVerified}
                  className={getFieldClass('middleName')}
                />
              </div>

              <div className="last-name-gender-row">
                <div className="name-input">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    ref={lastNameRef} type="text" id="lastName" name="lastName"
                    value={form.lastName} onChange={handleChange} required
                    autoComplete="family-name" disabled={!enabled.lastName || isEmailVerified}
                    className={getFieldClass('lastName')}
                  />
                </div>

                <div className="gender-selection">
                  <label className="gender-label" htmlFor="gender">Gender *</label>
                  <select
                    ref={genderRef} id="gender" name="gender" value={form.gender}
                    onChange={handleChange} required aria-required="true"
                    disabled={!enabled.gender || isEmailVerified} className={getFieldClass('gender')}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>

            {isEmailVerified && (
              <p className="form-lock-note">
                Your name and gender are locked. You can change them later in
                your profile.
              </p>
            )}

            <div className="signup-contact-row">
              <div className="contact-left">
                <label className="email-label" htmlFor="email">Email *</label>
                <div className={`signup-email-input ${isEmailVerified ? 'email-verified' : ''}`}>
                  <input
                    ref={emailRef} type="email" id="email" name="email"
                    value={form.email} onChange={handleChange} required
                    placeholder="you@example.com" autoComplete="email"
                    disabled={isEmailVerified || !enabled.email} aria-label="email"
                    className={getFieldClass('email')}
                  />
                  {!isEmailVerified && (
                    <button type="button" className="send-otp-btn" onClick={handleSendOtp}
                      disabled={sendingOtp || !enabled.email} aria-live="polite">
                      {sendingOtp ? "Sending..." : "Send OTP"}
                    </button>
                  )}
                  {isEmailVerified && <span className="verified-badge" aria-hidden="true" title="Email verified">Verified ✓</span>}
                </div>
              </div>

              <div className="contact-right">
                <label className="mobile-label" htmlFor="mobile">Mobile Number *</label>
                <div className="signup-mobile-input">
                  <img src={IndiaFlag} alt="India flag" className="signup-flag" />
                  <span className="signup-code">+91</span>
                  <input
                    ref={mobileRef} type="tel" id="mobile" name="mobile"
                    maxLength="10" required value={form.mobile} onChange={handleChange}
                    inputMode="numeric" pattern="[0-9]{10}" placeholder="9876543210"
                    aria-label="10 digit mobile number" disabled={!enabled.mobile}
                    className={getFieldClass('mobile')}
                  />
                </div>
              </div>
            </div>

            <label className="password-label" htmlFor="password">Password *</label>
            <div className="signup-password-input">
              <input
                ref={passwordRef} type={showPassword ? "text" : "password"}
                name="password" id="password" value={form.password}
                onChange={handleChange} required autoComplete="new-password"
                aria-describedby="password-help" disabled={!enabled.password}
                className={getFieldClass('password')}
              />
              <span className="signup-eye-icon" onClick={() => enabled.password && setShowPassword(!showPassword)}
                role="button" aria-pressed={showPassword} tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && enabled.password && setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                style={{ opacity: enabled.password ? 1 : 0.5, cursor: enabled.password ? "pointer" : "not-allowed" }}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {passwordStrengthError && <div className="signup-error">{passwordStrengthError}</div>}

            <label className="confirm-password-label" htmlFor="confirmPassword">Confirm Password *</label>
            <div className="signup-password-input">
              <input
                ref={confirmPasswordRef} type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword" name="confirmPassword" value={form.confirmPassword}
                onChange={handleChange} required autoComplete="new-password"
                disabled={!enabled.confirmPassword} className={getFieldClass('confirmPassword')}
              />
              <span className="signup-eye-icon" onClick={() => enabled.confirmPassword && setShowConfirmPassword(!showConfirmPassword)}
                role="button" aria-pressed={showConfirmPassword} tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && enabled.confirmPassword && setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? "Hide password" : "Show password"}
                style={{ opacity: enabled.confirmPassword ? 1 : 0.5, cursor: enabled.confirmPassword ? 'pointer' : 'not-allowed' }}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {error && <div id="signup-error" className="signup-error" role="alert">{error}</div>}

            <button className="signup-button" type="submit" disabled={loading} aria-busy={loading}>
              {loading ? "Signing up…" : "Sign Up"}
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className={`star-${num}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 784.11 815.53">
                    <path className="fil0" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z" />
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
          <div className="otp-dialog" role="dialog" aria-modal="true" aria-labelledby="otp-dialog-title" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="otp-close-btn" onClick={() => setIsOtpDialogOpen(false)} aria-label="Close dialog">×</button>
            <h3 id="otp-dialog-title" className="otp-dialog-title">Verify Your Email</h3>
            <p className="otp-dialog-subtitle">Enter the 6-digit OTP sent to {form.email}</p>
            <input
              ref={otpInputRef}
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
            <button className="verify-otp-btn" onClick={handleVerifyOtp} disabled={otpInput.length !== 6}>
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