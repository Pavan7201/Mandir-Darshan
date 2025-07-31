import React from "react";
import { MediaData } from "../Data/MediaData";
import "../css/MediaRoom.css";
import lineDecor from "../HeadingDesign/Design 2.png";

const MediaRoom = ({ cardsToShow, title="Media Room" }) => {
  const dataToRender = cardsToShow || MediaData;
  return (
    <section className="Media-Room" id="Media-Room">
      <div className="Media-section-container">
        <h2 className="Media-heading">{title}</h2>
        <img
          loading="lazy"
          src={lineDecor}
          alt="decorative line"
          className="line-decor-img"
        />

        <div className="media-room">
          {dataToRender.map(({ id, video, title, description, link }) => (
            <div className="media-card" key={id}>
              <video
                className="media-video"
                src={video}
                autoPlay
                loop
                muted
                playsInline
              />
              <h3 className="media-title">{title}</h3>
              <p className="media-description">{description}</p>
              <a href={link} className="view-more-btn">
                View More <span className="arrow">&#x203A;</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MediaRoom;
