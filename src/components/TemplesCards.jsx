import lineDecor from "../HeadingDesign/HeadingDesign.png";
import noImage from "../assets/no-image.webp";
import "../css/TemplesCards.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../AuthContext";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const TemplesCards = () => {
  const { auth, user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [temple, setTemple] = useState([]);
  const [brokenImages, setBrokenImages] = useState({});
  const sectionRef = useRef(null);

  useScrollAnimation([temple]);

  const API_BASE_URL =
    import.meta.env.MODE === "production"
      ? "https://mandir-darshan.onrender.com"
      : "http://localhost:5000";

  // Redirect if user not logged in
  const handleClick = (e, link) => {
    if (!auth?.user && link !== "/notfound") {
      e.preventDefault();
      navigate("/SignUp");
    }
  };

  // Upload temple image
  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "image/webp") {
      alert("Only .webp files are allowed!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("templeId", temple[index]._id);

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload-temple-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");

      // Update local state
      setTemple((prev) => {
        const newTemples = [...prev];
        newTemples[index].image = data.imageUrl;
        return newTemples;
      });
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
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
          {temple.map((Temple, index) =>(
            
            <div key={index} className="temple-card animate-on-scroll">
              <div className="temple-card-image">
                <img src={brokenImages[index] ? noImage : Temple.image} alt={Temple.name}  
                onError={() => setBrokenImages(prev => ({ ...prev, [index]: true }))}/>
              </div>
              <h3 className="temple-card-title">{Temple.name}</h3>
              {Temple.deity && <p className="temple-card-deity">{Temple.deity}</p>}
              {Temple.caption && <p className="temple-card-caption">{Temple.caption}</p>}
              {Temple.location && <p className="temple-card-location">{Temple.location}</p>}

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
      </div>
    </section>
  );
};

export default TemplesCards;