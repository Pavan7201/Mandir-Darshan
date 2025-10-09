import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Gift, BookOpen, Image, MapPin, Globe, RefreshCw } from "lucide-react";
import "../css/TempleDetails.css";
import { TempleDetailsSkeleton } from "../Sekeleton Effect/TempleDetailsSkeleton";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "te", name: "Telugu" },
  { code: "hi", name: "Hindi" },
  { code: "ta", name: "Tamil" },
  { code: "kn", name: "Kannada" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "bn", name: "Bengali" },
];

const normalizeLink = (link) =>
  link ? link.toLowerCase().replace(/^\//, "") : "";

const formatLocation = (location) => {
  if (!location) return "";
  const { district, state } = location;
  return [district, state].filter(Boolean).join(", ");
};

async function getTranslation(textToTranslate, languageCode) {
  const API_URL = "https://script.google.com/macros/s/AKfycbzNyBW6OCHdsppHeWS0I1l0CiEP8OMsRecPsXeYci3K4HT2di4MzLqvvCBw2pvjHiM/exec";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        text: textToTranslate,
        targetLang: languageCode,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Translation Error:", data.error);
      return "Translation failed.";
    }
    return data.translation;
  } catch (error) {
    console.error("API Call Failed:", error);
    return "Could not connect to translation service.";
  }
}

