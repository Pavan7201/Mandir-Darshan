import { useState, useRef } from "react";
import "../css/Faq's.css";
import lineDecor from "../HeadingDesign/HeadingDesign.png";

const Faq = ({ faqs = [], AnimateOnScroll = "" }) => {
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
        faqRefs.current[index].focus({ preventScroll: true });
      }
    }
  };

  return (
    <section className="faq-section">
      <h2 className={`faq-heading ${AnimateOnScroll}`}>FAQ's</h2>
      <img
        src={lineDecor}
        alt="decorative line"
        className={`line-decor-img ${AnimateOnScroll}`}
      />
      <div className="faq-container">
        {faqs.map((item, index) => {
          const isMultiStep = item.answer.includes("\n");

          return (
            <div className={`faq-item ${AnimateOnScroll}`} key={index}>
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
                <span className="faq-icon">{activeIndex === index ? "−" : "+"}</span>
              </div>

              {activeIndex === index && (
                <div className="faq-answer">
                  <span className="faq-answer-label">Ans:</span>
                  {isMultiStep ? (
                    <ol>
                      {item.answer.split("\n").map((line, idx) => {
                        const trimmedLine = line.trim();
                        if (!trimmedLine) return null;
                        return (
                          <li key={idx}>
                            {trimmedLine.replace(/^\d+\.\s*/, "")}
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <span className="faq-answer-text">{item.answer}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Faq;
