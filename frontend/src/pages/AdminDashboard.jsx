// src/pages/AdminDashboard.jsx

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import { fetchPendingUsers, approveUserRequest, rejectUserRequest } from "../api/auth";
import { exportAchievementReportRequest } from "../api/goals";

export default function AdminDashboard() {
  const [completionData] = useState({
    goalSettingRate: 0,
    managerApprovalRate: 0,
    quarterlyCheckinRate: 0
  });
  const [auditLogs] = useState([]);
  const [pendingManagers, setPendingManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const loadAdminData = async () => {
    setLoading(true);
    setActionError("");
    try {
      const { data } = await fetchPendingUsers();
      setPendingManagers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading pending managers:", err);
      setActionError("Could not load manager registration approval requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApproveManager = async (managerId) => {
    setActionError("");
    setActionSuccess("");
    try {
      await approveUserRequest(managerId);
      setActionSuccess("Manager approved successfully!");
      setPendingManagers((prev) => prev.filter((m) => (m._id || m.id) !== managerId));
    } catch (err) {
      setActionError(err?.response?.data?.message || "Could not approve manager account.");
    }
  };

  const handleRejectManager = async (managerId) => {
    if (!window.confirm("Are you sure you want to reject and remove this account request?")) {
      return;
    }
    setActionError("");
    setActionSuccess("");
    try {
      await rejectUserRequest(managerId);
      setActionSuccess("Manager request rejected and removed.");
      setPendingManagers((prev) => prev.filter((m) => (m._id || m.id) !== managerId));
    } catch (err) {
      setActionError(err?.response?.data?.message || "Could not reject manager request.");
    }
  };

  const handleExportCSV = async () => {
    setDownloading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await exportAchievementReportRequest();

      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `achievement_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      setActionSuccess("Achievement report CSV exported successfully!");
    } catch (err) {
      console.error("Error exporting achievement report:", err);
      setActionError("Failed to export achievement report.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="dashboard" style={{ padding: "2rem" }}>
        
        {/* 1. HEADER SECTION WITH EXPORT BUTTON */}
        <div 
          className="dashboard-header fade-in-up" 
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "2rem" 
          }}
        >
          <div>
            <p className="eyebrow" style={{ color: "#888", textTransform: "uppercase", fontSize: "0.85rem" }}>
              Governance & Oversight
            </p>
            <h1 style={{ margin: 0, fontSize: "1.75rem" }}>Admin Completion & Audit Portal</h1>
          </div>

          {/* 📥 CSV EXPORT BUTTON */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportCSV}
            disabled={downloading}
            style={{
              padding: "0.6rem 1.2rem",
              backgroundColor: "#0d233a",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 500
            }}
          >
            {downloading ? "Generating CSV…" : "📥 Export Achievement Report (CSV)"}
          </button>
        </div>

        {actionError ? <p className="form-error banner-error" style={{ color: "#d93025", marginBottom: "1rem" }}>{actionError}</p> : null}
        {actionSuccess ? (
          <p
            className="banner-success"
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "6px",
              backgroundColor: "#e6f4ea",
              color: "#137333",
              marginBottom: "1rem"
            }}
          >
            {actionSuccess}
          </p>
        ) : null}

        {loading ? (
          <Loader label="Loading governance logs..." />
        ) : (
          <>
            {/* 2. Completion Metrics */}
            <section className="stat-row fade-in-up">
              <div className="stat-card">
                <span className="stat-value">{completionData?.goalSettingRate || "0"}%</span>
                <span className="stat-label">Goal Sheet Submissions</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{completionData?.managerApprovalRate || "0"}%</span>
                <span className="stat-label">L1 Approvals Done</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{completionData?.quarterlyCheckinRate || "0"}%</span>
                <span className="stat-label">Current Check-ins Logged</span>
              </div>
            </section>

            {/* 3. Pending Registrations */}
            <section style={{ marginTop: "2.5rem" }} className="fade-in-up">
              <h2>Pending Manager & Admin Registration Requests</h2>
              {pendingManagers.length === 0 ? (
                <p className="auth-subtext" style={{ marginTop: "0.5rem" }}>
                  No accounts currently pending approval.
                </p>
              ) : (
                <div className="review-table" style={{ marginTop: "1rem" }}>
                  <div className="review-row review-row-head">
                    <span>Name</span>
                    <span>Email</span>
                    <span>Role</span>
                    <span>Actions</span>
                  </div>
                  {pendingManagers.map((mgr) => (
                    <div className="review-row" key={mgr._id || mgr.id}>
                      <span>{mgr.name}</span>
                      <span>{mgr.email}</span>
                      <span>
                        <span className="role-chip">{mgr.role}</span>
                      </span>
                      <span className="review-actions">
                        <button
                          type="button"
                          className="btn btn-approve btn-small"
                          onClick={() => handleApproveManager(mgr._id || mgr.id)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-reject btn-small"
                          onClick={() => handleRejectManager(mgr._id || mgr.id)}
                        >
                          Reject
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}