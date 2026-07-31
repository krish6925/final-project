import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import { computeProgressScore } from "../utils/goalCalculations";
import { fetchMyGoals } from "../api/goals";

const CHECKIN_WINDOWS = [
  { id: "Q1", label: "Q1 Check-in (July)", period: "July" },
  { id: "Q2", label: "Q2 Check-in (October)", period: "October" },
  { id: "Q3", label: "Q3 Check-in (January)", period: "January" },
  { id: "Q4", label: "Q4 / Annual (March/April)", period: "March/April" }
];

export default function QuarterlyCheckin() {
  const [goals, setGoals] = useState([]);
  const [selectedQuarter, setSelectedQuarter] = useState("Q1");
  const [loading, setLoading] = useState(true);
  const [actuals, setActuals] = useState({});
  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    fetchMyGoals()
      .then(({ data }) => {
        setGoals(data);
        // Pre-populate actuals and statuses state
        const initialActuals = {};
        const initialStatuses = {};
        data.forEach((g) => {
          initialActuals[g._id] = g.actualAchievement || "";
          initialStatuses[g._id] = g.progressStatus || "Not Started";
        });
        setActuals(initialActuals);
        setStatuses(initialStatuses);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleActualChange = (goalId, value) => {
    setActuals((prev) => ({ ...prev, [goalId]: value }));
  };

  const handleStatusChange = (goalId, value) => {
    setStatuses((prev) => ({ ...prev, [goalId]: value }));
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="dashboard">
        <div className="dashboard-header fade-in-up">
          <div>
            <p className="eyebrow">Phase 2 — Progress Tracking</p>
            <h1>Quarterly Check-ins & Achievement</h1>
          </div>
          <div className="quarter-selector">
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="search-input"
            >
              {CHECKIN_WINDOWS.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <Loader label="Loading quarterly targets…" />
        ) : (
          <div className="review-table fade-in-up">
            <div className="review-row review-row-head">
              <span>Goal Sheet Title</span>
              <span>Target & UoM</span>
              <span>Actual Achievement</span>
              <span>Status</span>
              <span>Computed Score</span>
            </div>

            {goals.map((goal) => {
              const currentActual = actuals[goal._id] ?? "";
              const currentStatus = statuses[goal._id] ?? "Not Started";
              const computedScore = computeProgressScore({
                uom: goal.unitofmeasurement,
                type: goal.type || "Min",
                target: goal.target,
                actual: currentActual
              });

              return (
                <div className="review-row" key={goal._id}>
                  <span data-label="Goal">
                    <strong>{goal.title}</strong>
                    <p className="goal-desc">{goal.thrustarea}</p>
                  </span>

                  <span data-label="Target">
                    {goal.target} ({goal.unitofmeasurement})
                  </span>

                  <span data-label="Actual Achievement">
                    <input
                      type={goal.unitofmeasurement === "Timeline" ? "date" : "text"}
                      className="search-input"
                      style={{ padding: "4px 8px" }}
                      value={currentActual}
                      onChange={(e) => handleActualChange(goal._id, e.target.value)}
                      placeholder="Enter actuals"
                    />
                  </span>

                  <span data-label="Status">
                    <select
                      value={currentStatus}
                      onChange={(e) => handleStatusChange(goal._id, e.target.value)}
                      className="search-input"
                      style={{ padding: "4px 8px" }}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="On Track">On Track</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </span>

                  <span data-label="Computed Score">
                    <strong style={{ fontSize: "1.1rem", color: "var(--brass)" }}>
                      {computedScore}%
                    </strong>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}