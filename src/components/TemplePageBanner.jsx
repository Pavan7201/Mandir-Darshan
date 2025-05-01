import React from "react";
import "../css/TemplePageBanner.css";
import Banner from "../assets/TemplesPageBanner.jpg";
import TempleSearch from "./TempleSearch";
import TemplesCards from "../components/TemplesCards";

const TemplePageBanner = () => {
  return (
    <div className="temple-banner-section">
      <div className="TemplePagebanner-container">
        <img
          src={Banner}
          alt="Banner image"
          className="TemplePageBanner-image"
          loading="lazy"
        />
        <div className="TemplePageBanner-caption">
          <h2>Explore Temples Across India</h2>
          <p>
            Browse Spiritual places, learn histories, and book darshans
            instantly.
          </p>
        </div>
      </div>
      <div className="temple-search-wrapper">
        <TempleSearch />
      </div>
      <div>
        <TemplesCards />
      </div>
    </div>
  );
};

export default TemplePageBanner;
