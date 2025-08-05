import { useEffect } from "react";

export const useScrollAnimation = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    const elements = document.querySelectorAll(".animate-on-scroll, .animate");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};
