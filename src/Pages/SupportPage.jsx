import MediaRoom from "../components/MediaRoom"
import { MediaData } from "../Data/MediaData";
import Faq from "../components/Faq's";
import { faqData } from "../components/FaqData";
import SevasBanner from "../components/SevasBanner";

const SupportPage = () => {
  return (
    <>
    <section>
        <SevasBanner title="Support" showSevasCard={false} />
      </section>
    <section>
      <MediaRoom cardsToShow={MediaData.slice(7)} title="Support" />
      <hr/>
      <Faq faqs={faqData.slice(9)} />
    </section>
    </>
  )
}

export default SupportPage