import { useEffect } from 'react';
import SevasBanner from "../components/SevasBanner";
import Faq from "../components/Faq's";
import { faqData } from "../components/FaqData";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const Sevas = () => {
  useScrollAnimation();
  useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
  return (
    <div>
      <SevasBanner AnimateOnScroll="animate-on-scroll"  fadeup="animate" />
      <hr />
      <Faq AnimateOnScroll="animate-on-scroll" faqs={faqData.slice(0, 3)} />
    </div>
  );
};

export default Sevas;
