import {Suspense} from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./AuthContext";
import { BrowserRouter as Router } from "react-router-dom";
import "nprogress/nprogress.css";
import TempleLoader from "./loader/TempleLoader";

const redirect = sessionStorage.redirect;
if (redirect) {
  delete sessionStorage.redirect;
  window.history.replaceState(null, null, redirect);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  
  <Router basename="/Mandir-Darshan">
    <AuthProvider>
      <Suspense fallback={<TempleLoader />}>
      <App />
      </Suspense>
    </AuthProvider>
  </Router>
);
