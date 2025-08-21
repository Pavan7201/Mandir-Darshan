import { useEffect, useState } from "react";
import "../css/footer.css";

const Footer = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      const threshold = 10;

      if (scrollPosition > pageHeight - threshold) {
        if (!animate) setAnimate(true);
      } else {
        if (animate) setAnimate(false);
      }
    };

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [animate]);

  return (
    <footer className={`footer ${animate ? "animate" : ""}`}>
      <p>© {new Date().getFullYear()} Mandir Darshan. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
