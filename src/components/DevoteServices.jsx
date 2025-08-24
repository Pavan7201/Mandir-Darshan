import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../css/DevoteServices.css";
import { AuthContext } from "../AuthContext";
import Seva from "../assets/Seva.mp4";
import Donate from "../assets/Donate.mp4";
import Accommodation from "../assets/Accommodation.mp4";
import Temple from "../assets/Temple.mp4";
import lineDecor from "../HeadingDesign/HeadingDesign.png";

const services = [
  {
    title: "Seva",
    description: "Participate in daily rituals and services offered to the deity.",
    type: "Book Now",
    link: "/sevas-&-booking",
    icon: Seva,
  },
  {
    title: "E-Hundi",
    description: "Contribute your donations online through our secure portal.",
    type: "Donate Now",
    link: "/donation",
    icon: Donate,
  },
  {
    title: "Accommodation",
    description: "Book rooms or guesthouses for a comfortable stay.",
    type: "Book Now",
    link: "/notfound",
    icon: Accommodation,
  },
  {
    title: "Our Village Our Temple",
    description: "Explore the heritage and stories behind our village and temple.",
    type: "Donate Now",
    link: "/donation",
    icon: Temple,
  },
];

const DevoteServices = ({ className = "" }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleClick = (serviceLink) => {
    if (!user) {
      navigate("/signup"); // redirect to signup if not logged in
    } else {
      navigate(serviceLink);
    }
  };

  return (
    <section className="devote-services" id="devote-services">
      <div className="devote-section-container">
        <h2 className={`devote-heading ${className}`}>Devote Services</h2>
        <img
          src={lineDecor}
          alt="decorative line"
          className={`line-decor-img ${className}`}
        />
        <div className="devote-cards-container">
          {services.map((service, index) => (
            <div key={index} className={`devote-card ${className}`}>
              <video
                className="devote-icon"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src={service.icon} type="video/mp4" />
              </video>

              <h3 className="devote-card-title">{service.title}</h3>
              <p className="devote-card-description">
                {service.description}
              </p>
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
