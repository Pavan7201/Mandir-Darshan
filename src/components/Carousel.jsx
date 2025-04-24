import React, { useRef, useState, useEffect } from "react";
import "../css/carousel.css";
import templeData from "../components/TempleData";

const Carousel = () => {
  const containerReference = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(5); 

  const scrollToIndex = (index) => {
    const container = containerReference.current;
    if (container) {
      const slideWidth = container.offsetWidth / 3; 
      container.scrollTo({
        left: (index - 1) * slideWidth,
        behavior: "smooth",
      });
    }
  };

  const handleLeft = () => {
    setCurrentIndex((prev) => (prev === 0 ? templeData.length - 1 : prev - 1));
  };

  const handleRight = () => {
    setCurrentIndex((prev) => (prev === templeData.length - 1 ? 0 : prev + 1)); 
  };

  useEffect(() => {
    scrollToIndex(currentIndex);
  }, [currentIndex]);

  return (
    <div className="carousel-wrapper">
      <button className="arrow left" onClick={handleLeft}>
        ❮
      </button>

      <div className="carousel-container" ref={containerReference}>
        {templeData.map((temple, index) => (
          <div
            className={`carousel-slide ${
              index === currentIndex ? "active" : ""
            }`}
            key={index}
          >
            <img
              src={temple.image}
              alt={temple.name}
              className="carousel-image"
            />
            <div className="carousel-caption">
              <h3>{temple.name}</h3>
              <p>{temple.caption}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="arrow right" onClick={handleRight}>
        ❯
      </button>
    </div>
  );
};

export default Carousel;
