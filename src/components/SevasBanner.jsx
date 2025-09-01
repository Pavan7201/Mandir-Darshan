import { useEffect, useState } from "react";
import "../css/SevasBanner.css";
import SevasCard from "./SevasCard";

const SevasBanner = ({
  title = "Sevas & Bookings",
  showSevasCard = true,
  fadeup = "",
  AnimateOnScroll = "",
}) => {
  const [bannerUrl, setBannerUrl] = useState(null);
  const [altText, setAltText] = useState("");
  const [paragraph, setParagraph] = useState("Dharmo Rakshathi Rakshithah"); 

  const API_BASE_URL =
    import.meta.env.MODE === "production"
      ? "https://mandir-darshan.onrender.com"
      : "http://localhost:4000";

  useEffect(() => {
    const fetchBanner = async () => {
      const cachedAssets = sessionStorage.getItem("assets");

      if (cachedAssets) {
        const data = JSON.parse(cachedAssets);
        const banner = data.find((b) => b.category === "Banner");
        if (banner && banner.items && banner.items.length > 1) {
          const sevasBanner = banner.items[3];
          setBannerUrl(sevasBanner.bannerUrl);
          setAltText(sevasBanner.alt);
          setParagraph(sevasBanner.p);
          return;
        }
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/assets`);
        const data = await res.json();
        sessionStorage.setItem("assets", JSON.stringify(data));
        const banner = data.find((b) => b.category === "Banner");
        if (banner && banner.items && banner.items.length > 2) {
          const sevasBanner = banner.items[3];
          setBannerUrl(sevasBanner.bannerUrl);
          setAltText(sevasBanner.alt || "Sevas & Bookings Banner");
          setParagraph(sevasBanner.p || "Dharmo Rakshathi Rakshithah");
        }
      } catch (err) {
        console.error("Error fetching Sevas banner:", err);
      }
    };
    fetchBanner();
  }, []);

  return (
    <>
      <section className="Sevas-banner-section">
        <img src={bannerUrl} alt={altText} className={`banner-bg-img ${fadeup}`}/>
        <div className="banner-overlay"></div>
        <div className={`SevasBanner-caption ${AnimateOnScroll}`}>
          <h1>{title}</h1>
          <p>{paragraph}</p>
        </div>
      </section>
      <div>{showSevasCard && <SevasCard AnimateOnScroll="animate-on-scroll" />}</div>
    </>
  );
};

export default SevasBanner;
