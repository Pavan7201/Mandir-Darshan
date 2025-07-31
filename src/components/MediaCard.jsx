import PropTypes from 'prop-types';

const MediaCard = ({ video, title, description, link }) => (
  <div className="media-card">
    <video
      className="media-video"
      src={video}
      autoPlay
      loop
      muted
      playsInline
    />
    <h3 className="media-title">{title}</h3>
    <p className="media-description">{description}</p>
    <a href={link || '#'} className="view-more-btn">
      View More <span className="arrow">&#x203A;</span>
    </a>
  </div>
);

MediaCard.propTypes = {
  video: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  link: PropTypes.string,
};

export default MediaCard;
