import lineDecor from "../HeadingDesign/HeadingDesign.png";
import "../css/PhotoGallery.css";
import galleryImg1 from "../assets/galleryImg1.webp";
import galleryImg2 from "../assets/galleryImg2.webp";
import galleryImg3 from "../assets/galleryImg3.webp";
import galleryImg4 from "../assets/galleryImg4.webp";
import galleryImg5 from "../assets/galleryImg5.webp";
import galleryImg6 from "../assets/galleryImg6.webp";
import galleryImg7 from "../assets/galleryImg7.webp";
import galleryImg8 from "../assets/galleryImg8.webp";

const images = [
  { src: galleryImg1, alt: "picture 1" },
  { src: galleryImg2, alt: "picture 2" },
  { src: galleryImg3, alt: "picture 3" },
  { src: galleryImg4, alt: "picture 4" },
  { src: galleryImg5, alt: "picture 5" },
  { src: galleryImg6, alt: "picture 6" },
  { src: galleryImg7, alt: "picture 7" },
  { src: galleryImg8, alt: "picture 8" },
];

const PhotoGallery = ({className=""}) => {
  return (
    <section className="Photo-Gallery" id="Photo-Gallery">
      <div className="Photo-section-container">
        <h2 className={`Photo-heading ${className}`}>Photo Gallery</h2>
        <img
          src={lineDecor}
          alt="decorative line"
          className={`line-decor-img ${className}`}
        />
        <div className="Grid-container">
          {images.map((img, index) => {
            return <img className={`${className}`} key={index} src={img.src} alt={img.alt} />;
          })}
        </div>
      </div>
    </section>
  );
};

export default PhotoGallery;
