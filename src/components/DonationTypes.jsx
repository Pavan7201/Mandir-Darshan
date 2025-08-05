import lineDecor from "../HeadingDesign/Design 2.png";
import "../css/DonationTypes.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const DonationTypes = ({AnimateOnScroll=""}) => {
  return (
    <div className="DonationType-conatiner">
      <p className={`${AnimateOnScroll}`}>
        Devotees can donate to AP TEMPLES Temple via online and offline
        payments. Srikanakadurgamma Devasthanam website accepts easy payment
        methods like credit card, debit card and UPI transactions for donations.
      </p>
      <h2 className={`DonationType-heading ${AnimateOnScroll}`}>Types Of Donation</h2>
      <img
        src={lineDecor}
        alt="decorative line"
        className={`line-decor-img ${AnimateOnScroll}`}
        loading="lazy"
      />
      <div className={`searchbar-container ${AnimateOnScroll}`}>
        <span className="searchbar-label">Search Temples</span>
        <input
          className={`searchbar-input ${AnimateOnScroll}`}
          type="text"
          placeholder="Type to search…"
        />
        <button className={`searchbar-button ${AnimateOnScroll}`} type="submit">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      </div>
    </div>
  );
};

export default DonationTypes;
