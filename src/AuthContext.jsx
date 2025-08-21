import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const API_BASE_URL = "https://mandir-darshan.onrender.com";

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/me`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Not authenticated");
      const data = await res.json();
      setAuth(data.user);
    } catch {
      setAuth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (mobile, password) => {
    const res = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    setAuth(data.user);
    return data.redirect || "/";
  };

  const signUp = async (firstName, middleName, lastName, mobile, password) => {
    const res = await fetch(`${API_BASE_URL}/api/signUp`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, middleName, lastName, mobile, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Signup failed");
    setAuth(data.user);
    return data.redirect || "/";
  };

  const logout = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      setAuth(null);
      return data.redirect || "/login";
    } catch {
      setAuth(null);
      return "/login";
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/delete-account`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      setAuth(null);
      return data.redirect || "/signup";
    } catch {
      setAuth(null);
      return "/signup";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        loading,
        login,
        signUp,
        logout,
        deleteAccount,
        setAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
