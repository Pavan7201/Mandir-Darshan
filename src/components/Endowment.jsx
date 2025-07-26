import React from "react";
import lineDecor from "../HeadingDesign/Design 2.png";
import "../css/Endowment.css";
import Chandrababu_Naidu from "../assets/Chandrababu Naidu.jpg";
import Sri_Anam_Ramanarayana_Reddy from "../assets/Sri Anam Ramanarayana Reddy.png";
import Sri_K_Ramachandra_Mohan from "../assets/Sri K. Ramachandra Mohan.jpeg";
import Sri_Vadarevu_Vinay_Chand from "../assets/Sri Vadarevu Vinay Chand.jpeg";

const images = [
  {
    src: Chandrababu_Naidu,
    alt: "Chandrababu_Naidu",
    name: "Sri Nara Chandrababu Naidu",
    position: "Hon’ble Chief Minister of Andhra Pradesh",
  },
  {
    src: Sri_Anam_Ramanarayana_Reddy,
    alt: "Sri Anam Ramanarayana Reddy",
    name: "Sri Anam Ramanarayana Reddy",
    position: "Hon’ble Minister for Endowments, Andhra Pradesh",
  },
  {
    src: Sri_Vadarevu_Vinay_Chand,
    alt: "Sri Vadarevu Vinay Chand",
    name: "Sri Vadarevu Vinay Chand, IAS",
    position: "Secretary, Revenue Endowments Department",
  },
  {
    src: Sri_K_Ramachandra_Mohan,
    alt: "Sri K. Ramachandra Mohan",
    name: "Sri K. Ramachandra Mohan",
    position: "Commissioner of Endowments Andhra Pradeshh",
  },
];

const Endowment = () => {
  return (
    <section className="Endowment" id="Endowment">
      <div className="Endowment-section-container">
        <h2 className="Endowment-heading">
          Government of Andhra Pradesh - Endowment Department
        </h2>
        <img
          loading="lazy"
          src={lineDecor}
          alt="decorative line"
          className="line-decor-img"
        />

        <div className="card-wrapper">
          {images.map((img) => (
            <div className="profile-card" key={img.name}>
              <img className="profile-img" src={img.src} alt={img.alt} />
              <h5>{img.name}</h5>
              <p>{img.position}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Endowment;
