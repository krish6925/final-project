import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import GoalFormModal from "../components/GoalFormModal";
import { useAuth } from "../context/AuthContext";
import {
  fetchAllGoals,
  approveGoalRequest,
  rejectGoalRequest,
  reworkGoalRequest,
  lockGoalRequest,
  managerUpdateGoalRequest,
  pushSharedGoalRequest,
  logCheckinRequest
} from "../api/goals";

const FILTERS = ["all", "pending", "approved", "rework", "rejected", "locked"];

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actioningId, setActioningId] = useState(null);
  const [actionError, setActionError] = useState("");

  const [editingGoal, setEditingGoal] = useState(null);
  const [checkinGoal, setCheckinGoal] = useState(null);
  const [checkinComment, setCheckinComment] = useState("");
  const [sharedModalOpen, setSharedModalOpen] = useState(false);

  const loadGoals = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const { data } = await fetchAllGoals();
      setGoals(data);
    } catch (err) {
      setLoadError(err?.response?.data?.message || "Could not load organization goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  // Extract unique team members for the recipient dropdown
  const teamMembers = useMemo(() => {
    const map = new Map();
    goals.forEach((g) => {
      if (g.employee?._id) {
        map.set(g.employee._id, g.employee);
      }
    });
    return Array.from(map.values());
  }, [goals]);

  const stats = useMemo(
    () => ({
      total: goals.length,
      pending: goals.filter((g) => g.status === "pending").length,
      approved: goals.filter((g) => g.status === "approved").length,
      rework: goals.filter((g) => g.status === "rework" || g.status === "rejected").length,
      locked: goals.filter((g) => g.status === "locked").length
    }),
    [goals]
  );

  const visibleGoals = useMemo(() => {
    return goals.filter((g) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "rework"
          ? g.status === "rework" || g.status === "rejected"
          : g.status === filter;
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        g.employee?.name?.toLowerCase().includes(term) ||
        g.employee?.email?.toLowerCase().includes(term) ||
        g.title?.toLowerCase().includes(term) ||
        g.thrustarea?.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [goals, filter, search]);

  const runAction = async (goal, action) => {
    setActioningId(goal._id);
    setActionError("");
    try {
      let data;
      if (action === "approve") ({ data } = await approveGoalRequest(goal._id));
      if (action === "reject") ({ data } = await rejectGoalRequest(goal._id));
      if (action === "rework") ({ data } = await reworkGoalRequest(goal._id));
      if (action === "lock") ({ data } = await lockGoalRequest(goal._id));

      const updatedGoal = data?.goal || data;
      setGoals((prev) => prev.map((g) => (g._id === goal._id ? { ...g, ...updatedGoal } : g)));
    } catch (err) {
      setActionError(err?.response?.data?.message || "That action could not be completed.");
    } finally {
      setActioningId(null);
    }
  };

  // Manager Inline Edit Handler with Sheet Weightage Safeguard
  const handleSaveInlineEdit = async (values) => {
    if (!editingGoal) return;
    setActioningId(editingGoal._id);
    setActionError("");

    // Calculate updated employee sheet total
    const empGoals = goals.filter((g) => g.employee?._id === editingGoal.employee?._id);
    const newSheetTotal = empGoals.reduce(
      (sum, g) => sum + (g._id === editingGoal._id ? Number(values.weightage) : Number(g.weightage)),
      0
    );

    if (newSheetTotal !== 100) {
      setActionError(
        `Weightage warning: This inline change causes ${editingGoal.employee?.name}'s total sheet weightage to equal ${newSheetTotal}%. Total must equal 100%. Rebalance other goals or return for rework.`
      );
    }

    try {
      const { data } = await managerUpdateGoalRequest(editingGoal._id, values);
      const updatedGoal = data?.goal || data;
      setGoals((prev) => prev.map((g) => (g._id === editingGoal._id ? { ...g, ...updatedGoal } : g)));
      setEditingGoal(null);
    } catch (err) {
      setActionError(err?.response?.data?.message || "Failed to update target/weightage inline.");
    } finally {
      setActioningId(null);
    }
  };

  const handleSaveCheckinComment = async (e) => {
    e.preventDefault();
    if (!checkinGoal) return;
    setActioningId(checkinGoal._id);
    setActionError("");
    try {
      const { data } = await logCheckinRequest(checkinGoal._id, {
        managerComment: checkinComment
      });
      const updatedGoal = data?.goal || data;
      setGoals((prev) => prev.map((g) => (g._id === checkinGoal._id ? { ...g, ...updatedGoal } : g)));
      setCheckinGoal(null);
      setCheckinComment("");
    } catch (err) {
      setActionError(err?.response?.data?.message || "Could not save check-in comment.");
    } finally {
      setActioningId(null);
    }
  };

  const handlePushSharedGoal = async (values) => {
    setActionError("");
    try {
      await pushSharedGoalRequest({ ...values, isShared: true });
      await loadGoals();
      setSharedModalOpen(false);
    } catch (err) {
      setActionError(err?.response?.data?.message || "Failed to push shared goal.");
    }
  };

  return (
    <div className="app-shell">
      <Navbar />

      <main className="dashboard">
        <div className="dashboard-header fade-in-up">
          <div>
            <p className="eyebrow">{user?.role === "admin" ? "Admin workspace" : "Manager workspace"}</p>
            <h1>Review goals across the organization</h1>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setSharedModalOpen(true)}>
            + Push Shared Goal / Departmental KPI
          </button>
        </div>

        <section className="stat-row fade-in-up" style={{ animationDelay: "60ms" }}>
          <div className="stat-card">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total goals</span>
          </div>
          <div className="stat-card stat-card-accent-pending">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Awaiting review</span>
          </div>
          <div className="stat-card stat-card-accent-approved">
            <span className="stat-value">{stats.approved}</span>
            <span className="stat-label">Approved</span>
          </div>
          <div className="stat-card stat-card-accent-rework">
            <span className="stat-value">{stats.rework}</span>
            <span className="stat-label">Rejected / rework</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.locked}</span>
            <span className="stat-label">Locked</span>
          </div>
        </section>

        <div className="toolbar fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="filter-tabs">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={f === filter ? "filter-tab filter-tab-active" : "filter-tab"}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <input
            className="search-input"
            placeholder="Search by employee or goal title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {actionError ? <p className="form-error banner-error">{actionError}</p> : null}
        {loadError ? <p className="form-error banner-error">{loadError}</p> : null}

        {loading ? (
          <Loader label="Loading organization goals…" />
        ) : visibleGoals.length === 0 ? (
          <div className="empty-state fade-in-up">
            <h3>Nothing here yet</h3>
            <p>No goals match this filter. Try a different status or clear your search.</p>
          </div>
        ) : (
          <div className="review-table fade-in-up" style={{ animationDelay: "140ms" }}>
            <div className="review-row review-row-head">
              <span>Employee</span>
              <span>Goal & Targets</span>
              <span>Thrust area</span>
              <span>Weightage</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {visibleGoals.map((goal) => {
              const busy = actioningId === goal._id;
              const locked = goal.status === "locked";
              return (
                <div className="review-row" key={goal._id}>
                  <span data-label="Employee">
                    <span className="employee-name">{goal.employee?.name || "—"}</span>
                    <span className="employee-email">{goal.employee?.email}</span>
                  </span>

                  <span data-label="Goal">
                    <span className="review-title">{goal.title}</span>
                    <span className="review-target">
                      Target: {goal.target} ({goal.unitofmeasurement})
                    </span>
                    {goal.managerComment ? (
                      <span className="field-hint" style={{ display: "block", marginTop: "4px" }}>
                        💬 Check-in Note: {goal.managerComment}
                      </span>
                    ) : null}
                  </span>

                  <span data-label="Thrust area">{goal.thrustarea}</span>

                  <span data-label="Weightage" className="mono">
                    {goal.weightage}%
                  </span>

                  <span data-label="Status">
                    <StatusBadge status={goal.status} />
                  </span>

                  <span data-label="Actions" className="review-actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      onClick={() => setEditingGoal(goal)}
                      disabled={busy || locked}
                    >
                      Inline Edit
                    </button>

                    <button
                      type="button"
                      className="btn btn-approve btn-small"
                      onClick={() => runAction(goal, "approve")}
                      disabled={busy || locked}
                    >
                      Approve & Lock
                    </button>

                    <button
                      type="button"
                      className="btn btn-reject btn-small"
                      onClick={() => runAction(goal, "reject")}
                      disabled={busy || locked}
                    >
                      Reject
                    </button>

                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      onClick={() => runAction(goal, "rework")}
                      disabled={busy || locked}
                    >
                      Rework
                    </button>

                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      onClick={() => {
                        setCheckinGoal(goal);
                        setCheckinComment(goal.managerComment || "");
                      }}
                    >
                      Check-in
                    </button>

                    {user?.role === "admin" ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-small"
                        onClick={() => runAction(goal, "lock")}
                        disabled={busy}
                      >
                        {locked ? "Unlock (Admin)" : "Lock"}
                      </button>
                    ) : null}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {editingGoal ? (
        <GoalFormModal
          open={Boolean(editingGoal)}
          initialData={editingGoal}
          onClose={() => setEditingGoal(null)}
          onSubmit={handleSaveInlineEdit}
          submitting={Boolean(actioningId)}
        />
      ) : null}

      {sharedModalOpen ? (
        <GoalFormModal
          open={sharedModalOpen}
          initialData={{ isShared: true }}
          teamMembers={teamMembers}
          onClose={() => setSharedModalOpen(false)}
          onSubmit={handlePushSharedGoal}
          submitting={Boolean(actioningId)}
        />
      ) : null}

      {checkinGoal ? (
        <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setCheckinGoal(null)}>
          <div className="modal-panel" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h2>Quarterly Check-in Discussion</h2>
              <button type="button" className="modal-close" onClick={() => setCheckinGoal(null)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveCheckinComment} className="goal-form">
              <div
                className="goal-summary-box"
                style={{ background: "var(--surface-subtle)", padding: "12px", borderRadius: "6px" }}
              >
                <p><strong>Employee:</strong> {checkinGoal.employee?.name}</p>
                <p><strong>Goal:</strong> {checkinGoal.title}</p>
                <p><strong>Target:</strong> {checkinGoal.target} ({checkinGoal.unitofmeasurement})</p>
                <p><strong>Actual Logged:</strong> {checkinGoal.actualAchievement || "Not provided yet"}</p>
              </div>

              <label className="field">
                <span>Manager Discussion Comment / Feedback</span>
                <textarea
                  rows={4}
                  required
                  value={checkinComment}
                  onChange={(e) => setCheckinComment(e.target.value)}
                  placeholder="Record alignment discussion, guidance, or blockers discussed..."
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setCheckinGoal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={Boolean(actioningId)}>
                  Save Discussion Comment
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}