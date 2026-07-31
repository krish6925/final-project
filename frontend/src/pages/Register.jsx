import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homeForRole } from "../components/ProtectedRoute";

export default function Register() {
  const { register, authLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "employee" });
  const [error, setError] = useState("");
  const [approvalPendingRole, setApprovalPendingRole] = useState(null);

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setApprovalPendingRole(null);

    try {
      const data = await register(form);

      // 🛑 Explicit Gate: If registering as Manager or Admin, block navigation!
      if (form.role === "manager" || form.role === "admin" || data?.isApproved === false) {
        setApprovalPendingRole(form.role);
        return; // Exits function here — DOES NOT NAVIGATE
      }

      // Only Employees navigate directly to dashboard
      navigate(homeForRole(data.role), { replace: true });
    } catch (err) {
      setError(err?.message || "Could not complete registration.");
    }
  };

  // Render Approval Screen for Manager or Admin
  if (approvalPendingRole) {
    const roleTitle = approvalPendingRole === "admin" ? "Admin" : "Manager";
    return (
      <div className="auth-shell">
        <div className="auth-card" style={{ maxWidth: "480px", margin: "2rem auto", textAlign: "center" }}>
          <p className="eyebrow">Registration Submitted</p>
          <h2>{roleTitle} Approval Pending</h2>
          <p className="auth-subtext" style={{ marginTop: "1rem" }}>
            Your request for a <strong>{roleTitle}</strong> account has been created in the database. An administrator must approve your account before you can log in.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ marginTop: "1.5rem", display: "inline-block" }}>
            Return to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell auth-shell-reverse">
      <section className="auth-form-side">
        <div className="auth-card">
          <p className="eyebrow">Get started</p>
          <h2>Create your account</h2>
          <p className="auth-subtext">Set up goals as an employee, or request access as a manager or admin.</p>

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
                <button
                  type="button"
                  className={form.role === "admin" ? "role-option role-option-active" : "role-option"}
                  onClick={() => setForm((prev) => ({ ...prev, role: "admin" }))}
                >
                  Admin
                </button>
              </div>
              <p className="field-hint field-hint-block">
                {form.role === "employee"
                  ? "Employees receive instant workspace access upon registration."
                  : `${form.role.charAt(0).toUpperCase() + form.role.slice(1)} requests require manual admin approval before sign-in.`}
              </p>
            </div>

            {error ? <p className="form-error">{error}</p> : null}

            <button type="submit" className="btn btn-primary btn-block" disabled={authLoading}>
              {authLoading ? "Submitting request…" : "Create account"}
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
          <h1>Plan the quarter</h1>
          <p>
            Every goal carries a thrust area, a measurable target and a weightage &mdash; so review cycles stay quick.
          </p>
        </div>
      </section>
    </div>
  );
}
