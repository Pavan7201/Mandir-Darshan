import React, { createContext, useState, useEffect } from "react";
import API_BASE_URL from "./config/apiConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/me`, { credentials: "include" });

        if (!res.ok) {
          setAuth(null);
          throw new Error("Not authenticated");
        }

        const data = await res.json();
        setAuth(data);
      } catch (err) {
        console.warn("User not authenticated:", err.message);
        setAuth(null);
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
      if (!res.ok) throw new Error("Logout failed");
      setAuth(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/delete-account`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete account");
      setAuth(null);
    } catch (error) {
      console.error("Delete account error:", error);
    }
  };

  const setUser = (userData) => {
    setAuth(userData ? { user: userData } : null);
  };

  return (
    <AuthContext.Provider value={{ auth, setUser, logout, deleteAccount, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
