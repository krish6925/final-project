export default function Loader({ label = "Loading" }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <svg className="loader-dial" viewBox="0 0 48 48" width="40" height="40">
        <circle cx="24" cy="24" r="19" className="loader-ring" fill="none" strokeWidth="2" />
        <line x1="24" y1="24" x2="24" y2="8" className="loader-needle" />
        <circle cx="24" cy="24" r="2.5" className="loader-pivot" />
      </svg>
      <span>{label}</span>
    </div>
  );
}
