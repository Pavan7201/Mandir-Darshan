import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import lightAnimation from "../loader/Under Construction Light.json";
import darkAnimation from "../loader/Under Construction Dark.json";
import "../css/NotFoudPage.css";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";

function UnderConstruction() {
  const { theme } = useContext(ThemeContext);

  return (
    <div className="under-construction-container">
      <Lottie 
        animationData={theme === "dark" ? darkAnimation : lightAnimation} 
        loop={true} 
        className="under-construction-animation"
      />
    </div>
  );
}

export default UnderConstruction;
