import { useEffect, useState } from "react";

const EMPTY_FORM = {
  title: "",
  description: "",
  thrustarea: "",
  unitofmeasurement: "",
  target: "",
  weightage: "",
  isShared: false
};

export default function GoalFormModal({ open, initialData, onClose, onSubmit, submitting, remainingWeightage }) {
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
              unitofmeasurement: initialData.unitofmeasurement || "",
              target: initialData.target || "",
              weightage: initialData.weightage ?? "",
              isShared: Boolean(initialData.isShared)
            }
          : EMPTY_FORM
      );
      setFormError("");
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    const value = field === "isShared" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.title || !form.description || !form.thrustarea || !form.unitofmeasurement || !form.target || form.weightage === "") {
      setFormError("Every field is required.");
      return;
    }

    const weightageNum = Number(form.weightage);
    if (Number.isNaN(weightageNum) || weightageNum <= 0 || weightageNum > 100) {
      setFormError("Weightage must be a number between 1 and 100.");
      return;
    }

    try {
      await onSubmit({ ...form, weightage: weightageNum });
    } catch (err) {
      setFormError(err?.response?.data?.message || "Something went wrong saving this goal.");
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label={initialData ? "Edit goal" : "New goal"}>
        <div className="modal-header">
          <h2>{initialData ? "Edit goal" : "Draft a new goal"}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <form className="goal-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Title</span>
            <input value={form.title} onChange={handleChange("title")} placeholder="Reduce onboarding time" />
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
              <span>Unit of measurement</span>
              <input value={form.unitofmeasurement} onChange={handleChange("unitofmeasurement")} placeholder="% / days / count" />
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Target</span>
              <input value={form.target} onChange={handleChange("target")} placeholder="e.g. 15% reduction" />
            </label>

            <label className="field">
              <span>
                Weightage
                {typeof remainingWeightage === "number" ? (
                  <em className="field-hint"> · {remainingWeightage}% left this cycle</em>
                ) : null}
              </span>
              <input
                type="number"
                min="1"
                max="100"
                value={form.weightage}
                onChange={handleChange("weightage")}
                placeholder="20"
              />
            </label>
          </div>

          <label className="field field-checkbox">
            <input type="checkbox" checked={form.isShared} onChange={handleChange("isShared")} />
            <span>Shared goal (jointly owned with another team)</span>
          </label>

          {formError ? <p className="form-error">{formError}</p> : null}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : initialData ? "Save changes" : "Create goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
