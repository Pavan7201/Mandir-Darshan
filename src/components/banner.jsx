import { useEffect, useState } from "react";
import "../css/banner.css";
// import BannarImage from "../assets/Banner.webp";

const Banner = ({ className = "" }) => {
  const [bannerUrl, setBannerUrl] = useState(null);

  const API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://mandir-darshan.onrender.com"
    : "http://localhost:4000";

  useEffect(()=>{
    fetch (`${API_BASE_URL}/api/assets`).then(res => res.json()).then(data =>{
      const banner = data.find(a => a.name === "banner");
      if (banner) setBannerUrl(banner.url);
    })
    .catch(err => console.log(err));
  }, []);
  return (
    <>
      <section className={`banner-container ${className}`}>
        <img
          src={bannerUrl}
          alt="Banner"
          className="banner-image"
        />
        <div className="banner-caption">
          <h2>Experience the Divine Tranquility</h2>
          <p>
            Explore the sacred temples and embrace the spiritual heritage of
            India.
          </p>
        </div>
      </section>
    </>
  );
};

export default Banner;
