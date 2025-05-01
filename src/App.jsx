import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import TemplesPage from "./Pages/TemplesPage";
import Footer from "./components/Footer";
import "./App.css";
import Header from "./components/Header";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/Mandir-Darshan" element={<Homepage />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/temples" element={<TemplesPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
