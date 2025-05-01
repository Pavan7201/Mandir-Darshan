import React from "react";
import lineDecor from "../HeadingDesign/Design 2.png";
import { templeData } from "./TempleData";
import "../css/TemplesCards.css";

const FeaturedTemples = () => {
  return (
    <>
      <section className="temples" id="temples">
        <div className="temple-section-container">
          <h2 className="temple-heading">Temples</h2>
          <img
            src={lineDecor}
            alt="decorative line"
            className="line-decor-img"
            loading="lazy"
          />
          <div className="temple-cards-container">
            {templeData.slice(11).map((Temple, index) => (
              <div key={index} className="temple-card">
                <img loading="lazy" src={Temple.image}></img>
                <h3 className="temple-card-title">{Temple.name}</h3>
                <p className="temple-card-description">{Temple.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturedTemples;
