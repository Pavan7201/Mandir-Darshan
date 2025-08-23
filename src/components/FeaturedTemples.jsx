import lineDecor from "../HeadingDesign/HeadingDesign.png";
import { templeData } from "./TempleData";
import "../css/FeaturedTemples.css";

const FeaturedTemples = ({className=""}) => {
  return (
    <>
      <section className="featured-temples" id="featured-temples">
        <div className="featured-section-container">
          <h2 className={`featured-heading ${className}`}>Featured Temples</h2>
          <img
            src={lineDecor}
            alt="decorative line"
            className={`line-decor-img ${className}`}
          />
          <div className="featured-cards-container">
            {templeData.slice(11).map((Temple, index) => (
              <div key={index} className={`featured-card ${className}`}>
                <img src={Temple.image}></img>
                <h3 className="featured-card-title">{Temple.name}</h3>
                <p className="featured-card-description">{Temple.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturedTemples;
