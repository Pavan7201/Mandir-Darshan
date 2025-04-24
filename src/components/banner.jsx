import React from "react";
import "../css/banner.css";
import Bannar from "../assets/Banner.jpg";
import Carousel from "./Carousel";

const Banner = () => {
  return (
    <>
      <div className="banner-container">
        <img src={Bannar} alt="Banner image" className="banner-image" />
        <div className="banner-caption">
          <h2>Experience the Divine Tranquility</h2>
          <p>
            Explore the sacred temples of Andhra Pradesh and embrace the
            spiritual heritage of India.
          </p>
        </div>
      </div>
      <div>
        <Carousel />
      </div>
    </>
  );
};

export default Banner;
