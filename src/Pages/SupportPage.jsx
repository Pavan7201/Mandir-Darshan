import { useEffect } from 'react';
import MediaRoom from "../components/MediaRoom"
import { MediaData } from "../Data/MediaData";
import Faq from "../components/Faq's";
import { faqData } from "../components/FaqData";
import SevasBanner from "../components/SevasBanner";
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const SupportPage = () => {
        useScrollAnimation();
  useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
  return (
    <>
    <section>
        <SevasBanner AnimateOnScroll="animate-on-scroll" fadeup="animate" title="Support" showSevasCard={false} />
      </section>
    <section>
      <MediaRoom AnimateOnScroll="animate-on-scroll" cardsToShow={MediaData.slice(7)} title="Support" />
      <hr/>
      <Faq AnimateOnScroll="animate-on-scroll" faqs={faqData.slice(9,12)} />
    </section>
    </>
  )
}

export default SupportPage