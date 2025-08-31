import { useContext, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/DevoteServices.css";
import { AuthContext } from "../AuthContext";
import lineDecor from "../HeadingDesign/HeadingDesign.png";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const DevoteServices = ({ className = "" }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const sectionRef = useRef(null);

  useScrollAnimation([services]);

  const API_BASE_URL =
    import.meta.env.MODE === "production"
      ? "https://mandir-darshan.onrender.com"
      : "http://localhost:4000";

  const handleClick = (serviceLink) => {
    if (!user) {
      navigate("/signup");
    } else {
      navigate(serviceLink);
    }
  };

  useEffect(() => {
    const cachedAssets = sessionStorage.getItem("assets");

    if (cachedAssets) {
      const data = JSON.parse(cachedAssets);
      const serviceCategory = data.find((t) => t.category === "services");
      setServices(serviceCategory ? serviceCategory.items : []);
      return;
    }

    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/assets`);
        const data = await res.json();

        sessionStorage.setItem("assets", JSON.stringify(data));
        const serviceCategory = data.find((t) => t.category === "services");
        setServices(serviceCategory ? serviceCategory.items : []);
      } catch (err) {
        console.error("Error fetching assets:", err);
      }
    };
    fetchServices();
  }, [API_BASE_URL]);

  return (
    <section className="devote-services" id="devote-services" ref={sectionRef}>
      <div className="devote-section-container">
        <h2 className={`devote-heading ${className}`}>Devote Services</h2>
        <img
          src={lineDecor}
          alt="decorative line"
          className={`line-decor-img ${className}`}
        />
        <div className="devote-cards-container">
          {services.map((service, index) => (
            <div
              key={index}
              className={`devote-card animate-on-scroll ${className}`}
            >
              <video className="devote-icon" autoPlay loop muted playsInline>
                <source src={service.icon} type="video/mp4" />
              </video>

              <h3 className="devote-card-title">{service.title}</h3>
              <p className="devote-card-description">{service.description}</p>
              <button
                className="Devote-btn"
                onClick={() => handleClick(service.link)}
              >
                <span>{service.type}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DevoteServices;
