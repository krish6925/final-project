import RadialGauge from "./RadialGauge";
import StatusBadge from "./StatusBadge";

const GAUGE_COLOR = {
  pending: "var(--brass)",
  approved: "var(--success)",
  rejected: "var(--danger)",
  rework: "var(--warning)",
  locked: "var(--muted)"
};

export default function GoalCard({ goal, onEdit, onDelete, deleting }) {
  const locked = goal.status === "locked";

  return (
    <article className="goal-card">
      <span className="corner corner-tl" />
      <span className="corner corner-tr" />
      <span className="corner corner-bl" />
      <span className="corner corner-br" />

      <div className="goal-card-top">
        <div>
          <p className="goal-thrust">{goal.thrustarea}</p>
          <h3 className="goal-title">{goal.title}</h3>
        </div>
        <RadialGauge value={goal.weightage} size={68} stroke={6} label="weight" color={GAUGE_COLOR[goal.status]} />
      </div>

      <p className="goal-desc">{goal.description}</p>

      <dl className="goal-meta">
        <div>
          <dt>Target</dt>
          <dd>{goal.target}</dd>
        </div>
        <div>
          <dt>Unit</dt>
          <dd>{goal.unitofmeasurement}</dd>
        </div>
        {goal.isShared ? (
          <div>
            <dt>Type</dt>
            <dd>Shared goal</dd>
          </div>
        ) : null}
      </dl>

      <div className="goal-card-footer">
        <StatusBadge status={goal.status} />
        <div className="goal-actions">
          <button type="button" className="btn btn-ghost btn-small" onClick={() => onEdit(goal)} disabled={locked}>
            Edit
          </button>
          <button
            type="button"
            className="btn btn-danger-ghost btn-small"
            onClick={() => onDelete(goal)}
            disabled={locked || deleting}
          >
            {deleting ? "Removing…" : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}
