import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="auth-grid" aria-hidden="true" />
      <div className="not-found-content fade-in-up">
        <p className="eyebrow">404</p>
        <h1>Off the map</h1>
        <p>This coordinate doesn&rsquo;t exist. Let&rsquo;s get you back on course.</p>
        <Link to="/login" className="btn btn-primary">
          Return to sign in
        </Link>
      </div>
    </div>
  );
}
