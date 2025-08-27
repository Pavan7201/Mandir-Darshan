import { useContext, useEffect, useState } from "react";
import Lottie from "lottie-react";
import templeAnimation from "../loader/Ankorbhat mandir.json";
import "../css/TempleLoader.css";
import { AuthContext } from "../AuthContext";

const TempleLoader = () => {
  const { user, loadMode } = useContext(AuthContext);
  const [animateOut, setAnimateOut] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const firstName = user?.firstName || storedUser?.firstName;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateOut(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="loader-wrapper">
      <Lottie
        animationData={templeAnimation}
        loop={true}
        style={{ width: 200, height: 200 }}
      />

      {/* Show welcome message ONLY when authenticating (login/signup) */}
      {loadMode === "authenticating" && firstName && (
        <p className={`loader-welcome ${animateOut ? "zoom-out" : ""}`}>
          🙏 Welcome {firstName}!
        </p>
      )}

      {/* Loader text changes based on mode */}
      <p className={`loader-text ${animateOut ? "zoom-out" : ""}`}>
        {loadMode === "reloading"
          ? "Reloading..."
          : "Loading sacred content..."}
      </p>
    </div>
  );
};

export default TempleLoader;
