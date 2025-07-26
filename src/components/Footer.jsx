import React from "react";
import "../css/footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Mandir Darshan. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
