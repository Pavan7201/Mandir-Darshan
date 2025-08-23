import "../css/banner.css";
import Bannar from "../assets/Banner.webp";

const Banner = ({ className = "" }) => {
  return (
    <>
      <section className={`banner-container ${className}`}>
        <img
          src={Bannar}
          alt="Banner image"
          className="banner-image"
        />
        <div className="banner-caption">
          <h2>Experience the Divine Tranquility</h2>
          <p>
            Explore the sacred temples and embrace the spiritual heritage of
            India.
          </p>
        </div>
      </section>
    </>
  );
};

export default Banner;
