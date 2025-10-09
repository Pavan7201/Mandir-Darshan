import { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import "../css/TemplePageBanner.css";
import TempleSearch from "./TempleSearch";
import TemplesCards from "../components/TemplesCards";
import { AuthContext } from "../AuthContext";

const TemplePageBanner = () => {
  const [animate, setAnimate] = useState(false);
  const location = useLocation();

  const [bannerUrl, setBannerUrl] = useState(null);
  const [altText, setAltText] = useState("");
  const [heading, setHeading] = useState("");
  const [paragraph, setParagraph] = useState("");

  const [temples, setTemples] = useState([]);
  
  const { fetchTemples } = useContext(AuthContext);

  useEffect(() => {
    setAnimate(false);
    const timeout = setTimeout(() => setAnimate(true), 10);
    return () => clearTimeout(timeout);
  }, [location]);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const cachedAssets = sessionStorage.getItem("assets");
        if (cachedAssets) {
          const data = JSON.parse(cachedAssets);
          const banner = data.find((b) => b.category === "Banner");
          if (banner && banner.items?.[2]) {
            const templeBanner = banner.items[2];
            setBannerUrl(templeBanner.bannerUrl);
            setAltText(templeBanner.alt);
            setHeading(templeBanner.h2);
            setParagraph(templeBanner.p);
          }
        }

        const res = await fetch(
          import.meta.env.MODE === "production"
            ? "https://mandir-darshan.onrender.com/api/assets"
            : "http://localhost:4000/api/assets"
        );
        const data = await res.json();
        sessionStorage.setItem("assets", JSON.stringify(data));
        const banner = data.find((b) => b.category === "Banner");
        if (banner && banner.items?.[2]) {
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

  useEffect(() => {
    const loadTemples = async () => {
      try {
        const data = await fetchTemples({ sortBy: "id" });
        setTemples(data);
      } catch (err) {
        console.error("Error fetching temples:", err);
      }
    };
    loadTemples();
  }, [fetchTemples]);

  return (
    <div className={`temple-banner-section ${animate ? "animate" : ""}`}>
      <div className="TemplePagebanner-container">
        {bannerUrl && (
          <img
            src={bannerUrl}
            alt={altText}
            className="TemplePageBanner-image"
          />
        )}
        <div className="TemplePageBanner-caption">
          <h2>{heading}</h2>
          <p>{paragraph}</p>
        </div>
      </div>

      <div className="temple-search-wrapper">
        <TempleSearch setTemples={setTemples} />
      </div>
      <TemplesCards temples={temples} />
    </div>
  );
};

export default TemplePageBanner;
