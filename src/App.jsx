import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Homepage from "./Pages/Homepage";
import TemplesPage from "./Pages/TemplesPage";
import Footer from "./components/Footer";
import "./App.css";
import Header from "./components/Header";
import Sevas from "./Pages/Sevas";
import DonationPage from "./Pages/DonationPage";
import MediaRoomPage from "./Pages/MediaRoomPage";
import SupportPage from "./Pages/SupportPage";

import { ThemeProvider } from "./ThemeContext";
import LoginPage from "./Pages/LoginPage";
import SignUpPage from "./Pages/SignUpPage";

function AppRoutes() {
  const location = useLocation();

  const layoutRoutes = ["/"];
  const showLayout = layoutRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="App">
      {showLayout && <Header />}
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/Temples" element={<TemplesPage />} />
        <Route path="/Sevas-&-Booking" element={<Sevas />} />
        <Route path="/Donation" element={<DonationPage />} />
        <Route path="/Media" element={<MediaRoomPage/>} />
        <Route path="/Support" element={<SupportPage />} />
        <Route path="/Login" element={<LoginPage/>} />
        <Route path="/SignUp" element={<SignUpPage />} />
      </Routes>
      
      {showLayout && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
    <Router basename="/Mandir-Darshan">
      <AppRoutes />
    </Router>
    </ThemeProvider>
  );
}

export default App;
