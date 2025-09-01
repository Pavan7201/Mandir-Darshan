import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../css/TemplePageBanner.css";
import TempleSearch from "./TempleSearch";
import TemplesCards from "../components/TemplesCards";

const TemplePageBanner = () => {
  const [animate, setAnimate] = useState(false);
  const location = useLocation();

  const [bannerUrl, setBannerUrl] = useState(null);
  const [altText, setAltText] = useState("");
  const [heading, setHeading] = useState("");
  const [paragraph, setParagraph] = useState("");

  const API_BASE_URL =
    import.meta.env.MODE === "production"
      ? "https://mandir-darshan.onrender.com"
      : "http://localhost:4000";

  useEffect(() => {
    setAnimate(false);
    const timeout = setTimeout(() => setAnimate(true), 10);
    return () => clearTimeout(timeout);
  }, [location]);

  useEffect(() => {
    const fetchBanner = async () => {
      const cachedAssets = sessionStorage.getItem("assets");
      if (cachedAssets) {
        const data = JSON.parse(cachedAssets);
        const banner = data.find((b) => b.category === "Banner");
        if (banner && banner.items && banner.items.length > 1) {
          const templeBanner = banner.items[2];
          setBannerUrl(templeBanner.bannerUrl);
          setAltText(templeBanner.alt);
          setHeading(templeBanner.h2);
          setParagraph(templeBanner.p);
        }
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/assets`);
        const data = await res.json();
        sessionStorage.setItem("assets", JSON.stringify(data));
        const banner = data.find((b) => b.category === "Banner");
        if (banner && banner.items && banner.items.length > 1) {
          const templeBanner = banner.items[2];
          setBannerUrl(templeBanner.bannerUrl);
          setAltText(templeBanner.alt);
          setHeading(templeBanner.h2);
          setParagraph(templeBanner.p);
        }
      } catch (err) {
        console.error("Error fetching temple page banner:", err);
      }
    };
    fetchBanner();
  }, []);

  return (
    <div className={`temple-banner-section ${animate ? "animate" : ""}`}>
      <div className="TemplePagebanner-container">
          <img src={bannerUrl} alt={altText} className="TemplePageBanner-image"/>
        <div className="TemplePageBanner-caption">
          <h2>{heading}</h2>
          <p>{paragraph}</p>
        </div>
      </div>
      <div className="temple-search-wrapper">
        <TempleSearch />
      </div>
      <TemplesCards />
    </div>
  );
};

export default TemplePageBanner;
