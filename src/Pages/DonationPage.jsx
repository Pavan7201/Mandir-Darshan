import { useEffect } from 'react';
import SevasBanner from "../components/SevasBanner";
import DonationTypes from "../components/DonationTypes";
import Faq from "../components/Faq's";
import { faqData } from "../components/FaqData";
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const DonationPage = () => {
    useScrollAnimation();
  useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
  return (
    <>
      <section>
        <SevasBanner AnimateOnScroll="animate-on-scroll" fadeup="animate" title="Donation" showSevasCard={false} />
      </section>
      <section>
        <DonationTypes AnimateOnScroll="animate-on-scroll" />
      </section>
      <Faq AnimateOnScroll="animate-on-scroll" faqs={faqData.slice(3,6)} />
    </>
  );
};

export default DonationPage;
