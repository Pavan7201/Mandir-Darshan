import { Calendar, Gift, BookOpen, Image, MapPin } from "lucide-react";
import "../css/TempleDetails.css"; 

export const TempleDetailsSkeleton = () => {
  return (
    <div className="temple-details-page">
      <div className="temple-flowers-wrapper">
        <section className="temple-hero-section skeleton">
            <div className='skeleton skeleton-hero-title'></div>
            <div className='skeleton skeleton-hero-caption'></div>
            <div className='skeleton skeleton-hero-button'></div>
        </section>

        <main className="temple-main-section">
          <div className="tc temple-card-history">
            <h2 className="temple-section-title">
              <BookOpen className="temple-icon" />
              <div className="skeleton skeleton-title"></div>
            </h2>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
          </div>

          <section className="temple-section">
            <h2 className="temple-section-title">
              <Calendar className="temple-icon" />
              <div className="skeleton skeleton-title"></div>
            </h2>
            <div className="temple-events-grid">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="temple-event-card skeleton-card">
                  <div className="skeleton skeleton-text" style={{ width: '60%', marginBottom: '1rem' }}></div>
                  <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: '1.5rem' }}></div>
                  <div className="skeleton skeleton-button-small"></div>
                </div>
              ))}
            </div>
          </section>

          <section className="temple-section">
            <h2 className="temple-section-title">
              <Gift className="temple-icon" />
              <div className="skeleton skeleton-title"></div>
            </h2>
            <div className="temple-rituals-grid">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="skeleton skeleton-ritual-chip"></div>
              ))}
            </div>
          </section>
          
          <section className="temple-section">
            <h2 className="temple-section-title">
              <Image className="temple-icon" />
              <div className="skeleton skeleton-title"></div>
            </h2>
            <div className="temple-gallery-grid">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="skeleton skeleton-gallery-img"></div>
              ))}
            </div>
          </section>
          
          <div className="tc temple-card-map">
            <h2 className="temple-section-title">
              <MapPin className="temple-icon" />
              <div className="skeleton skeleton-title"></div>
            </h2>
            <div className="skeleton skeleton-map"></div>
          </div>
        </main>
      </div>
    </div>
  );
};