import { useEffect, useState } from "react";

/**
 * A compass-dial style radial gauge. Draws in from empty to the target
 * value on mount/update, echoing a drafting instrument needle settling
 * into place.
 */
export default function RadialGauge({ value = 0, max = 100, size = 84, stroke = 8, label, color = "var(--brass)" }) {
  const clamped = Math.max(0, Math.min(value, max));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (clamped / max) * circumference;

  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOffset(targetOffset));
    return () => cancelAnimationFrame(raf);
  }, [targetOffset]);

  return (
    <div className="gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="gauge-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          className="gauge-value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="gauge-center">
        <span className="gauge-number">{clamped}</span>
        {label ? <span className="gauge-label">{label}</span> : null}
      </div>
    </div>
  );
}
