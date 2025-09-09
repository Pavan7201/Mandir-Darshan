import { createContext, useState, useEffect } from "react";
import LoadingBar from "react-top-loading-bar";

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
  const [loadMode, setLoadMode] = useState("idle");
  const [loggedOut, setLoggedOut] = useState(false);

  const [progress, setProgress] = useState(0);

  const startLoader = () => {
    setProgress(5);
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 95) {
          clearInterval(interval);
          return old;
        }
        return old + 5;
      });
    }, 200);
  };

  const finishLoader = () => {
    setProgress(100);
  };

  const withLoader = async (asyncFn) => {
    startLoader();
    try {
      return await asyncFn();
    } finally {
      finishLoader();
    }
  };

  useEffect(() => {
    return () => setProgress(0);
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      setLoadMode("idle");
      return;
    }

    if (loadMode !== "authenticating") setLoadMode("reloading");

    const controller = new AbortController();
    const minLoaderTime = 3000;
    const startTime = Date.now();

    const fetchUser = async () => {
      startLoader();
      try {
        const res = await fetch(`${API_BASE_URL}/api/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
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
        const elapsed = Date.now() - startTime;
        const remainingTime =
          elapsed < minLoaderTime ? minLoaderTime - elapsed : 0;

        setTimeout(() => {
          setLoading(false);
          finishLoader();
        }, remainingTime);
      }
    };

    fetchUser();
    return () => controller.abort();
  }, [token]);

  const normalizeValue = (val) => {
    if (!val) return "";
    return val.replace(/-/g, " ").trim();
  };

  const adminLogin = (userId, passcode) =>
    withLoader(async () => {
      const minLoaderTime = 3000;
      const startTime = Date.now();

      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, passcode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Admin login failed");

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("token", data.token);

      setWelcomeMessage(`Welcome ${data.user.firstName || "Admin"}`);
      setLoadMode("authenticating");
      setLoading(true);

      const elapsed = Date.now() - startTime;
      if (elapsed < minLoaderTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoaderTime - elapsed)
        );
      }

      setLoading(false);
      setLoadMode("done");

      return data.user;
    });

  const signup = (userData) =>
    withLoader(async () => {
      const minLoaderTime = 3200;
      const startTime = Date.now();

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

      setLoadMode("authenticating");
      setLoading(true);

      const elapsed = Date.now() - startTime;
      if (elapsed < minLoaderTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoaderTime - elapsed)
        );
      }

      setLoading(false);
      setLoadMode("done");

      return data.user;
    });

  const login = (mobile, password) =>
    withLoader(async () => {
      const minLoaderTime = 4000;
      const startTime = Date.now();

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

      setLoadMode("authenticating");
      setLoading(true);

      const elapsed = Date.now() - startTime;
      if (elapsed < minLoaderTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoaderTime - elapsed)
        );
      }

      setLoading(false);
      setLoadMode("done");

      return data.user;
    });

  const fetchTemples = async ({ searchTerm = "", category = "", state = "", sortBy = "" }) => {
    try {
      const queryParams = new URLSearchParams();

      if (searchTerm) queryParams.append("searchTerm", searchTerm);
      if (category) queryParams.append("category", normalizeValue(category));
      if (state) queryParams.append("state", normalizeValue(state));
      if (sortBy) queryParams.append("sortBy", sortBy);

      const res = await fetch(
        `${API_BASE_URL}/api/temples?${queryParams.toString()}`
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch temples");

      return data;
    } catch (err) {
      console.error("Temple fetch error:", err);
      throw err;
    }
  };

  const editProfile = (updatedData, isFormData = false) =>
    withLoader(async () => {
      setLoading(true);
      setLoadMode("authenticating");
      const minLoaderTime = 2000;
      const startTime = Date.now();

      const headers = { Authorization: `Bearer ${token}` };
      if (!isFormData) headers["Content-Type"] = "application/json";

      const res = await fetch(`${API_BASE_URL}/api/editprofile`, {
        method: "PUT",
        headers,
        body: isFormData ? updatedData : JSON.stringify(updatedData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Profile update failed");

      setUser(data.user);
      if (data.token) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
      }

      const elapsed = Date.now() - startTime;
      if (elapsed < minLoaderTime)
        await new Promise((resolve) =>
          setTimeout(resolve, minLoaderTime - elapsed)
        );

      setLoading(false);
      setLoadMode("done");

      return data.user;
    });

  const logout = () =>
    withLoader(async () => {
      const minLoaderTime = 1000;
      const startTime = Date.now();

      try {
        await fetch(`${API_BASE_URL}/api/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        const elapsed = Date.now() - startTime;
        if (elapsed < minLoaderTime)
          await new Promise((r) => setTimeout(r, minLoaderTime - elapsed));

        setUser(null);
        setLoggedOut(true);
        setWelcomeMessage("");
        setToken("");
        localStorage.removeItem("token");
      }
    });

  const deleteAccount = () =>
    withLoader(async () => {
      const minLoaderTime = 1000;
      const startTime = Date.now();

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
        console.error(err);
      } finally {
        const elapsed = Date.now() - startTime;
        if (elapsed < minLoaderTime)
          await new Promise((r) => setTimeout(r, minLoaderTime - elapsed));

        setUser(null);
        setWelcomeMessage("");
        setToken("");
        localStorage.removeItem("token");
      }
    });

  const value = {
    user,
    setUser,
    signup,
    login,
    fetchTemples,
    adminLogin,
    editProfile,
    logout,
    deleteAccount,
    loading,
    loadMode,
    welcomeMessage,
    setWelcomeMessage,
    token,
    isAdmin: user?.role === "admin",
    startLoader,
    finishLoader,
  };

  return (
    <>
      <LoadingBar
        color="orange"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
        height={2}
        shadow
      />
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </>
  );
};
