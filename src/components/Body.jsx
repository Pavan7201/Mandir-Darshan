import React from "react";
import "../css/body.css";
import Banner from "./banner";

import Kanipakam from "../assets/Kanipakam.jpeg";
import Kalahasti from "../assets/Kalahasti.jpeg";
import Srisailam from "../assets/Srisailam.jpeg";
import Mahanandi from "../assets/Mahanandi.jpeg";
import Kasapuram from "../assets/Kasapuram.jpeg";
import Simhachalam from "../assets/Simhadri.jpeg";
import Annavaram from "../assets/Annavaram.jpeg";
import Tirumala from "../assets/Dwaraka Tirumala.jpeg";
import Durga from "../assets/Durga.jpeg";
import Kanaka from "../assets/Kanaka Mahalakshmi.jpeg";
import Penuganchiprolu from "../assets/Penuganchiprolu.jpeg";

const templeData = [
  { src: Kanipakam, alt: "Kanipakam Vianayaka" },
  { src: Kalahasti, alt: "Sri Kalahasti" },
  { src: Srisailam, alt: "Srisailam" },
  { src: Simhachalam, alt: "Simhachalam" },
  { src: Mahanandi, alt: "Mahanandi" },
  { src: Kasapuram, alt: "Kasapuram" },
  { src: Penuganchiprolu, alt: "Penuganchiprolu" },
  { src: Annavaram, alt: "Annavaram" },
  { src: Tirumala, alt: "Dwaraka Tirumala" },
  { src: Kanaka, alt: "Kanaka Mahalakshmi" },
  { src: Durga, alt: "Vijayawada Durga Amma Thalli" },
];

const Body = () => {
  return (
    <>
      <div className="image">
        {templeData.map((temple, index) => (
          <button className="bttn" key={index}>
            <img src={temple.src} alt={temple.alt} />
          </button>
        ))}
        <hr />
      </div>
      <div>
        <Banner />
      </div>
    </>
  );
};

export default Body;
