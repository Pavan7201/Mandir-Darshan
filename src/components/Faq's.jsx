import React, { useState, useRef } from "react";
import "../css/Faq's.css";
import lineDecor from "../HeadingDesign/Design 2.png";

const Faq = ({ faqs = [] }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const faqRefs = useRef([]);

  const toggleFaq = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null);
      if (faqRefs.current[index]) {
        faqRefs.current[index].blur();
      }
    } else {
      setActiveIndex(index);
      if (faqRefs.current[index]) {
        faqRefs.current[index].focus();
      }
    }
  };

  return (
    <section className="faq-section">
      <h2 className="faq-heading">FAQ's</h2>
      <img
        src={lineDecor}
        alt="decorative line"
        className="line-decor"
        loading="lazy"
      />
      <div className="faq-container">
        {faqs.map((item, index) => (
          <div className="faq-item" key={index}>
            <div
              className="faq-question"
              ref={(el) => (faqRefs.current[index] = el)}
              tabIndex={0}
              onClick={() => toggleFaq(index)}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleFaq(index);
              }}
            >
              <div className="faq-number-circle">{index + 1}</div>
              <span className="faq-question-text">{item.question}</span>
              <span className="faq-icon">
                {activeIndex === index ? "−" : "+"}
              </span>
            </div>

            {activeIndex === index && (
              <div className="faq-answer">
                <span className="faq-answer-label">Ans:</span> {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Faq;
