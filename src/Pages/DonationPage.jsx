import React from "react";
import SevasBanner from "../components/SevasBanner";
import DonationTypes from "../components/DonationTypes";
import Faq from "../components/Faq's";
import { faqData } from "../components/FaqData";

const DonationPage = () => {
  return (
    <>
      <section>
        <SevasBanner title="Donation" showSevasCard={false} />
      </section>
      <section>
        <DonationTypes />
      </section>
      <Faq faqs={faqData.slice(3,6)} />
    </>
  );
};

export default DonationPage;
