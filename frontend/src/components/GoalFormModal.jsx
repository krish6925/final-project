import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const UOM_OPTIONS = ["Numeric", "%", "Timeline", "Zero-based"];

const EMPTY_FORM = {
  title: "",
  description: "",
  thrustarea: "",
  unitofmeasurement: "Numeric",
  target: "",
  weightage: "",
  isShared: false,
  assignedTo: "ALL"
};

export default function GoalFormModal({
  open,
  initialData,
  onClose,
  onSubmit,
  submitting,
  remainingWeightage,
  teamMembers = []
}) {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(
        initialData
          ? {
              title: initialData.title || "",
              description: initialData.description || "",
              thrustarea: initialData.thrustarea || "",
              unitofmeasurement: initialData.unitofmeasurement || "Numeric",
              target: initialData.target || "",
              weightage: initialData.weightage ?? "",
              isShared: Boolean(initialData.isShared),
              assignedTo: initialData.assignedTo || "ALL"
            }
          : EMPTY_FORM
      );
      setFormError("");
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    const value = field === "isShared" ? e.target.checked : e.target.value;

    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-set target to 0 when Zero-based is selected
      if (field === "unitofmeasurement" && value === "Zero-based") {
        updated.target = "0";
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (
      !form.title ||
      !form.description ||
      !form.thrustarea ||
      !form.unitofmeasurement ||
      form.target === "" ||
      form.weightage === ""
    ) {
      setFormError("Every field is required.");
      return;
    }

    const weightageNum = Number(form.weightage);

    // Enforce 10% minimum weightage rule
    if (Number.isNaN(weightageNum) || weightageNum < 10 || weightageNum > 100) {
      setFormError("Individual goal weightage must be between 10% and 100%.");
      return;
    }

    try {
      await onSubmit({ ...form, weightage: weightageNum });
    } catch (err) {
      setFormError(err?.response?.data?.message || "Something went wrong saving this goal.");
    }
  };

  // Lock title and target if an employee is editing a shared goal assigned to them
  const isSharedRecipient = initialData?.isShared && user?.role === "employee";

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label={initialData ? "Edit goal" : "New goal"}>
        <div className="modal-header">
          <h2>
            {initialData?.isShared && user?.role === "manager"
              ? "Push Departmental KPI"
              : initialData
              ? "Edit goal"
              : "Draft a new goal"}
          </h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <form className="goal-form" onSubmit={handleSubmit}>
          {/* Manager Recipient Selection for Shared Goals */}
          {form.isShared && (user?.role === "manager" || user?.role === "admin") ? (
            <label className="field">
              <span>Assign Goal To</span>
              <select value={form.assignedTo} onChange={handleChange("assignedTo")}>
                <option value="ALL">Entire Team / All Direct Reports</option>
                {teamMembers.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>
              <em className="field-hint">
                Selected employee(s) will receive this goal with locked title & target.
              </em>
            </label>
          ) : null}

          <label className="field">
            <span>Title</span>
            <input
              value={form.title}
              onChange={handleChange("title")}
              placeholder="e.g., Reduce onboarding time"
              disabled={isSharedRecipient}
            />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              placeholder="What does success look like for this goal?"
              rows={3}
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Thrust area</span>
              <input value={form.thrustarea} onChange={handleChange("thrustarea")} placeholder="Customer Experience" />
            </label>

            <label className="field">
              <span>Unit of measurement (UoM)</span>
              <select
                value={form.unitofmeasurement}
                onChange={handleChange("unitofmeasurement")}
                disabled={isSharedRecipient}
              >
                {UOM_OPTIONS.map((uom) => (
                  <option key={uom} value={uom}>
                    {uom}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>
                Target
                {form.unitofmeasurement === "Zero-based" && <em className="field-hint"> · Fixed at 0</em>}
              </span>
              <input
                type={form.unitofmeasurement === "Timeline" ? "date" : "text"}
                value={form.target}
                onChange={handleChange("target")}
                placeholder={
                  form.unitofmeasurement === "%"
                    ? "e.g. 15"
                    : form.unitofmeasurement === "Numeric"
                    ? "e.g. 100"
                    : ""
                }
                disabled={isSharedRecipient || form.unitofmeasurement === "Zero-based"}
              />
            </label>

            <label className="field">
              <span>
                Weightage (Min 10%)
                {typeof remainingWeightage === "number" ? (
                  <em className="field-hint"> · {remainingWeightage}% left</em>
                ) : null}
              </span>
              <input
                type="number"
                min="10"
                max="100"
                value={form.weightage}
                onChange={handleChange("weightage")}
                placeholder="20"
              />
            </label>
          </div>

          {!initialData && user?.role !== "manager" ? (
            <label className="field field-checkbox">
              <input type="checkbox" checked={form.isShared} onChange={handleChange("isShared")} />
              <span>Shared goal (jointly owned with another team)</span>
            </label>
          ) : null}

          {formError ? <p className="form-error">{formError}</p> : null}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : initialData ? "Save changes" : "Create & Push Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
