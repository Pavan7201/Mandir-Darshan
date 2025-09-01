import lineDecor from "../HeadingDesign/HeadingDesign.png";
import "../css/PhotoGallery.css";
import { useState, useEffect, useRef } from "react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const PhotoGallery = ({ className = "" }) => {
  const [image, setImage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sectionRef = useRef(null);
  useScrollAnimation([image]);

  const API_BASE_URL =
    import.meta.env.MODE === "production"
      ? "https://mandir-darshan.onrender.com"
      : "http://localhost:4000";

  useEffect(() => {
    const cachedAssets = sessionStorage.getItem("assets");

    if (cachedAssets) {
      try {
        const data = JSON.parse(cachedAssets);

        if (Array.isArray(data)) {
          const galleryCategory = data.find((g) => g.category === "gallery");
          setImage(galleryCategory ? galleryCategory.items : []);
          setLoading(false);
          return;
        } else {
          console.warn("Invalid cached assets, clearing sessionStorage:", data);
          sessionStorage.removeItem("assets");
        }
      } catch (err) {
        console.error("Error parsing cached assets:", err);
        sessionStorage.removeItem("assets");
      }
    }

    const fetchGallery = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/assets`);
        const data = await res.json();

        console.log("Fetched assets:", data);

        if (Array.isArray(data)) {
          sessionStorage.setItem("assets", JSON.stringify(data));
          const galleryCategory = data.find((g) => g.category === "gallery");
          setImage(galleryCategory ? galleryCategory.items : []);
        } else {
          console.error("Unexpected API response:", data);
          setError("API did not return valid assets.");
        }
      } catch (err) {
        console.error("Error fetching assets:", err);
        setError("Failed to fetch gallery.");
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [API_BASE_URL]);

  if (loading) return <p>Loading gallery...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!image.length) return null;

  return (
    <section className="Photo-Gallery" id="Photo-Gallery" ref={sectionRef}>
      <div className="Photo-section-container">
        <h2 className={`Photo-heading ${className}`}>Photo Gallery</h2>
        <img
          src={lineDecor}
          alt="decorative line"
          className={`line-decor-img ${className}`}
        />
        <div className="Grid-container">
          {image.map((img, i) => (
            <img
              className={`${className}`}
              key={img.id || img._id || i}
              src={img.imageUrl || img.ImageUrl}
              alt={img.alt || "gallery image"}
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhotoGallery;
