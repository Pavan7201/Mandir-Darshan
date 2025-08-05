import { useEffect } from 'react';
import MediaRoom from "../components/MediaRoom";
import Faq from "../components/Faq's";
import { faqData } from "../components/FaqData";
import { MediaData } from "../Data/MediaData";
import SevasBanner from "../components/SevasBanner"
import { useScrollAnimation } from '../hooks/useScrollAnimation';


const MediaRoomPage = () => {
      useScrollAnimation();
  
  useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
  return (
    <>
    <section>
        <SevasBanner AnimateOnScroll="animate-on-scroll" fadeup="animate" title="Media Room" showSevasCard={false} />
      </section>
    <section>
        <MediaRoom AnimateOnScroll="animate-on-scroll" cardsToShow={MediaData.slice(0, 7)}/>
        <hr/>
        <Faq AnimateOnScroll="animate-on-scroll" faqs={faqData.slice(6,9)} />
    </section>
    </>
  )
}

export default MediaRoomPage