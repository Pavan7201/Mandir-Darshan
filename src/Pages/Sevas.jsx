import SevasBanner from "../components/SevasBanner";
import Faq from "../components/Faq's";
import { faqData } from "../components/FaqData";
const Sevas = () => {
  return (
    <div>
      <SevasBanner />
      <hr />
      <Faq faqs={faqData.slice(0, 3)} />
    </div>
  );
};

export default Sevas;
