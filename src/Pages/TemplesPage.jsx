import { useScrollAnimation } from "../hooks/useScrollAnimation";
import TemplePageBanner from "../components/TemplePageBanner";
import "../Animation/Animate.css"

const TemplesPage = () => {
  useScrollAnimation();
  return (
    <div>
      <TemplePageBanner />
    </div>
  );
};

export default TemplesPage;
