import React from "react";
import "../css/DevoteServices.css";
import Seva from "../assets/Seva.mp4";
import Donate from "../assets/Donate.mp4";
import Accommodation from "../assets/Accommodation.mp4";
import Temple from "../assets/Temple.mp4";
import lineDecor from "../HeadingDesign/Design 2.png";

const services = [
  {
    title: "Seva",
    description:
      "Participate in daily rituals and services offered to the deity.",
    type: "Book Now",
    icon: Seva,
  },
  {
    title: "E-Hundi",
    description: "Contribute your donations online through our secure portal.",
    type: "Donate Now",
    icon: Donate,
  },
  {
    title: "Accommodation",
    description: "Book rooms or guesthouses for a comfortable stay.",
    type: "Book Now",
    icon: Accommodation,
  },
  {
    title: "Our Village Our Temple",
    description:
      "Explore the heritage and stories behind our village and temple.",
    type: "Donate Now",
    icon: Temple,
  },
];

const DevoteServices = () => {
  return (
    <section className="devote-services" id="devote-services">
      <div className="devote-section-container">
        <h2 className="devote-heading">Devote Services</h2>
        <img
          loading="lazy"
          src={lineDecor}
          alt="decorative line"
          className="line-decor-img"
        />
        <div className="devote-cards-container">
          {services.map((service, index) => (
            <div key={index} className="devote-card">
              <video
                src={service.icon}
                className="devote-icon"
                autoPlay
                loop
                muted
                playsInline
              />
              <h3 className="devote-card-title">{service.title}</h3>
              <p className="devote-card-description">{service.description}</p>

              <a href="#Book-Now" className="book-now-btn">
                {service.type}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DevoteServices;
