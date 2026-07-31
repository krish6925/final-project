import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homeForRole } from "../components/ProtectedRoute";

export default function Login() {
  const { login, authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await login(form);
      const redirectTo = location.state?.from || homeForRole(data.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-visual">
        <div className="auth-grid" aria-hidden="true" />
        <div className="auth-visual-content">
          <svg className="compass-anim" viewBox="0 0 200 200" width="180" height="180" aria-hidden="true">
            <circle cx="100" cy="100" r="86" className="compass-ring-outer" fill="none" strokeWidth="1" />
            <circle cx="100" cy="100" r="70" className="compass-ring-inner" fill="none" strokeWidth="1" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line
                key={i}
                x1="100"
                y1="14"
                x2="100"
                y2={i % 6 === 0 ? "24" : "19"}
                className="compass-tick"
                transform={`rotate(${i * 15} 100 100)`}
              />
            ))}
            <g className="compass-needle-group">
              <path d="M100 40 L109 100 L100 160 L91 100 Z" className="compass-needle" />
              <circle cx="100" cy="100" r="6" className="compass-pivot" />
            </g>
          </svg>
          <h1>Goal Compass</h1>
          <p>
            Set thrust-area goals, route them for manager review, and keep every quarter's weightage
            accounted for &mdash; from first draft to locked record.
          </p>
        </div>
      </section>

      <section className="auth-form-side">
        <div className="auth-card">
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in to your workspace</h2>
          <p className="auth-subtext">Enter your credentials to reach your dashboard.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="field">
              <span>Email</span>
              <input type="email" required value={form.email} onChange={handleChange("email")} placeholder="you@company.com" />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                required
                value={form.password}
                onChange={handleChange("password")}
                placeholder="••••••••"
              />
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <button type="submit" className="btn btn-primary btn-block" disabled={authLoading}>
              {authLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            New to Goal Compass? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
