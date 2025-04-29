import React from "react";
import "../css/body.css";
import Banner from "./banner";
import DevoteServices from "./DevoteServices";
import { templeData } from "../components/TempleData";
import FeaturedTemples from "./FeaturedTemples";

const Body = () => {
  return (
    <>
      <div className="image">
        {templeData.slice(0, 11).map((temple, index) => (
          <button className="bttn" key={index}>
            <img loading="lazy" src={temple.image} alt={temple.name} />
            <div className="temple-name">{temple.name}</div>
          </button>
        ))}
        <hr />
      </div>
      <div>
        <Banner />
        <hr />
        <FeaturedTemples />
        <DevoteServices />
      </div>
    </>
  );
};

export default Body;
