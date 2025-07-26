import "../css/SevasBanner.css";
import SevasCard from "./SevasCard";

const SevasBanner = ({
  title = "Sevas & Darshanam",
  subtitle = "Dharmo Rakshathi Rakshithah",
  showSevasCard = true,
}) => {
  return (
    <>
      <section className="Sevas-banner-section">
        <div className="SevasBanner-container">
          <div className="SevasBanner-caption">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>
      </section>
      <div>{showSevasCard && <SevasCard />}</div>
    </>
  );
};

export default SevasBanner;
