import { useEffect, useRef, useState } from "react";
import MediaRoom from "../components/MediaRoom";
import Faq from "../components/Faq's";
import SevasBanner from "../components/SevasBanner";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const MediaRoomPage = () => {
  const [mediaData, setMediaData] = useState([]);
  const [faqData, setFaqData] = useState([]);
  useScrollAnimation([mediaData, faqData]);
  const sectionRef = useRef(null);

  const API_BASE_URL =
    import.meta.env.MODE === "production"
      ? "https://mandir-darshan.onrender.com"
      : "http://localhost:4000";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchAssets = async () => {
      const cachedAssets = sessionStorage.getItem("assets");
      if (cachedAssets) {
        const data = JSON.parse(cachedAssets);

        const mediaCategory = data.find((m) => m.category === "media");
        setMediaData(mediaCategory ? mediaCategory.items : []);

        const faqCategory = data.find((f) => f.category === "faq");
        setFaqData(faqCategory ? faqCategory.items.slice(6, 9) : []);

        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/assets`);
        const data = await res.json();
        sessionStorage.setItem("assets", JSON.stringify(data));

        const mediaCategory = data.find((m) => m.category === "media");
        setMediaData(mediaCategory ? mediaCategory.items : []);

        const faqCategory = data.find((f) => f.category === "faq");
        setFaqData(faqCategory ? faqCategory.items.slice(6, 9) : []);
      } catch (err) {
        console.error("Error fetching assets:", err);
      }
    };

    fetchAssets();
  }, [API_BASE_URL]);

  return (
    <>
      <section>
        <SevasBanner
          AnimateOnScroll="animate-on-scroll"
          fadeup="animate"
          title="Media Room"
          showSevasCard={false}
        />
      </section>

      <section ref={sectionRef}>
        <MediaRoom
          AnimateOnScroll="animate-on-scroll"
          cardsToShow={mediaData.slice(0, 7)}
        />
        <hr />

        <Faq AnimateOnScroll="animate-on-scroll" faqs={faqData} />
      </section>
    </>
  );
};

export default MediaRoomPage;
