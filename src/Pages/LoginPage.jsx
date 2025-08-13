import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AuthContext } from "../AuthContext";
import API_BASE_URL from "../config/apiConfig";
import { useAuthForm } from "../hooks/useAuthForm";
import IndiaFlag from "../assets/India-flag.png";

const LoginPage = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const { form, handleChange, error, setError, isLoading, setIsLoading } =
    useAuthForm({ mobile: "", password: "" });

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (form.mobile.length !== 10) return setError("Enter a valid 10-digit mobile number.");

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: form.mobile, password: form.password }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.error || "Login failed");

      setUser(data.user);
      navigate("/");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div>
        <img src={IndiaFlag} alt="India" />
        <span>+91</span>
        <input
          name="mobile"
          value={form.mobile}
          onChange={handleChange}
          maxLength={10}
          required
          placeholder="Mobile Number"
        />
      </div>

      <div>
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={handleChange}
          required
          placeholder="Password"
        />
        <span onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      {error && <div>{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>

      <Link to="/forgot-password">Forgot Password?</Link>
      <Link to="/signup">Don't have an account? Sign Up</Link>
    </form>
  );
};

export default LoginPage;
