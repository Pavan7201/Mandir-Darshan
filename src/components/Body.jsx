import "../css/body.css";
import Banner from "./banner";
import DevoteServices from "./DevoteServices";
import FeaturedTemples from "./FeaturedTemples";
import PhotoGallery from "./PhotoGallery";
import Endowment from "./Endowment";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

const Body = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [temples, setTemples] = useState([]);

  const API_BASE_URL =
    import.meta.env.MODE === "production"
      ? "https://mandir-darshan.onrender.com"
      : "http://localhost:4000";

  useEffect(() => {
    const cachedAssets = sessionStorage.getItem("assets");

    if (cachedAssets) {
      const data = JSON.parse(cachedAssets);
      const templeCategory = data.find((t) => t.category === "temple");
      setTemples(templeCategory ? templeCategory.items : []);
      return;
    }

    const fetchTemples = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/assets`);
        const data = await res.json();

        sessionStorage.setItem("assets", JSON.stringify(data));

        const templeCategory = data.find((t) => t.category === "temple");
        setTemples(templeCategory ? templeCategory.items : []);
      } catch (err) {
        console.error("Error fetching assets:", err);
      }
    };

    fetchTemples();
  }, [API_BASE_URL]);

  const handleClick = (TempleLink) => {
    if (!user) {
      navigate("/signup");
    } else {
      navigate(TempleLink);
    }
  };

  return (
    <>
      <section className="section animate-on-scroll">
        {temples.map((temple, index) => (
          <button
            className="bttn"
            key={temple.id || index}
            onClick={() => handleClick(temple.link)}
          >
            <img src={temple.image} alt={temple.name} />
            <div className="temple-name">
              {(() => {
                const words = temple.name.trim().split(" ");
                if (words[0].length > 3) {
                  return words[0];
                } else if (words[0].length === 3) {
                  return `${words[0]} ${words[1]}`;
                } else {
                  return words[1];
                }
              })()}
            </div>
          </button>
        ))}
      </section>
      <hr className="animate-on-scroll" />
      <div>
        <Banner className="animate-on-scroll" />
        <FeaturedTemples className="animate-on-scroll" />
        <hr />
        <DevoteServices className="animate-on-scroll" />
        <hr />
        <PhotoGallery className="animate-on-scroll" />
        <hr />
        <Endowment className="animate-on-scroll" />
      </div>
    </>
  );
};

export default Body;
