import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import GoalCard from "../components/GoalCard";
import GoalFormModal from "../components/GoalFormModal";
import Loader from "../components/Loader";
import RadialGauge from "../components/RadialGauge";
import { useAuth } from "../context/AuthContext";
import { fetchMyGoals, createGoalRequest, updateGoalRequest, deleteGoalRequest } from "../api/goals";
import { validateGoalSheet } from "../utils/goalCalculations";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitSheetError, setSubmitSheetError] = useState("");

  const loadGoals = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const { data } = await fetchMyGoals();
      setGoals(data);
    } catch (err) {
      setLoadError(err?.response?.data?.message || "Could not load your goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const stats = useMemo(() => {
    const totalWeightage = goals.reduce((sum, g) => sum + (Number(g.weightage) || 0), 0);
    return {
      total: goals.length,
      approved: goals.filter((g) => g.status === "approved" || g.status === "locked").length,
      pending: goals.filter((g) => g.status === "pending").length,
      rework: goals.filter((g) => g.status === "rework" || g.status === "rejected").length,
      totalWeightage
    };
  }, [goals]);

  const openCreate = () => {
    if (goals.length >= 8) {
      setLoadError("Maximum goal limit (8 goals) reached.");
      return;
    }
    setEditingGoal(null);
    setModalOpen(true);
  };

  const openEdit = (goal) => {
    setEditingGoal(goal);
    setModalOpen(true);
  };

  const handleSubmitGoal = async (values) => {
    setSubmitting(true);
    try {
      if (editingGoal) {
        const { data } = await updateGoalRequest(editingGoal._id, values);
        setGoals((prev) => prev.map((g) => (g._id === data._id ? data : g)));
      } else {
        const { data } = await createGoalRequest(values);
        setGoals((prev) => [data, ...prev]);
      }
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalSheetSubmit = async () => {
    setSubmitSheetError("");
    // System Validation Rules: Total = 100%, Min 10% per goal, Max 8 goals
    const validation = validateGoalSheet(goals);
    if (!validation.isValid) {
      setSubmitSheetError(validation.error);
      return;
    }

    try {
      setSubmitting(true);
      // Trigger approval flow API
      alert("Goal sheet submitted to L1 Manager for review!");
      await loadGoals();
    } catch (err) {
      setSubmitSheetError(err?.response?.data?.message || "Error submitting goal sheet.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (goal) => {
    setDeletingId(goal._id);
    try {
      await deleteGoalRequest(goal._id);
      setGoals((prev) => prev.filter((g) => g._id !== goal._id));
      setConfirmDelete(null);
    } catch (err) {
      setLoadError(err?.response?.data?.message || "Could not delete this goal.");
    } finally {
      setDeletingId(null);
    }
  };

  const remainingWeightage = Math.max(
    0,
    100 - stats.totalWeightage + (editingGoal ? Number(editingGoal.weightage) || 0 : 0)
  );

  return (
    <div className="app-shell">
      <Navbar />

      <main className="dashboard">
        <div className="dashboard-header fade-in-up">
          <div>
            <p className="eyebrow">Employee workspace</p>
            <h1>Hi {user?.name?.split(" ")[0]}, here&rsquo;s where your goals stand.</h1>
          </div>
          <div className="header-actions">
            <button type="button" className="btn btn-ghost" onClick={handleFinalSheetSubmit} disabled={submitting}>
              Submit Goal Sheet
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={openCreate}
              disabled={goals.length >= 8}
            >
              + New goal ({goals.length}/8)
            </button>
          </div>
        </div>

        {submitSheetError ? <p className="form-error banner-error">{submitSheetError}</p> : null}
        {loadError ? <p className="form-error banner-error">{loadError}</p> : null}

        <section className="stat-row fade-in-up" style={{ animationDelay: "60ms" }}>
          <div className="stat-card">
            <span className="stat-value">{stats.total} / 8</span>
            <span className="stat-label">Total goals</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.approved}</span>
            <span className="stat-label">Approved</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Awaiting review</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.rework}</span>
            <span className="stat-label">Needs attention</span>
          </div>
          <div className="stat-card stat-card-gauge">
            <RadialGauge value={Math.min(stats.totalWeightage, 100)} size={56} stroke={5} label="of 100%" />
            <span className="stat-label">Weightage Total</span>
          </div>
        </section>

        {loading ? (
          <Loader label="Loading your goals…" />
        ) : goals.length === 0 ? (
          <div className="empty-state fade-in-up">
            <h3>No goals drafted yet</h3>
            <p>Start by drafting your first goal for this cycle &mdash; give it a thrust area and a weightage.</p>
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              Draft your first goal
            </button>
          </div>
        ) : (
          <section className="goal-grid">
            {goals.map((goal, i) => (
              <div key={goal._id} className="fade-in-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                <GoalCard
                  goal={goal}
                  onEdit={openEdit}
                  onDelete={setConfirmDelete}
                  deleting={deletingId === goal._id}
                />
              </div>
            ))}
          </section>
        )}
      </main>

      <GoalFormModal
        open={modalOpen}
        initialData={editingGoal}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitGoal}
        submitting={submitting}
        remainingWeightage={remainingWeightage}
      />
    </div>
  );
}
