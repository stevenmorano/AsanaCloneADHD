/**
 * HealthBar.jsx
 * 
 * Reusable health bar component.
 * Color thresholds from gamification_logic.md:
 *   70-100% → green (vibrant)
 *   30-69%  → amber (warned)
 *   0-29%   → red (critical, pulsing)
 */

import { useEffect, useRef } from 'react';
import './HealthBar.css';

function getHealthColor(pct) {
  if (pct >= 70) return 'var(--health-high)';
  if (pct >= 30) return 'var(--health-mid)';
  return 'var(--health-low)';
}

function getHealthLabel(pct) {
  if (pct >= 70) return 'Healthy';
  if (pct >= 30) return 'Needs attention';
  return 'Critical';
}

export function HealthBar({ percentage = 100, animated = true }) {
  const barRef = useRef(null);
  const color = getHealthColor(percentage);
  const label = getHealthLabel(percentage);
  const isCritical = percentage < 30;

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
      barRef.current.style.backgroundColor = color;
    }
  }, [percentage, color]);

  return (
    <div
      className={`health-bar-track ${isCritical ? 'health-bar--critical' : ''}`}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Task health: ${label} at ${Math.round(percentage)}%`}
      title={`${label} — ${Math.round(percentage)}%`}
    >
      <div
        ref={barRef}
        className={`health-bar-fill ${animated ? 'health-bar-fill--animated' : ''}`}
        style={{
          width: `${percentage}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}
