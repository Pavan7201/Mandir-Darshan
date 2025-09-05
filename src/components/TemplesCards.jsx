import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import lineDecor from "../HeadingDesign/HeadingDesign.png";
import noImage from "../assets/no-image.webp";
import { AuthContext } from "../AuthContext";
import "../css/TemplesCards.css";

const TemplesCards = ({ temples = [] }) => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [brokenImages, setBrokenImages] = useState({});

  const handleClick = (e, link) => {
    if (!auth?.user && link !== "/notfound") {
      e.preventDefault();
      navigate("/SignUp");
    }
  };

  return (
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
          {temples.length === 0 && <p>No temples found</p>}
          {temples.map((temple, index) => (
            <div key={index} className="temple-card">
              <div className="temple-card-image">
                <img
                  src={brokenImages[index] ? noImage : temple.image}
                  alt={temple.name}
                  onError={() =>
                    setBrokenImages((prev) => ({ ...prev, [index]: true }))
                  }
                />
              </div>

              <h3 className="temple-card-title">{temple.name}</h3>
              {temple.deity && <p className="temple-card-deity">{temple.deity}</p>}
              {temple.caption && (
                <p className="temple-card-caption">{temple.caption}</p>
              )}
              {temple.location && (
                <p className="temple-card-location">{temple.location}</p>
              )}

              {temple.hours && (
                <div className="temple-card-footer">
                  <p className="temple-card-time">
                    <span className="clock">&#128339;</span>{" "}
                    <span className="time-list">
                      {temple.hours.split(",").map((time, i) => (
                        <span key={i} className="time-item">
                          {time.trim()}
                          <br />
                        </span>
                      ))}
                    </span>
                  </p>
                  <NavLink
                    to={temple.link || "/notfound"}
                    onClick={(e) => handleClick(e, temple.link)}
                    className="Visit-link"
                  >
                    Visit Temple
                  </NavLink>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TemplesCards;
