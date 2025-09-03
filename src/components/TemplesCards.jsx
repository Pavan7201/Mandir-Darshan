import lineDecor from "../HeadingDesign/HeadingDesign.png";
import noImage from "../assets/no-image.webp";
import { FaPencilAlt } from "react-icons/fa";
import "../css/TemplesCards.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../AuthContext";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const TemplesCards = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [temple, setTemple] = useState([]);
  const [uploadingTempleId, setUploadingTempleId] = useState(null);
  const [errorImages, setErrorImages] = useState(new Set());
  const fileInputRef = useRef(null);
  const sectionRef = useRef(null);

  useScrollAnimation([temple]);

  const API_BASE_URL =
    import.meta.env.MODE === "production"
      ? "https://mandir-darshan.onrender.com"
      : "http://localhost:4000";

  const handleClick = (e, link) => {
    if (!user && link !== "/notfound") {
      e.preventDefault();
      navigate("/SignUp");
    }
  };

  useEffect(() => {
    const cachedAssets = sessionStorage.getItem("assets");
    if (cachedAssets) {
      const data = JSON.parse(cachedAssets);
      const templeCategory = data.find((t) => t.category === "temple");
      setTemple(templeCategory ? templeCategory.items : []);
      return;
    }
    const fetchTemple = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/assets`);
        const data = await res.json();
        sessionStorage.setItem("assets", JSON.stringify(data));
        const templeCategory = data.find((t) => t.category === "temple");
        setTemple(templeCategory ? templeCategory.items : []);
      } catch (err) {
        console.error("Error fetching assets:", err);
      }
    };
    fetchTemple();
  }, [API_BASE_URL]);

  const triggerFileSelect = (templeId) => {
    setUploadingTempleId(templeId);
    fileInputRef.current?.click();
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "image/webp") {
      alert("Only webp images are allowed.");
      return;
    }

    try {
      const base64Image = await fileToBase64(file);
      if (!uploadingTempleId) return;
      if (!token) {
        alert("You must be logged in to update the image");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/assets/temple/${uploadingTempleId}/image`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ image: base64Image }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Failed to update image");
        return;
      }

      setTemple((prev) =>
        prev.map((t) =>
          t.id === uploadingTempleId ? { ...t, image: base64Image } : t
        )
      );

      const cachedAssets = sessionStorage.getItem("assets");
      if (cachedAssets) {
        const assetsData = JSON.parse(cachedAssets);
        const templeCategory = assetsData.find((t) => t.category === "temple");
        if (templeCategory) {
          templeCategory.items = templeCategory.items.map((item) =>
            item.id === uploadingTempleId
              ? { ...item, image: base64Image }
              : item
          );
          sessionStorage.setItem("assets", JSON.stringify(assetsData));
        }
      }

      setErrorImages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(uploadingTempleId);
        return newSet;
      });

      setUploadingTempleId(null);
      event.target.value = null;
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Error uploading image");
    }
  };

  return (
    <section className="temples" id="temples" ref={sectionRef}>
      <div className="temple-section-container">
        <h2 className="temple-heading animate-on-scroll">Temples</h2>
        <img
          src={lineDecor}
          alt="decorative line"
          className="line-decor-img animate-on-scroll"
          loading="lazy"
        />
        <div className="temple-cards-container">
          {temple.map((Temple, index) => (
            <div key={index} className="temple-card animate-on-scroll">
              <div style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={Temple.image || noImage}
                  alt={Temple.name}
                  onError={(e) => {
                    e.currentTarget.src = noImage;
                    setErrorImages((prev) => new Set(prev).add(Temple.id));
                  }}
                />
                {user && (!Temple.image || errorImages.has(Temple.id)) && (
                  <button
                    className="edit-image-btn"
                    onClick={() => triggerFileSelect(Temple.id)}
                    title="Edit Image"
                  >
                    <FaPencilAlt size={16} />
                  </button>
                )}
              </div>

              <h3 className="temple-card-title">{Temple.name}</h3>
              {Temple.deity && (
                <p className="temple-card-deity">{Temple.deity}</p>
              )}
              {Temple.caption && (
                <p className="temple-card-caption">{Temple.caption}</p>
              )}
              {Temple.location && (
                <p className="temple-card-location">{Temple.location}</p>
              )}
              {Temple.hours && (
                <div className="temple-card-footer">
                  <p className="temple-card-time">
                    <span className="clock">&#128339;</span>{" "}
                    <span className="time-list">
                      {Temple.hours.split(",").map((time, i) => (
                        <span key={i} className="time-item">
                          {time.trim()}
                          <br />
                        </span>
                      ))}
                    </span>
                  </p>
                  <NavLink
                    to={Temple.link}
                    onClick={(e) => handleClick(e, Temple.link)}
                    className="Visit-link"
                  >
                    Visit Temple
                  </NavLink>
                </div>
              )}
            </div>
          ))}
        </div>

        <input
          type="file"
          accept="image/webp"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>
    </section>
  );
};

export default TemplesCards;