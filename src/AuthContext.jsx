import React, { createContext, useState, useEffect } from "react";
import API_BASE_URL from "./config/apiConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const stored = localStorage.getItem("auth");
        if (stored) setAuth(JSON.parse(stored));

        const res = await fetch(`${API_BASE_URL}/api/me`, { credentials: "include" });
        if (!res.ok) {
          setAuth(null);
          localStorage.removeItem("auth");
          throw new Error("Not authenticated");
        }

        const data = await res.json();
        setAuth(data);
        localStorage.setItem("auth", JSON.stringify(data));
      } catch (err) {
        setAuth(null);
        localStorage.removeItem("auth");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Logout failed");
      }
      setAuth(null);
      localStorage.removeItem("auth");
    } catch (error) {
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/delete-account`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete account");
      }
      setAuth(null);
      localStorage.removeItem("auth");
    } catch (error) {
      throw error;
    }
  };

  const setUser = (userData) => {
    setAuth(userData);
    if (userData) localStorage.setItem("auth", JSON.stringify(userData));
    else localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ auth, setUser, logout, deleteAccount, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
