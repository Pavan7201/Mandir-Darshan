import "../css/SevasCards.css";
import lineDecor from "../HeadingDesign/Design 2.png";
import p1 from "../assets/p1.webp";
import p3 from "../assets/p3.png";
import p4 from "../assets/p4.webp";
import { NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';

const sevas = [
  {
    title: "Darshanam",
    image: p1,
    caption:
      "An auspicious first glance at the divinity in the temple is called Darshanam. A darshanam allows devotees to transcend into a peaceful moment.",
    link: "/NotFound",
    },
  {
    title: "Pratyaksha Seva",
    image: p3,
    caption:
      "Pratyaksha Seva is performing/attending Temple Sevas in Person. One may book a Pratyaksha Seva online and offline.",
    link: "/NotFound",
  },
  {
    title: "Paroksha Seva",
    image: p4,
    caption:
      "Paroksha Seva is for those who can not visit the temple in person and wish to perform/attend Temple Sevas digitally. One may book a Paroksha Seva online.",
    link: "/NotFound",
  },
];

const SevasCard = ({AnimateOnScroll=""}) => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleClick = (e, targetLink) => {
  if (!auth?.user) {
    e.preventDefault();
    navigate('/SignUp');
  } else {
    navigate(targetLink);
  }
};
  return (
    <section className="sevas-section">
      <div className="sevas-heading-overlay"></div>
      <h2 className={`sevas-heading ${AnimateOnScroll}`}>Sevas & Booking</h2>
      <img
        src={lineDecor}
        alt="decorative line"
        className={`line-decor-img ${AnimateOnScroll}`}
        loading="lazy"
      />
      <div className={`sevas-cards-container ${AnimateOnScroll}`}>
        {sevas.map((seva, idx) => (
          <div className="seva-card" key={idx}>
            <img src={seva.image} alt={seva.title} className="seva-card-img" />
            <h3 className={`seva-card-title ${AnimateOnScroll}`}>{seva.title}</h3>
            <p className={`seva-card-caption ${AnimateOnScroll}`}>{seva.caption}</p>
            <div className={`seva-card-actions ${AnimateOnScroll}`}>
              <NavLink to={seva.link} onClick={(e) => handleClick(e, seva.link)} className={`view-more-btn ${AnimateOnScroll}`}>
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
