import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./AuthContext";
import { BrowserRouter as Router } from "react-router-dom";
import "nprogress/nprogress.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router basename="/Mandir-Darshan">
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);
