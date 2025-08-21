import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const API_BASE_URL = "https://mandir-darshan.onrender.com";

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/me`, {
          credentials: "include",
        });
        if (!res.ok) {
          setAuth(null);
        } else {
          const data = await res.json();
          setAuth(data.user);
        }
      } catch (err) {
        setAuth(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (mobile, password) => {
    const res = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ mobile, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();
    setAuth(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setAuth(null);
      sessionStorage.setItem("justLoggedOut", "true");
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/delete-account`, {
        method: "DELETE",
        credentials: "include", 
      });
      if (!res.ok) throw new Error("Failed to delete account");

      const data = await res.json();
      setAuth(null);
      sessionStorage.setItem("justLoggedOut", "true");

      if (data.redirect) window.location.href = data.redirect;
    } catch (err) {
      console.error("Error deleting account:", err);
    }
  };

  const value = {
    auth,
    setUser: setAuth,
    login,
    logout,
    deleteAccount,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
