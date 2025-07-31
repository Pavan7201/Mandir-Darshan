import React from 'react';
import MediaRoom from "../components/MediaRoom";
import Faq from "../components/Faq's";
import { faqData } from "../components/FaqData";
import { MediaData } from "../Data/MediaData";
import SevasBanner from "../components/SevasBanner";


const MediaRoomPage = () => {
  return (
    <>
    <section>
        <SevasBanner title="Media Room" showSevasCard={false} />
      </section>
    <section>
        <MediaRoom cardsToShow={MediaData.slice(0, 7)}/>
        <hr/>
        <Faq faqs={faqData.slice(6,9)} />
    </section>
    </>
  )
}

export default MediaRoomPage