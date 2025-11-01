import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./AuthContext";
import { BrowserRouter as Router } from "react-router-dom";
import TempleLoader from "./loader/TempleLoader";
import VoiceflowWidget from "./components/VoiceFlowWidget";

const redirect = sessionStorage.redirect;
if (redirect) {
  delete sessionStorage.redirect;
  window.history.replaceState(null, null, redirect);
}

const container = document.getElementById("root");


let root;
if (!container._reactRoot) {
  root = ReactDOM.createRoot(container);
  container._reactRoot = root;
} else {
  root = container._reactRoot;
}

root.render(
  <Router basename="/Mandir-Darshan">
    <AuthProvider>
      <Suspense fallback={<TempleLoader />}>
        <App />
      </Suspense>
      <VoiceflowWidget />
    </AuthProvider>
  </Router>
);
