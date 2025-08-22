import { createContext, useState, useEffect } from "react";
const API_BASE_URL = "https://mandir-darshan.onrender.com";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/me`, {
        credentials: "include",
      });
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

    useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, []);

  const signup = async (userData) => {
    const res = await fetch(`${API_BASE_URL}/api/signup`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Signup failed");
    setUser(data.user);
    return data.user;
  };

  const login = async (mobile, password) => {
    const res = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("Logout failed:", err);
  } finally {
    setUser(null);
    sessionStorage.setItem("justLoggedOut", "true");
  }
};

  const deleteAccount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/delete-account`, {
        method: "DELETE",
        credentials: "include", 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete account")
      setUser(null);
      sessionStorage.setItem("justLoggedOut", "true");
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
    fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
