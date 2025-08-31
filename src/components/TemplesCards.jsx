import lineDecor from "../HeadingDesign/HeadingDesign.png";
import noImage from "../assets/no-image.webp";
import "../css/TemplesCards.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../AuthContext";
import { useScrollAnimation } from "../hooks/useScrollAnimation"; 


const TemplesCards = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [temple, setTemple] = useState([]);
  const sectionRef = useRef(null); 

  useScrollAnimation([temple]);


  const API_BASE_URL =
    import.meta.env.MODE === "production"
      ? "https://mandir-darshan.onrender.com"
      : "http://localhost:4000";

  const handleClick = (e) => {
    if (!auth?.user) {
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
    {Temple.image && (
      <img
        src={Temple.image}
        alt={Temple.name}
        onError={(e) => {
          e.currentTarget.src = noImage;
        }}
        loading="lazy"
      />
    )}
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
          onClick={handleClick}
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
