import Lottie from "lottie-react";
import templeAnimation from "../loader/Ankorbhat mandir.json";
import "../css/TempleLoader.css";

const TempleLoader = () => {
  return (
    <div className="loader-wrapper">
      <Lottie 
        animationData={templeAnimation} 
        loop={true} 
        style={{ width: 200, height: 200 }} 
      />
      <p style={{ marginTop: "1rem", fontFamily: "serif", fontSize: "1rem", color: "#555" }}>
        Loading sacred content...
      </p>
    </div>
  );
};

export default TempleLoader;
