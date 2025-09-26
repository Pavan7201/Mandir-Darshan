import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, PlayCircle, Gift, BookOpen, Image, MapPin } from "lucide-react";
import "../css/TempleDetails.css";

const FlowersBackground = () => {
  const flowers = Array.from({ length: 20 });
  return (
    <div className="temple-flowers-background">
      {flowers.map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: "-10vh", x: `${Math.random() * 100}vw`, opacity: 0 }}
          animate={{ y: "110vh", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, delay: i * 0 }}
          className="temple-flower"
        >
          🏵️
        </motion.div>
      ))}
    </div>
  );
};

export default function TempleDetails() {
  const { templeLink } = useParams();
  const [temple, setTemple] = useState(null);
  const [showFullTempleHistory, setShowFullTempleHistory] = useState(false);
  const [showFullDeityHistory, setShowFullDeityHistory] = useState(false);

  const API_BASE_URL =
    import.meta.env.MODE === "production"
      ? "https://mandir-darshan.onrender.com"
      : "http://localhost:4000";

  useEffect(() => {
    const fetchTemple = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/temples`);
        const data = await res.json();

        const normalizeLink = (link) =>
          link ? link.toLowerCase().replace(/^\//, "") : "";

        const targetLink = normalizeLink(templeLink);
        const foundTemple = data.find((t) => normalizeLink(t.link) === targetLink);

        setTemple(foundTemple || null);
      } catch (err) {
        console.error("Failed to fetch temple:", err);
        setTemple(null);
      }
    };
    fetchTemple();
  }, [templeLink, API_BASE_URL]);

  if (!temple) return <p>Temple details not available</p>;

  const formatLocation = (location) => {
    if (!location) return "";
    const { district, state } = location;
    return [district, state].filter(Boolean).join(", ");
  };

  return (
    <div className="temple-details-page">
      <FlowersBackground />

      <section
        className="temple-hero-section"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${temple.image || ""}')` }}
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
                <h2 className="temple-section-title">
                  <BookOpen className="temple-icon" /> Temple History
                </h2>
                <p>
                  {showFullTempleHistory
                    ? temple.history.temple
                    : temple.history.temple.substring(0, 200) + "..."}
                </p>
                {temple.history.temple.length > 200 && (
                  <button
                    className="temple-readmore-btn"
                    onClick={() => setShowFullTempleHistory(!showFullTempleHistory)}
                  >
                    {showFullTempleHistory ? "Read Less" : "Read More"}
                  </button>
                )}
              </>
            )}

            {temple.history?.deity && (
              <>
                <h2 className="temple-section-title">Deity History</h2>
                <p>
                  {showFullDeityHistory
                    ? temple.history.deity
                    : temple.history.deity.substring(0, 200) + "..."}
                </p>
                {temple.history.deity.length > 200 && (
                  <button
                    className="temple-readmore-btn"
                    onClick={() => setShowFullDeityHistory(!showFullDeityHistory)}
                  >
                    {showFullDeityHistory ? "Read Less" : "Read More"}
                  </button>
                )}
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
                  <p>{ritual}</p>
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
                <img key={idx} src={img} alt={`Gallery ${idx}`} className="temple-gallery-img" />
              ))}
            </div>
          </section>
        )}

        {temple.location?.mapUrl && (
          <div className="tc temple-card-map">
            <h2 className="temple-section-title">
              <MapPin className="temple-icon" /> Find Us
            </h2>
            <div className="temple-map-wrapper">
              <iframe
                src={temple.location.mapUrl}
                title="Temple Location"
                allowFullScreen
                frameBorder="0"
              ></iframe>
            </div>
            {temple.location.distance && (
              <p>
                You are <span className="temple-highlight">{temple.location.distance}</span> away
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}