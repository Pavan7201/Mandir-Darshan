import { useEffect, useState } from "react";
import SevasBanner from "../components/SevasBanner";
import Faq from "../components/Faq's";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const Sevas = () => {
  const [faqData, setFaqData] = useState([]);

  useScrollAnimation([faqData]);

  const API_BASE_URL =
    import.meta.env.MODE === "production"
      ? "https://mandir-darshan.onrender.com"
      : "http://localhost:4000";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const cachedAssets = sessionStorage.getItem("assets");
    if (cachedAssets) {
      const data = JSON.parse(cachedAssets);
      const faqCategory = data.find((f) => f.category === "faq");
      setFaqData(faqCategory ? faqCategory.items.slice(0, 3) : []);
      return;
    }

    const fetchFaq = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/assets`);
        const data = await res.json();
        sessionStorage.setItem("assets", JSON.stringify(data));

        const faqCategory = data.find((f) => f.category === "faq");
        setFaqData(faqCategory ? faqCategory.items.slice(0, 3) : []);
      } catch (err) {
        console.error("Error fetching assets:", err);
      }
    };

    fetchFaq();
  }, [API_BASE_URL]);

  return (
    <div>
      <SevasBanner AnimateOnScroll="animate-on-scroll" fadeup="animate" />
      <hr />
      <Faq AnimateOnScroll="animate-on-scroll" faqs={faqData} />
    </div>
  );
};

export default Sevas;