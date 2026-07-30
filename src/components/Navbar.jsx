import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homeForRole } from "./ProtectedRoute";

function initialsOf(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      <Link to={homeForRole(user?.role)} className="navbar-brand">
        <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
          <circle cx="13" cy="13" r="11.5" className="brand-ring" fill="none" strokeWidth="1.5" />
          <path d="M13 5.5 L16 13 L13 20.5 L10 13 Z" className="brand-needle" />
        </svg>
        <span>Goal Compass</span>
      </Link>

      <nav className="navbar-links">
        <Link to={homeForRole(user?.role)}>Dashboard</Link>
        <Link to="/profile">Profile</Link>
      </nav>

      <div className="navbar-user">
        <span className="role-chip">{user?.role}</span>
        <div className="avatar" title={user?.name}>
          {initialsOf(user?.name)}
        </div>
        <button type="button" className="btn btn-ghost" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </header>
  );
}
