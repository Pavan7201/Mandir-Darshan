import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://mandir-darshan.onrender.com"
    : "http://localhost:4000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }
    const controller = new AbortController();
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setWelcomeMessage(`Welcome ${data.user.firstName || ""}`);
        } else {
          setUser(null);
          setToken("");
          localStorage.removeItem("token");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching user:", err);
          setUser(null);
          setToken("");
          localStorage.removeItem("token");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
    return () => controller.abort();
  }, [token]);

  const signup = async (userData) => {
    const res = await fetch(`${API_BASE_URL}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Signup failed");
    setUser(data.user);
    setWelcomeMessage(`Welcome ${data.user.firstName || ""}`);
    setToken(data.token);
    localStorage.setItem("token", data.token);
    return data.user;
  };

  const login = async (mobile, password) => {
    const res = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Login failed");
    setUser(data.user);
    setWelcomeMessage(`Welcome ${data.user.firstName || ""}`);
    setToken(data.token);
    localStorage.setItem("token", data.token);
    return data.user;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.log("Logout failed:", err);
    } finally {
      setUser(null);
      setWelcomeMessage("");
      setToken("");
      localStorage.removeItem("token");
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/delete-account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to delete account");
      }
    } catch (err) {
      console.log("Error deleting account:", err);
    } finally {
      setUser(null);
      setWelcomeMessage("");
      setToken("");
      localStorage.removeItem("token");
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
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};