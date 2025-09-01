import "../css/MediaRoom.css";
import lineDecor from "../HeadingDesign/HeadingDesign.png";
import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../AuthContext";

const MediaRoom = ({ cardsToShow, title = "Media Room", AnimateOnScroll = "" }) => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleClick = (e, link) => {
    if (!auth?.user && link !== "/notfound") {
      e.preventDefault(); 
      navigate("/SignUp");
    }
  };

  const dataToRender = cardsToShow;

  return (
    <section className="Media-Room" id="Media-Room">
      <div className="Media-section-container">
        <h2 className={`Media-heading ${AnimateOnScroll}`}>{title}</h2>
        <img
          src={lineDecor}
          alt="decorative line "
          className={`line-decor-img ${AnimateOnScroll}`}
        />

        <div className="media-room">
          {dataToRender.map(({ id, url, title, description, link }) => (
            <div className={`media-card ${AnimateOnScroll}`} key={id}>
              <video
                className="media-video"
                src={url}
                autoPlay
                loop
                muted
                playsInline
              />
              <h3 className={`media-title ${AnimateOnScroll}`}>{title}</h3>
              <p className={`media-description ${AnimateOnScroll}`}>{description}</p>
              <NavLink
                to={link || "/notfound"}
                onClick={(e) => handleClick(e, link)}
                className="view-more-btn"
              >
                View More <span className="arrow">&#x203A;</span>
              </NavLink>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MediaRoom;
