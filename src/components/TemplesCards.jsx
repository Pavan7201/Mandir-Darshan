import lineDecor from "../HeadingDesign/Design 2.png";
import { templeData } from "./TempleData";
import "../css/TemplesCards.css";

const TemplesCards = () => {
  return (
    <>
      <section className="temples" id="temples">
        <div className="temple-section-container">
          <h2 className="temple-heading animate-on-scroll">Temples</h2>
          <img
            src={lineDecor}
            alt="decorative line"
            className="line-decor-img animate-on-scroll"
            loading="lazy"
          />
          <div className="temple-cards-container">
            {templeData.map((Temple, index) => (
              <div key={index} className="temple-card animate-on-scroll">
                {Temple.image && (
                  <img loading="lazy" src={Temple.image} alt={Temple.name} />
                )}
                <h3 className="temple-card-title">{Temple.name}</h3>
                {Temple.deity && (
                  <p className="temple-card-deity">{Temple.deity}</p>
                )}
                {Temple.caption && (
                  <p className="temple-card-caption">{Temple.caption}</p>
                )}
                {Temple.location && (
                  <p className="temple-card-location">{Temple.location}</p>
                )}
                {Temple.hours && (
                  <div className="temple-card-footer">
                    <p className="temple-card-time">&#128339; {Temple.hours}</p>
                    <a href="#" className="Visit-link">
                      Visit Temple
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default TemplesCards;
