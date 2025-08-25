import { createContext, useState, useEffect } from "react";

// Use different URLs based on environment
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://mandir-darshan.onrender.com"
    : "http://localhost:4000";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState("");

  // Fetch current logged-in user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/me`, {
          credentials: "include", // include cookies
        });

        if (res.status === 401) {
          setUser(null);
          return;
        }

        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = await res.json();
        setUser(data.user || null);
      } catch (err) {
        console.error("Fetch me error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Signup
  const signup = async (userData) => {
    const res = await fetch(`${API_BASE_URL}/api/signup`, {
      method: "POST",
      credentials: "include", // important for cookies
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Signup failed");

    setUser(data.user);
    setWelcomeMessage(`Welcome ${data.user.firstName || ""}`);
    return data.user;
  };

  // Login
  const login = async (mobile, password) => {
    const res = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Login failed");

    setUser(data.user);
    setWelcomeMessage(`Welcome ${data.user.firstName || ""}`);
    return data.user;
  };

  // Logout
  const logout = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        credentials: "include", // must include cookie
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Logout failed");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      setWelcomeMessage("");
    }
  };

  // Delete Account
  const deleteAccount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/delete-account`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete account");
      setUser(null);
      setWelcomeMessage("");
    } catch (err) {
      console.error("Error deleting account:", err);
    }
  };

  const value = {
    user,
    setUser,
    signup,
    login,
    logout,
    deleteAccount,
    loading,
    welcomeMessage,
    setWelcomeMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};