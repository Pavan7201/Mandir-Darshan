import { useEffect, useState } from "react";
import "../css/banner.css";

const Banner = ({ className = "" }) => {
  const [bannerUrl, setBannerUrl] = useState(null);

  const API_BASE_URL =
    import.meta.env.MODE === "production"
      ? "https://mandir-darshan.onrender.com"
      : "http://localhost:4000";

  useEffect(() => {
    const fetchBanner = async () => {
      const cachedAssets = sessionStorage.getItem("assets");

      if (cachedAssets) {
        const data = JSON.parse(cachedAssets);
        const banner = data.find((b) => b.category === "banner");
        if (banner && banner.items && banner.items.length > 0) {
          setBannerUrl(banner.items[0].url);
        }
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/assets`);
        const data = await res.json();
        sessionStorage.setItem("assets", JSON.stringify(data));
        const banner = data.find((b) => b.category === "banner");
        if (banner && banner.items && banner.items.length > 0) {
          setBannerUrl(banner.items[0].url);
        }
      } catch (err) {
        console.error("Error fetching banner:", err);
      }
    };
    fetchBanner();
  }, []);

  return (
    <section className={`banner-container ${className}`}>
      {bannerUrl ? (
        <img src={bannerUrl} alt="Banner" className="banner-image" />
      ) : (
        <p>Loading banner...</p>
      )}
      <div className="banner-caption">
        <h2>Experience the Divine Tranquility</h2>
        <p>
          Explore the sacred temples and embrace the spiritual heritage of India.
        </p>
      </div>
    </section>
  );
};

export default Banner;
