import lineDecor from "../HeadingDesign/HeadingDesign.png";
import "../css/FeaturedTemples.css";
import { useEffect, useRef, useState } from "react";
import { useScrollAnimation } from "../hooks/useScrollAnimation"; 

const FeaturedTemples = ({ className = "" }) => {
  const [featureTemple, setFeaturedTemple] = useState([]);
  const sectionRef = useRef(null);
  useScrollAnimation([featureTemple]);

  const API_BASE_URL =
    import.meta.env.MODE === "production"
      ? "https://mandir-darshan.onrender.com"
      : "http://localhost:4000";

  useEffect(() => {
    const cachedAssets = sessionStorage.getItem("assets");

    if (cachedAssets) {
      const data = JSON.parse(cachedAssets);
      const featuredTempleCategory = data.find(
        (ft) => ft.category === "featuredTemple"
      );
      setFeaturedTemple(
        featuredTempleCategory ? featuredTempleCategory.items : []
      );
      return;
    }

    const fetchFeaturedTemple = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/assets`);
        const data = await res.json();

        sessionStorage.setItem("assets", JSON.stringify(data));

        const featuredTempleCategory = data.find(
          (ft) => ft.category === "featuredTemple"
        );
        setFeaturedTemple(
          featuredTempleCategory ? featuredTempleCategory.items : []
        );
      } catch (err) {
        console.error("Error fetching assets:", err);
      }
    };
    fetchFeaturedTemple();
  }, [API_BASE_URL]);

  return (
    <section
      className="featured-temples"
      id="featured-temples"
      ref={sectionRef}
    >
      <div className="featured-section-container">
        <h2 className="featured-heading animate-on-scroll">
          Featured Temples
        </h2>
        <img
          src={lineDecor}
          alt="decorative line"
          className="line-decor-img animate-on-scroll"
          loading="lazy"
        />
        <div className="featured-cards-container">
          {featureTemple.map((Temple, index) => (
            <div
              key={index}
              className="featured-card animate-on-scroll"
            >
              {Temple.imageUrl && (
                <img
                  src={Temple.imageUrl}
                  alt={Temple.name}
                  loading="lazy"
                  className="animate-on-scroll"
                />
              )}
              <h3 className="featured-card-title animate-on-scroll">
                {Temple.name}
              </h3>
              {Temple.location && (
                <p className="featured-card-description animate-on-scroll">
                  {Temple.location}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTemples;
