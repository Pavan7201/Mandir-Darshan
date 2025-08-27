import { createContext, useState, useEffect } from "react";
import NProgress from "nprogress";
import "./css/nprogress.css";
export const AuthContext = createContext();

NProgress.configure({
  showSpinner: false,
  speed: 400,
  trickleSpeed: 200,
  minimum: 0.1,
});

const API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://mandir-darshan.onrender.com"
    : "http://localhost:4000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loadMode, setLoadMode] = useState("idle");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setUser(null);
      setLoadMode("idle");
      return;
    }

    if (loadMode !== "authenticating") {
      setLoadMode("reloading");
    }

    const controller = new AbortController();
    const minLoaderTime = 3200;
    const startTime = Date.now();

    const fetchUser = async () => {
      NProgress.start();
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
          setUser(null);
          setToken("");
          localStorage.removeItem("token");
        }
      } finally {
        NProgress.done();
        const elapsed = Date.now() - startTime;
        const remainingTime = elapsed < minLoaderTime ? minLoaderTime - elapsed : 0;
        setTimeout(() => setLoading(false), remainingTime);
      }
    };

    fetchUser();
    return () => controller.abort();
  }, [token]);

  const signup = async (userData) => {
    NProgress.start();
    setLoading(true);
    setLoadMode("authenticating");
    const minLoaderTime = 3200;
    const startTime = Date.now();

    try {
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

      const elapsed = Date.now() - startTime;
      if (elapsed < minLoaderTime) {
        await new Promise((resolve) => setTimeout(resolve, minLoaderTime - elapsed));
      }

      return data.user;
    } catch (err) {
      throw err;
    } finally {
      NProgress.done();
      setLoading(false);
      setLoadMode("done");
    }
  };

  const login = async (mobile, password) => {
    NProgress.start()
    setLoading(true);
    setLoadMode("authenticating");
    const minLoaderTime = 3200;
    const startTime = Date.now();

    try {
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

      const elapsed = Date.now() - startTime;
      if (elapsed < minLoaderTime) {
        await new Promise((resolve) => setTimeout(resolve, minLoaderTime - elapsed));
      }

      return data.user;
    } catch (err) {
      throw err;
    } finally {
      NProgress.done();
      setLoading(false);
      setLoadMode("done");
    }
  };

  const logout = async () => {
    NProgress.start()
    try {
      await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
    } finally {
      NProgress.done();
      setUser(null);
      setWelcomeMessage("");
      setToken("");
      localStorage.removeItem("token");
    }
  };

  const deleteAccount = async () => {
    NProgress.start();
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
    } finally {
      NProgress.done();
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
    loadMode,
    welcomeMessage,
    setWelcomeMessage,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};