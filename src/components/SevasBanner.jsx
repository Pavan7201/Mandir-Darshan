import "../css/SevasBanner.css";
import SevasCard from "./SevasCard";
import bannerImg from "../assets/D3.jpg";

const SevasBanner = ({
  title = "Sevas & Bookings",
  subtitle = "Dharmo Rakshathi Rakshithah",
  showSevasCard = true,
  fadeup="",
  AnimateOnScroll=""
}) => {
  return (
    <>
      <section className="Sevas-banner-section">
          <img
          src={bannerImg}
          alt="Banner"
          className={`banner-bg-img ${fadeup}`}
        />
        <div className="banner-overlay"></div>
          <div className={`SevasBanner-caption ${AnimateOnScroll}`}>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
      </section>
      <div>{showSevasCard && <SevasCard AnimateOnScroll="animate-on-scroll" />}</div>
    </>
  );
};

export default SevasBanner;
