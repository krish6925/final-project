import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homeForRole } from "../components/ProtectedRoute";

export default function Register() {
  const { register, authLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "employee" });
  const [error, setError] = useState("");

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await register(form);
      navigate(homeForRole(data.role), { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-shell auth-shell-reverse">
      <section className="auth-form-side">
        <div className="auth-card">
          <p className="eyebrow">Get started</p>
          <h2>Create your account</h2>
          <p className="auth-subtext">Set up goals as an employee, or review and approve them as a manager.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="field">
              <span>Full name</span>
              <input required value={form.name} onChange={handleChange("name")} placeholder="Jordan Blake" />
            </label>

            <label className="field">
              <span>Email</span>
              <input type="email" required value={form.email} onChange={handleChange("email")} placeholder="you@company.com" />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={handleChange("password")}
                placeholder="At least 6 characters"
              />
            </label>

            <div className="field">
              <span>I am joining as</span>
              <div className="role-toggle">
                <button
                  type="button"
                  className={form.role === "employee" ? "role-option role-option-active" : "role-option"}
                  onClick={() => setForm((prev) => ({ ...prev, role: "employee" }))}
                >
                  Employee
                </button>
                <button
                  type="button"
                  className={form.role === "manager" ? "role-option role-option-active" : "role-option"}
                  onClick={() => setForm((prev) => ({ ...prev, role: "manager" }))}
                >
                  Manager
                </button>
              </div>
              <p className="field-hint field-hint-block">Admin accounts are provisioned separately by IT.</p>
            </div>

            {error ? <p className="form-error">{error}</p> : null}

            <button type="submit" className="btn btn-primary btn-block" disabled={authLoading}>
              {authLoading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have a workspace? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>

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
          <h1>Plan the quarter</h1>
          <p>
            Every goal carries a thrust area, a measurable target and a weightage &mdash; so review
            cycles stay quick and every commitment is accounted for.
          </p>
        </div>
      </section>
    </div>
  );
}
