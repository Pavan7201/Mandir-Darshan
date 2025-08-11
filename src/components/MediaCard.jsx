import PropTypes from 'prop-types';
import { NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import '../css/MediaCard.css';

const MediaCard = ({ video, title, description, link }) => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (!auth?.user) {
      e.preventDefault();
      navigate('/SignUp');
    }
  };

  return (
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

      <NavLink
        to={MediaData.link}
        className="view-more-btn"
        onClick={handleClick}
      >
        View More <span className="arrow">&#x203A;</span>
      </NavLink>
    </div>
  );
};

MediaCard.propTypes = {
  video: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  link: PropTypes.string,
};

export default MediaCard;
