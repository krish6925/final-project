const STATUS_MAP = {
  pending: { label: "Pending review", className: "status-pending" },
  approved: { label: "Approved", className: "status-approved" },
  rejected: { label: "Rejected", className: "status-rejected" },
  rework: { label: "Needs rework", className: "status-rework" },
  locked: { label: "Locked", className: "status-locked" }
};

export default function StatusBadge({ status }) {
  const meta = STATUS_MAP[status] || { label: status, className: "status-pending" };
  return (
    <span className={`status-badge ${meta.className}`}>
      <span className="status-dot" />
      {meta.label}
    </span>
  );
}
