import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import lineDecor from "../HeadingDesign/HeadingDesign.png";
import noImage from "../assets/no-image.webp";
import { AuthContext } from "../AuthContext";
import CascadingCarousel from "./CascadingCarousel";
import "../css/TemplesCards.css";

const TemplesCards = ({ temples = [] }) => {
  const { auth } = useContext(AuthContext);
  const [brokenImages, setBrokenImages] = useState({});

  const formatLocation = (location) => {
    if (!location) return "";
    const { district, state } = location;
    return [district, state].filter(Boolean).join(", ");
  };

  return (
    <section className="temples" id="temples">
      <div className="temple-section-container">
        <h2 className="temple-heading">Temples</h2>
        <img
          src={lineDecor}
          alt="decorative line"
          className="line-decor-img"
          loading="lazy"
        />

        {temples.length === 0 ? (
          <p>No temples found</p>
        ) : (
          <CascadingCarousel
            items={temples}
            visibleCount={2}
            loop={true}
            activeCardWidth={280}
            activeCardHeight={370}
            nearCardWidth={280}
            nearCardHeight={360}
            cornerCardWidth={280}
            cornerCardHeight={360}
            activeCardWidthMobile={240}
            activeCardHeightMobile={260}
            nearCardWidthMobile={200}
            nearCardHeightMobile={240}
            renderItem={(temple, index, isActive) => {
              // Determine destination based on auth
              const toPath = temple.link || "/notfound";
              return (
                <NavLink
                  to={toPath}
                  className="temple-card"
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    if (!auth?.user && toPath !== "/notfound") {
                      // Redirect unauthenticated users to signup
                      e.preventDefault();
                      window.location.href = "/Mandir-Darshan/signup";
                    }
                  }}
                >
                  <img
                    src={
                      temple.image && temple.image.trim() !== ""
                        ? brokenImages[index]
                          ? noImage
                          : temple.image
                        : noImage
                    }
                    alt={temple.name || "Temple Image"}
                    onError={() =>
                      setBrokenImages((prev) => ({ ...prev, [index]: true }))
                    }
                  />
                  <div className={`temple-overlay ${isActive ? "active" : "hidden"}`}>
                    <h3>{temple.name}</h3>
                    {temple.deity && <p>{temple.deity}</p>}
                    {temple.location && <p>{formatLocation(temple.location)}</p>}
                    {temple.hours && <p className="temple-card-time">🕒 {temple.hours}</p>}
                  </div>
                </NavLink>
              );
            }}
          />
        )}
      </div>
    </section>
  );
};

export default TemplesCards;