const FlowersBackground = () => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setVisible(false), 3000);
    }, 20000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="temple-flowers-background"
        initial={{ opacity: 1 }}
        animate={{ opacity: fadeOut ? 0 : 1 }}
        transition={{ duration: 3, ease: "easeInOut" }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: "-10vh", x: `${Math.random() * 100}vw`, opacity: 0 }}
            animate={{ y: "350vh", opacity: [1, 0.7, 0.5, 0] }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="temple-flower"
          >
            🏵️
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

const ReadMore = ({ text, maxLength = 200 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const componentRef = useRef(null); 

  const handleToggleClick = () => {

    if (isExpanded) {
    
      const componentTop = componentRef.current.getBoundingClientRect().top;
      
     
      if (componentTop < 0) {
        componentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    
    setIsExpanded(!isExpanded);
  };

  if (!text || text.length <= maxLength) {
    return (
      <motion.div
        key={text}
        initial={{ opacity: 0, y: 8, scale: 0.995, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ type: "spring", stiffness: 120, damping: 18, duration: 0.6 }}
        className={`temple-animated-text ${text ? "temple-glow" : ""}`}
      >
        <p>{text}</p>
      </motion.div>
    );
  }

  const visibleText = isExpanded ? text : `${text.substring(0, maxLength)}...`;

  return (
    <motion.div
      ref={componentRef} 
      key={text + (isExpanded ? "-expanded" : "-collapsed")}
      initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ type: "spring", stiffness: 110, damping: 16, duration: 0.5 }}
      className={`temple-animated-text ${isExpanded ? "temple-glow" : ""}`}
    >
      <p>{visibleText}</p>
      <button
        className="temple-readmore-btn"
        onClick={handleToggleClick} 
      >
        {isExpanded ? "Read Less" : "Read More"}
      </button>
    </motion.div>
  );
};


const TranslationDropdown = ({ onTranslate, onReset, isTranslating, sourceLanguage = "en" }) => {
  const handleSelect = (e) => {
    const langCode = e.target.value;
    if (langCode) {
      onTranslate(langCode);
    }

    e.target.value = ""; 
  };

  return (
    <div className="temple-translation-controls">
      <button onClick={onReset} className="temple-reset-translation-btn" title="Reset to Original">
        <RefreshCw size={16} />
      </button>

      <div className="temple-translation-dropdown-wrapper">
        <motion.div
          className="temple-translation-icon-wrap"
          animate={isTranslating ? { rotate: 360 } : { rotate: 0 }}
          transition={isTranslating ? { repeat: Infinity, duration: 1, ease: "linear" } : { duration: 0.4 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Globe size={16} className={`temple-translation-icon ${isTranslating ? "spinning" : ""}`} />
        </motion.div>

        <select onChange={handleSelect} className="temple-translation-dropdown">
          <option value="">Translate</option>
          {LANGUAGES.filter(lang => lang.code !== sourceLanguage).map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default function TempleDetails() {
  const { templeLink } = useParams();
  const [temple, setTemple] = useState(null);
  const [loading, setLoading] = useState(true);
  const [translatedDeityHistory, setTranslatedDeityHistory] = useState(null);
  const [translatedTempleHistory, setTranslatedTempleHistory] = useState(null);
  const [isTranslatingDeityHistory, setIsTranslatingDeityHistory] = useState(false);
  const [isTranslatingTempleHistory, setIsTranslatingTempleHistory] = useState(false);

  const prevScrollRestoration = useRef();

  const API_BASE_URL =
    import.meta.env.MODE === "production"
      ? "https://mandir-darshan.onrender.com"
      : "http://localhost:4000";

  useLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      prevScrollRestoration.current = history.scrollRestoration;
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    return () => {
      if ("scrollRestoration" in history && prevScrollRestoration.current) {
        history.scrollRestoration = prevScrollRestoration.current;
      }
    };
  }, []);

  useEffect(() => {
    const fetchTemple = async () => {
      setLoading(true);
      setTranslatedDeityHistory(null);
      setTranslatedTempleHistory(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/temples`);
        const data = await res.json();

        const targetLink = normalizeLink(templeLink);
        const foundTemple = data.find((t) => normalizeLink(t.link) === targetLink);

        setTemple(foundTemple || null);
      } catch (err) {
        console.error("Failed to fetch temple:", err);
        setTemple(null);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 3000);
      }
    };
    fetchTemple();
  }, [templeLink, API_BASE_URL]);

  const handleTranslateTempleHistory = async (languageCode) => {
    if (!temple?.history?.temple) return;
    setIsTranslatingTempleHistory(true);
 
    const translation = await getTranslation(temple.history.temple, languageCode);
    setTranslatedTempleHistory(translation);
    setIsTranslatingTempleHistory(false);
  };

  const handleTranslateDeityHistory = async (languageCode) => {
    if (!temple?.history?.deity) return;
    setIsTranslatingDeityHistory(true);
    const translation = await getTranslation(temple.history.deity, languageCode);
    setTranslatedDeityHistory(translation);
    setIsTranslatingDeityHistory(false);
  };

  if (loading) {
    return <TempleDetailsSkeleton />;
  }

  if (!temple) {
    return (
      <div className="temple-details-page">
        <div className="temple-flowers-wrapper">
          <FlowersBackground />
          <main className="temple-main-section">
            <h2>Temple not found</h2>
            <p>The temple you requested could not be found.</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="temple-details-page">
      <div className="temple-flowers-wrapper">
        <FlowersBackground />

        <section
          className="temple-hero-section"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${temple.image || ""}')`,
          }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {temple.name || "Temple Name"}
          </motion.h1>
          {temple.caption && <p>{temple.caption}</p>}
          <motion.button
            className="temple-book-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Book Darshan
          </motion.button>
        </section>

        <main className="temple-main-section">
          {(temple.history?.temple || temple.history?.deity) && (
            <div className="tc temple-card-history">
              {temple.history?.temple && (
                <>
       
                  <div className="temple-section-header">
                    <h2 className="temple-section-title">
                      <BookOpen className="temple-icon" /> Temple History
                    </h2>
                    <TranslationDropdown
                      onTranslate={handleTranslateTempleHistory}
                      onReset={() => setTranslatedTempleHistory(null)}
                      isTranslating={isTranslatingTempleHistory}
                    />
                  </div>
                  <ReadMore text={translatedTempleHistory || temple.history.temple} />
                </>
              )}

              {temple.history?.deity && (
                <>
           
                  <div className="temple-section-header" style={{ marginTop: '2rem' }}>
                    <h2 className="temple-section-title">
                      <BookOpen className="temple-icon" /> Deity History
                    </h2>
                    <TranslationDropdown
                      onTranslate={handleTranslateDeityHistory}
                      onReset={() => setTranslatedDeityHistory(null)}
                      isTranslating={isTranslatingDeityHistory}
                    />
                  </div>
                  <ReadMore text={translatedDeityHistory || temple.history.deity} />
                </>
              )}
            </div>
          )}

          {temple.events?.length > 0 && (
            <section className="temple-section">
              <h2 className="temple-section-title">
                <Calendar className="temple-icon" /> Upcoming Events
              </h2>
              <div className="temple-events-grid">
                {temple.events.map((event, idx) => (
                  <div key={idx} className="temple-event-card">
                    <p className="temple-event-name">{event.name}</p>
                    <p className="temple-event-date">{event.date}</p>
                    <button className="temple-add-calendar-btn">Add to Calendar</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {temple.rituals?.length > 0 && (
            <section className="temple-section">
              <h2 className="temple-section-title">
                <Gift className="temple-icon" /> Prasad & Rituals
              </h2>
              <div className="temple-rituals-grid">
                {temple.rituals.map((ritual, idx) => (
                  <div key={idx} className="temple-ritual-card">
                    {ritual}
                  </div>
                ))}
              </div>
            </section>
          )}

          {temple.gallery?.length > 0 && (
            <section className="temple-section">
              <h2 className="temple-section-title">
                <Image className="temple-icon" /> Gallery
              </h2>
              <div className="temple-gallery-grid">
                {temple.gallery.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Gallery ${idx + 1}`}
                    className="temple-gallery-img"
                  />
                ))}
              </div>
            </section>
          )}

          {temple.location?.mapUrl && (
            <div className="tc temple-card-map">
              <h2 className="temple-section-title">
                <MapPin className="temple-icon" /> Find Us
              </h2>
              <p>{formatLocation(temple.location)}</p>
              <div className="temple-map-wrapper">
                <iframe
                  src={temple.location.mapUrl}
                  title="Temple Location"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              {temple.location.distance && (
                <p>
                  You are{" "}
                  <span className="temple-highlight">{temple.location.distance}</span> away
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}