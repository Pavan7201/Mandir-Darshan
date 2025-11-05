import { useEffect, useState } from "react";
import "../css/footer.css";

const Footer = () => {
  const [animate, setAnimate] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

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

    if (window.scrollY > 300){
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [animate]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className={`footer ${animate ? "animate" : ""}`}>
      <p>© {new Date().getFullYear()} Mandir Darshan. All rights reserved.</p>
      <button
        className={`scroll-to-top ${showScrollTop ? "show" : ""}`} onClick={scrollToTop}>↑
      </button>
    </footer>
  );
};

export default Footer;
