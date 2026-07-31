import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { fetchProfile } from "../api/auth";

function initialsOf(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function Profile() {
  const { user, updateStoredUser } = useAuth();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    fetchProfile()
      .then(({ data }) => {
        if (!isMounted) return;
        setProfile(data);
        updateStoredUser({
          name: data.name,
          email: data.email,
          role: data.role,
          isApproved: data.isApproved
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.response?.data?.message || "Could not load your profile details.");
      })
      .finally(() => isMounted && setLoading(false));
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const joined = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : null;

  return (
    <div className="app-shell">
      <Navbar />
      <main className="dashboard">
        <div className="dashboard-header fade-in-up">
          <div>
            <p className="eyebrow">Account</p>
            <h1>Your profile</h1>
          </div>
        </div>

        {loading ? (
          <Loader label="Loading profile…" />
        ) : (
          <section className="profile-card fade-in-up">
            <span className="corner corner-tl" />
            <span className="corner corner-tr" />
            <span className="corner corner-bl" />
            <span className="corner corner-br" />

            <div className="profile-avatar">{initialsOf(profile?.name)}</div>

            <div className="profile-details">
              <h2>{profile?.name}</h2>
              <p className="profile-email">{profile?.email}</p>
              
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "8px" }}>
                <span className="role-chip role-chip-lg">{profile?.role}</span>
                <span
                  className="role-chip"
                  style={{
                    backgroundColor: profile?.isApproved !== false ? "var(--accent-approved-bg, #e6f4ea)" : "var(--accent-pending-bg, #fef7e0)",
                    color: profile?.isApproved !== false ? "var(--accent-approved, #137333)" : "var(--accent-pending, #b06000)",
                    border: "1px solid currentColor"
                  }}
                >
                  {profile?.isApproved !== false ? "Active / Approved" : "Pending Approval"}
                </span>
              </div>

              {error ? <p className="form-error" style={{ marginTop: "12px" }}>{error}</p> : null}

              <dl className="profile-meta" style={{ marginTop: "16px" }}>
                {joined ? (
                  <div>
                    <dt>Member since</dt>
                    <dd>{joined}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Account role</dt>
                  <dd className="capitalize">{profile?.role}</dd>
                </div>
                <div>
                  <dt>Database Approval Status</dt>
                  <dd>{profile?.isApproved !== false ? "Approved" : "Awaiting Admin Review"}</dd>
                </div>
              </dl>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
