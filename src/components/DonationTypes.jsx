import React from "react";
import lineDecor from "../HeadingDesign/Design 2.png";
import "../css/DonationTypes.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const DonationTypes = () => {
  return (
    <div className="DonationType-conatiner">
      <p>
        Devotees can donate to AP TEMPLES Temple via online and offline
        payments. Srikanakadurgamma Devasthanam website accepts easy payment
        methods like credit card, debit card and UPI transactions for donations.
      </p>
      <h2 className="DonationType-heading">Types Of Donation</h2>
      <img
        src={lineDecor}
        alt="decorative line"
        className="line-decor-img"
        loading="lazy"
      />
      <div className="searchbar-container">
        <span className="searchbar-label">Search Temples</span>
        <input
          className="searchbar-input"
          type="text"
          placeholder="Type to search…"
        />
        <button className="searchbar-button" type="submit">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      </div>
    </div>
  );
};

export default DonationTypes;
