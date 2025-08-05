import { Link } from "react-router-dom";
import "../css/NotFoudPage.css";

function NotFoundPage() {
  return (
    <div className="not-found-container">
      <h1 className="not-found-title">404</h1>
      <p className="not-found-message">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="not-found-link">
        Go back to Home
      </Link>
    </div>
  );
}

export default NotFoundPage;
