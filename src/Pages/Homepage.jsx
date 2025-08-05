import Body from "../components/Body";
import { useEffect } from "react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const Homepage = () => {
  useScrollAnimation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return <Body />;
};

export default Homepage;
