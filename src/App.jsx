import { useContext, useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import TemplesPage from "./Pages/TemplesPage";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Sevas from "./Pages/Sevas";
import DonationPage from "./Pages/DonationPage";
import MediaRoomPage from "./Pages/MediaRoomPage";
import SupportPage from "./Pages/SupportPage";
import LoginPage from "./Pages/LoginPage";
import SignUpPage from "./Pages/SignUpPage";
import NotFound from "./Pages/NotFoundPage";
import ProfileEdit from "./Pages/ProfileEdit";
import ChangePassword from "./Pages/ChangePassword";
import AdminLoginPage from "./Pages/AdminLoginPage";
import { ThemeProvider } from "./ThemeContext";
import { AuthContext } from "./AuthContext";

import "./App.css";
import TempleLoader from "./loader/TempleLoader";
import AdminPage from "./Pages/AdminPage";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <TempleLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
};

function AppRoutes() {
  const { user, loading, isAdmin } = useContext(AuthContext);
  const location = useLocation();

  const layoutRoutes = [
    "/", "/home", "/temples", "/sevas-&-booking", "/donation",
    "/media", "/support", "/notfound", "/admin"
  ];
  const showHeader = layoutRoutes.some(path => location.pathname.startsWith(path));

  const noFooterRoutes = [
    "/notfound",
    "/login",
    "/signup",
    "/editprofile",
    "/changepassword",
    "/adminlogin",
    "/admin",
  ];
  const showFooterAllowed = !noFooterRoutes.includes(location.pathname);

  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    if (!showFooterAllowed) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      setShowFooter(scrollTop + windowHeight >= docHeight - 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname, showFooterAllowed]);

  if (loading) return <TempleLoader />;

  return (
    <div className="App">
      {showHeader && <Header />}

      <Routes>
        <Route
          path="/"
          element={
            loading ? (
              <TempleLoader />
            ) : isAdmin || localStorage.getItem("isAdmin") === "true" ? (
              <Navigate to="/admin" replace />
            ) : user ? (
              <Homepage />
            ) : sessionStorage.getItem("redirectAfterLogout") === "login" ? (
              <Navigate to="/login" replace />
            ) : (
              <Navigate to="/signup" replace />
            )
          }
        />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignUpPage />} />

        <Route
          path="/adminlogin"
          element={isAdmin ? <Navigate to="/admin" replace /> : <AdminLoginPage />}
        />

        <Route path="/temples" element={<PrivateRoute><TemplesPage /></PrivateRoute>} />
        <Route path="/sevas-&-booking" element={<PrivateRoute><Sevas /></PrivateRoute>} />
        <Route path="/donation" element={<PrivateRoute><DonationPage /></PrivateRoute>} />
        <Route path="/admin" element={<AdminPage />} />

        <Route path="/media" element={<MediaRoomPage />} />
        <Route path="/support" element={<SupportPage />} />

        <Route path="/editprofile" element={<ProfileEdit />} />
        <Route path="/changepassword" element={<ChangePassword />} />
        <Route path="/notfound" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {showFooterAllowed && showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;
