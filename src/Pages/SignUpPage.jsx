import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AuthContext } from "../AuthContext";
import API_BASE_URL from "../config/apiConfig";
import { useAuthForm } from "../hooks/useAuthForm";
import IndiaFlag from "../assets/India-flag.png";

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const SignupPage = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const { form, handleChange, error, setError, isLoading, setIsLoading } =
    useAuthForm({
      firstName: "",
      middleName: "",
      lastName: "",
      mobile: "",
      password: "",
      confirmPassword: "",
    });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { firstName, lastName, mobile, password, confirmPassword, middleName } =
      form;

    if (mobile.length !== 10) return setError("Enter a valid 10-digit mobile number.");
    if (!strongPasswordRegex.test(password))
      return setError(
        "Password must be 8+ chars with uppercase, lowercase, number, special char."
      );
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, middleName, lastName, mobile, password }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.error || "Signup failed");
      setUser(data.user);
      navigate("/");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" required />
      <input name="middleName" value={form.middleName} onChange={handleChange} placeholder="Middle Name" />
      <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" required />
      <div>
        <img src={IndiaFlag} alt="India" />
        <span>+91</span>
        <input name="mobile" value={form.mobile} onChange={handleChange} maxLength={10} required />
      </div>
      <div>
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={handleChange}
          required
        />
        <span onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>
      <div>
        <input
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
        <span onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      {error && <div>{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Signing Up..." : "Sign Up"}
      </button>
      <Link to="/login">Already have an account? Login</Link>
    </form>
  );
};

export default SignupPage;
