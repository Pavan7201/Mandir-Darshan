import { useContext} from "react";
import {
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
import { AuthContext } from "./AuthContext";

import "./App.css";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <p>Loading...</p>;

  if (!user) { return <Navigate to="/login" state={{ from: location }} replace />;}

  return children;
};

function AppRoutes() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const layoutRoutes = [
  "/", 
  "/home",
  "/temples", 
  "/sevas-&-booking", 
  "/donation", 
  "/media", 
  "/support"
];

const showLayout = layoutRoutes.some((path) => location.pathname.startsWith(path));
const redirectAfterLogout = sessionStorage.getItem("redirectAfterLogout");

  return (
    <div className="App">
      {showLayout && <Header />}

      <Routes>
        <Route path="/" element={ user ? ( <Homepage /> ) : redirectAfterLogout === "login" ? ( <Navigate to="/login" replace /> ) : ( <Navigate to="/signup" replace />)} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignUpPage />} />
        <Route path="/temples" element={<PrivateRoute> <TemplesPage /> </PrivateRoute>} />
        <Route path="/sevas-&-booking" element={ <PrivateRoute> <Sevas /> </PrivateRoute> } />
        <Route path="/donation" element={<PrivateRoute><DonationPage /></PrivateRoute>} />
        <Route path="/media" element={<MediaRoomPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/notfound" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {showLayout && <Footer />}
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
