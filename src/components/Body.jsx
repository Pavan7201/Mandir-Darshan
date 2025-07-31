import "../css/body.css";
import Banner from "./banner";
import DevoteServices from "./DevoteServices";
import { templeData } from "../components/TempleData";
import FeaturedTemples from "./FeaturedTemples";
import PhotoGallery from "./PhotoGallery";
import Endowment from "./Endowment";

const Body = () => {
  return (
    <>
      <div className="image">
        {templeData.slice(0, 11).map((temple, index) => (
          <button className="bttn" key={index}>
            <img loading="lazy" src={temple.image} alt={temple.name} />
            <div className="temple-name">{(() => {
    const words = temple.name.trim().split(" ");
    if (words[0].length > 3) {
      return words[0];
    } else if (words[0].length === 3) {
      return `${words[0]} ${words[1]}`;
    } else {
      return words[1];
    }
  })()}</div>
          </button>
        ))}
      </div>
      <hr />
      <div>
        <Banner />
        <FeaturedTemples />
        <hr />
        <DevoteServices />
        <hr />
        <PhotoGallery />
        <hr />
        <Endowment />
      </div>
    </>
  );
};

export default Body;
