import "../css/SevasCards.css";
import lineDecor from "../HeadingDesign/HeadingDesign.png";
import { NavLink, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../AuthContext';
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const SevasCard = ({AnimateOnScroll=""}) => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sevas, setSevas] = useState([]);
  const sectionRef = useRef(null);
  useScrollAnimation([sectionRef]);
  const API_BASE_URL =
    import.meta.env.MODE === "production"
      ? "https://mandir-darshan.onrender.com"
      : "http://localhost:4000";
  
      useEffect(() => {
        const cachedAssets = sessionStorage.getItem("assets");

        if(cachedAssets) {
          const data = JSON.parse(cachedAssets);
    console.log("Fetched data:", data);
          const sevasCategory = data.find((s) => s.category === "sevas");
    console.log("Sevas category:", sevasCategory);

          setSevas(sevasCategory ? sevasCategory.items : []);
          return;
        }
      
        const fetchSevas = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/assets`);
    const data = await res.json();
    console.log("Fetched data:", data);
    sessionStorage.setItem("assets", JSON.stringify(data));
    const sevasCategory = data.find((s) => s.category === "sevas");
    console.log("Sevas category:", sevasCategory);
    setSevas(sevasCategory ? sevasCategory.items : []);
  } catch (err) {
    console.error("Error fetching assets:", err);
  }
};

      fetchSevas();
    },[API_BASE_URL]);

    const handleClick = (e, targetLink) => {
    if (!auth?.user) {
      e.preventDefault();
      navigate('/SignUp');
    } else {
      navigate(targetLink);
    }
  };

  return (
    <section className="sevas-section" ref={sectionRef}>
      <div className="sevas-heading-overlay"></div>
      <h2 className={`sevas-heading ${AnimateOnScroll}`}>Sevas & Booking</h2>
      <img
        src={lineDecor}
        alt="decorative line"
        className={`line-decor-img ${AnimateOnScroll}`}
      />
      <div className={`sevas-cards-container ${AnimateOnScroll}`}>
        {sevas.map((seva) =>(
          <div className="seva-card" key={seva.id}>
            {console.log(seva)}
            <img src={seva.ImageUrl} alt={seva.alt} className="seva-card-img" />
            <h3 className={`seva-card-title `}>{seva.title}</h3>
            <p className={`seva-card-caption `}>{seva.caption}</p>
            <div className={`seva-card-actions`}>
              <NavLink to={seva.link} onClick={(e) => handleClick(e, seva.link)} className={`view-more-btn `}>
                View More <span className="arrow">&#x203A;</span>
              </NavLink>
              <button onClick={(e) => handleClick(e, seva.link)} className="Book-Now-btn">
                <span>Book Now</span>
                <span className="arrow">&#8594;</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SevasCard;
