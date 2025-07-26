import React from "react";
import lineDecor from "../HeadingDesign/Design 2.png";
import "../css/PhotoGallery.css";
import p1 from "../assets/p1.webp";
import p2 from "../assets/p2.webp";
import p4 from "../assets/p4.webp";
import p5 from "../assets/p5.webp";
import p6 from "../assets/p6.webp";
import p7 from "../assets/p7.webp";
import p8 from "../assets/p8.webp";
import p9 from "../assets/p9.webp";

const images = [
  { src: p1, alt: "picture 1" },
  { src: p2, alt: "picture 2" },
  { src: p4, alt: "picture 4" },
  { src: p5, alt: "picture 5" },
  { src: p6, alt: "picture 6" },
  { src: p7, alt: "picture 7" },
  { src: p8, alt: "picture 8" },
  { src: p9, alt: "picture 9" },
];

const PhotoGallery = () => {
  return (
    <section className="Photo-Gallery" id="Photo-Gallery">
      <div className="Photo-section-container">
        <h2 className="Photo-heading">Photo Galllery</h2>
        <img
          loading="lazy"
          src={lineDecor}
          alt="decorative line"
          className="line-decor-img"
        />
        <div className="Grid-container">
          {images.map((img, index) => {
            return <img key={index} src={img.src} alt={img.alt} />;
          })}
        </div>
      </div>
    </section>
  );
};

export default PhotoGallery;
