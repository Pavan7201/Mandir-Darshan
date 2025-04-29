import React from "react";
import "../css/banner.css";
import Bannar from "../assets/Banner.jpg";

const Banner = () => {
  return (
    <>
      <div className="banner-container">
        <img
          src={Bannar}
          alt="Banner image"
          className="banner-image"
          loading="lazy"
        />
        <div className="banner-caption">
          <h2>Experience the Divine Tranquility</h2>
          <p>
            Explore the sacred temples and embrace the spiritual heritage of
            India.
          </p>
        </div>
      </div>
    </>
  );
};

export default Banner;
