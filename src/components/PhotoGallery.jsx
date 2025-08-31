import lineDecor from "../HeadingDesign/HeadingDesign.png";
import "../css/PhotoGallery.css";
import { useState, useEffect, useRef } from "react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const PhotoGallery = ({className=""}) => {
  const [image, setImage] = useState([]);
  const sectionRef = useRef(null);
  useScrollAnimation([image]);
  const API_BASE_URL =
    import.meta.env.MODE === "production"
      ? "https://mandir-darshan.onrender.com"
      : "http://localhost:4000";

      useEffect(() => {
        const cachedAssets = sessionStorage.getItem("assets");

        if(cachedAssets) {
          const data = JSON.parse(cachedAssets);
          const galleryCategory = data.find((g) => g.category === "gallery");
          setImage(galleryCategory ? galleryCategory.items : []);
          return;
        }

        const fetchGallery = async () => {
          try{
            const res = await fetch(`${API_BASE_URL}/api/assets`);
        const data = await res.json();

        sessionStorage.setItem("assets", JSON.stringify(data));

        const galleryCategory = data.find((g) => g.category === "gallery");
        setImage(galleryCategory ? galleryCategory.items : []);
          }catch (err){
            console.error("Error fetching assets:", err);
          }
        };
        fetchGallery();
      },[API_BASE_URL])
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
          {image.map((img) => {
            return <img className={`${className}`} key={img.id} src={img.ImageUrl} alt={img.alt} />;
          })}
        </div>
      </div>
    </section>
  );
};

export default PhotoGallery;
