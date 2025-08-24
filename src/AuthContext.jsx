import { createContext, useState, useEffect } from "react";
export const AuthContext = createContext();
const API_BASE_URL = "https://mandir-darshan.onrender.com";//For production uncomment this
// const API_BASE_URL = "http://localhost:4000";// For Development uncomment this

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/me`, {
          credentials: "include",
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
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
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
    setWelcomeMessage(`Welcome ${data.user.firstName || ""}`);
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
    setWelcomeMessage(`Welcome ${data.user.firstName || ""}`);
    return data.user;
  };

  const logout = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/logout`, {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();
if (!res.ok) throw new Error(data?.error || "Logout failed");
  } catch {
    return false;
  } finally {
    setUser(null);
  }
};

  const deleteAccount = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/delete-account`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to delete account");
    setUser(null);
    return true;
  } catch (err) {
    console.log("Error deleting account:", err);
    return false;
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
    setWelcomeMessage
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
