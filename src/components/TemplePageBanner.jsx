import { useEffect, useState } from "react";
import {useLocation} from "react-router-dom"
import "../css/TemplePageBanner.css";
import Banner from "../assets/TemplesPageBanner.webp";
import TempleSearch from "./TempleSearch";
import TemplesCards from "../components/TemplesCards";

const TemplePageBanner = () => {
  const [animate, setAnimate] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setAnimate(false); 
    const timeout = setTimeout(() => setAnimate(true), 10); 
    return () => clearTimeout(timeout);
  }, [location]);

  return (
    <div className={`temple-banner-section ${animate ? "animate" : ""}`}>
      <div className="TemplePagebanner-container">
        <img
          src={Banner}
          alt="Banner image"
          className="TemplePageBanner-image"
        />
        <div className="TemplePageBanner-caption">
          <h2>Explore Temples Across Andhra Pradesh</h2>
          <p>
            Browse Spiritual places, learn histories, and book darshans
            instantly.
          </p>
        </div>
      </div>
      <div className="temple-search-wrapper">
        <TempleSearch />
      </div>
      <TemplesCards />
    </div>
  );
};

export default TemplePageBanner;
