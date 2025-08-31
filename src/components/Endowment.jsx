import lineDecor from "../HeadingDesign/HeadingDesign.png";
import "../css/Endowment.css";
import "../Animation/Animate.css"
import { useEffect, useRef, useState } from "react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const Endowment = ({className=""}) => {
  const [endowment, setEndowment] = useState([]);
  const sectionRef = useRef(null);
  useScrollAnimation([endowment]);
  const API_BASE_URL =
    import.meta.env.MODE === "production"
      ? "https://mandir-darshan.onrender.com"
      : "http://localhost:4000";

      useEffect(() => {
        const cachedAssets = sessionStorage.getItem("assets");

        if(cachedAssets) {
          const data = JSON.parse(cachedAssets);
          const endowmentCategory = data.find((e) => e.category === "endowment");
          setEndowment(endowmentCategory ? endowmentCategory.items : []);
          return;
        }
        const fetchEndowment = async () => {
          try{
            const res = await fetch(`${API_BASE_URL}/api/assets`);
            const data = await res.json();
            sessionStorage.setItem("assets", JSON.stringify(data));

            const endowmentCategory = data.find((e) => e.category === "endowment");
            setEndowment(endowmentCategory ? endowmentCategory.items : []);

          }catch (err){
            console.error("Error fetching assets:", err);
          }
        };
        fetchEndowment();
      },[API_BASE_URL]);
      
      return (
      <section className="Endowment" id="Endowment" ref={sectionRef}>
        <div className="Endowment-section-container">
          <h2 className={`Endowment-heading ${className}`}>
            Government of Andhra Pradesh - Endowment Department
          </h2>
          <img
            src={lineDecor}
            alt="decorative line"
            className={`line-decor-img ${className}`}
          />
          <div className="card-wrapper">
            {endowment.map((img) => (
              <div className={`profile-card ${className}`} key={img.id}>
                <img className="profile-img" src={img.ImageUrl} alt={img.alt} />
                <h5>{img.name}</h5>
                <p>{img.position}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

export default Endowment;
