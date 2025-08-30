import { useEffect, useState } from "react";
import "../css/banner.css";

const Banner = ({ className = "" }) => {
  const [bannerUrl, setBannerUrl] = useState(null);
  const [altText, setAltText] = useState("");
  const [heading, setHeading] = useState("");
  const [paragraph, setParagraph] = useState("");

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
        if (banner && banner.items && banner.items.length > 0) {
          setBannerUrl(banner.items[0].bannerUrl);
          setAltText(banner.items[0].alt);  
          setHeading(banner.items[0].h2);
          setParagraph(banner.items[0].p);
        }
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/assets`);
        const data = await res.json();
        sessionStorage.setItem("assets", JSON.stringify(data));
        const banner = data.find((b) => b.category === "Banner");
        if (banner && banner.items && banner.items.length > 0) {
          setBannerUrl(banner.items[0].bannerUrl);
          setAltText(banner.items[0].alt);
          setHeading(banner.items[0].h2);
          setParagraph(banner.items[0].p);
        }
      } catch (err) {
        console.error("Error fetching banner:", err);
      }
    };
    fetchBanner();
  }, []);

  return (
    <section className={`banner-container ${className}`}>
        <img src={bannerUrl} alt={altText} className="banner-image" />
      <div className="banner-caption">
        <h2>{heading}</h2>
        <p>{paragraph}</p>
      </div>
    </section>
  );
};

export default Banner;
