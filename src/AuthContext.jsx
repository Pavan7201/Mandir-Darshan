import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./config/apiConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/me`, { credentials: "include" });
        if (!res.ok) {
          setAuth(null);
          throw new Error("Not authenticated");
        }
        const data = await res.json();
        setAuth(data.user);
      } catch {
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
      navigate("/login", { replace: true });
    } catch (_) {}
  };

  const deleteAccount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/delete-account`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete account");
      setAuth(null);
      navigate("/signup", { replace: true });
    } catch (_) {}
  };

  const setUser = (userData) => {
    setAuth(userData || null);
  };

  return (
    <AuthContext.Provider value={{ auth, setUser, logout, deleteAccount, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
