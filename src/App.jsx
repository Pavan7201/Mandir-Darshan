import React, { useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

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

import { ThemeProvider } from "./ThemeContext";
import { AuthProvider, AuthContext } from "./AuthContext";

import "./App.css";

const PrivateRoute = ({ children }) => {
  const { auth, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <p>Loading...</p>;

  if (!auth?.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function AppRoutes() {
  const { auth } = useContext(AuthContext);
  const location = useLocation();

  const layoutRoutes = [
    "/",
    "/Temples",
    "/Sevas-&-Booking",
    "/Donation",
    "/Media",
    "/Support",
  ];

  const showLayout = layoutRoutes.some((path) =>
    location.pathname.startsWith(path.toLowerCase())
  );

  const justLoggedOut = sessionStorage.getItem("justLoggedOut") === "true";
  const justLogoClick = sessionStorage.getItem("justLogoClick") === "true";

  useEffect(() => {
    if (justLogoClick) {
      sessionStorage.removeItem("justLogoClick");
    }
  }, [justLogoClick]);

  return (
    <div className="App">
      {showLayout && <Header />}

      <Routes>
        <Route
          path="/"
          element={
            auth?.user || justLogoClick ? (
              <Homepage />
            ) : justLoggedOut ? (
              <Navigate to="/login" replace />
            ) : (
              <Navigate to="/signup" replace />
            )
          }
        />

        <Route
          path="/login"
          element={auth?.user ? <Navigate to="/" replace /> : <LoginPage />}
        />

        <Route
          path="/signup"
          element={auth?.user ? <Navigate to="/" replace /> : <SignUpPage />}
        />
        <Route path="/" element={<Homepage />}></Route>
        <Route path="/Temples" element={<TemplesPage />} />
        <Route
          path="/Sevas-&-Booking"
          element={
            <PrivateRoute>
              <Sevas />
            </PrivateRoute>
          }
        />
        <Route path="/Donation" element={<DonationPage />} />
        <Route path="/Media" element={<MediaRoomPage />} />
        <Route path="/Support" element={<SupportPage />} />
        <Route path="/Notfound" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {showLayout && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router basename="/Mandir-Darshan">
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
