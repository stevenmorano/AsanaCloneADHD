/**
 * recurrenceUtils.js
 *
 * All recurrence computation logic.
 * 
 * Recurrence schema (extends existing schema):
 * {
 *   intervalValue: number,     // e.g., 1, 2, 45
 *   intervalType: 'days'|'weeks'|'months'|'years',
 *   weekDays: string[]|null,   // ['Mon','Wed'] — for weekly specific days
 *   monthlyMode: string|null,  // 'same_date'|'specific_date'|'first_day'|'last_day'|'nth_weekday'|'last_weekday'
 *   specificDate: number|null, // 1-31 for 'specific_date'
 *   nthWeek: number|null,      // 1-4 for 'nth_weekday'
 *   weekDayName: string|null,  // 'Mon'..'Sun' for nth/last weekday
 *   degradationRate: number,   // auto-computed, used by health bar
 * }
 *
 * All recurrences are JIT — next date is computed from completedAt, NOT from dueDate.
 */

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// Maps DAY_NAMES index → JS getDay() values (Sun=0)
const DOW_MAP = [1, 2, 3, 4, 5, 6, 0];

// ── Date arithmetic helpers ─────────────────────────────────

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function addMonths(date, n) {
  const d = new Date(date);
  const originalDay = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  // Clamp to last day of month if needed
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(originalDay, lastDay));
  return d;
}

function lastDayOf(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/** Get the Nth weekday of a month (e.g., 2nd Tuesday of April 2026) */
function getNthWeekday(year, month, weekNum, dayName) {
  const targetDow = DOW_MAP[DAY_NAMES.indexOf(dayName)];
  const d = new Date(year, month, 1);
  let count = 0;
  while (d.getMonth() === month) {
    if (d.getDay() === targetDow) {
      count++;
      if (count === weekNum) return new Date(d);
    }
    d.setDate(d.getDate() + 1);
  }
  return null;
}

/** Get the last occurrence of a weekday in a month */
function getLastWeekday(year, month, dayName) {
  const targetDow = DOW_MAP[DAY_NAMES.indexOf(dayName)];
  const d = new Date(year, month + 1, 0); // last day of month
  while (d.getDay() !== targetDow) d.setDate(d.getDate() - 1);
  return new Date(d);
}

/** Get the nearest future occurrence of any of the given weekdays */
function getNextAmongWeekdays(fromDate, dayNames) {
  const targets = dayNames.map((n) => DOW_MAP[DAY_NAMES.indexOf(n)]);
  const d = addDays(fromDate, 1); // start from tomorrow
  for (let i = 0; i < 14; i++) {
    if (targets.includes(d.getDay())) return new Date(d);
    d.setDate(d.getDate() + 1);
  }
  return addDays(fromDate, 7); // fallback
}

// ── Public API ──────────────────────────────────────────────

/** Compute the next due date based on recurrence config and completion timestamp */
export function calcNextDueDate(recurrence, completedAt) {
  if (!recurrence) return null;
  const base = completedAt ? new Date(completedAt) : new Date();
  base.setHours(0, 0, 0, 0);

  const {
    intervalValue = 1,
    intervalType = 'days',
    weekDays,
    monthlyMode,
    specificDate,
    nthWeek,
    weekDayName,
  } = recurrence;

  switch (intervalType) {
    case 'days':
      return addDays(base, intervalValue).toISOString().split('T')[0];

    case 'weeks': {
      if (weekDays && weekDays.length > 0) {
        const next = getNextAmongWeekdays(base, weekDays);
        return next.toISOString().split('T')[0];
      }
      return addDays(base, intervalValue * 7).toISOString().split('T')[0];
    }

    case 'months': {
      const next = addMonths(base, intervalValue);
      const yr = next.getFullYear();
      const mo = next.getMonth();

      if (!monthlyMode || monthlyMode === 'same_date') {
        return next.toISOString().split('T')[0];
      }
      if (monthlyMode === 'specific_date' && specificDate) {
        next.setDate(Math.min(specificDate, lastDayOf(yr, mo)));
        return next.toISOString().split('T')[0];
      }
      if (monthlyMode === 'first_day') {
        next.setDate(1);
        return next.toISOString().split('T')[0];
      }
      if (monthlyMode === 'last_day') {
        next.setDate(lastDayOf(yr, mo));
        return next.toISOString().split('T')[0];
      }
      if (monthlyMode === 'nth_weekday' && nthWeek && weekDayName) {
        const result = getNthWeekday(yr, mo, nthWeek, weekDayName);
        if (result) return result.toISOString().split('T')[0];
      }
      if (monthlyMode === 'last_weekday' && weekDayName) {
        return getLastWeekday(yr, mo, weekDayName).toISOString().split('T')[0];
      }
      return next.toISOString().split('T')[0];
    }

    case 'years': {
      const next = new Date(base);
      next.setFullYear(next.getFullYear() + intervalValue);
      return next.toISOString().split('T')[0];
    }

    default:
      return null;
  }
}

/** Compute the health bar degradation rate (% per day) */
export function computeDegradationRate(recurrence) {
  if (!recurrence) return 0;
  const { intervalValue = 1, intervalType = 'days' } = recurrence;
  const daysPerUnit = { days: 1, weeks: 7, months: 30, years: 365 };
  const totalDays = intervalValue * (daysPerUnit[intervalType] || 1);
  return Math.max(0.1, Math.round(1000 / totalDays) / 10);
}

/** Human-readable summary of a recurrence config */
export function humanizeRecurrence(recurrence) {
  if (!recurrence) return null;
  const {
    intervalValue = 1,
    intervalType,
    weekDays,
    monthlyMode,
    specificDate,
    nthWeek,
    weekDayName,
  } = recurrence;

  const ORDINALS = ['', '1st', '2nd', '3rd', '4th'];
  const daysLabel = weekDays?.length
    ? weekDays.map((d) => d.slice(0, 2)).join(', ')
    : null;

  switch (intervalType) {
    case 'days':
      return intervalValue === 1 ? 'Daily' : `Every ${intervalValue} days`;
    case 'weeks':
      if (daysLabel) {
        return intervalValue === 1
          ? `Weekly · ${daysLabel}`
          : `Every ${intervalValue} wks · ${daysLabel}`;
      }
      return intervalValue === 1 ? 'Weekly' : `Every ${intervalValue} weeks`;
    case 'months': {
      const base = intervalValue === 1 ? 'Monthly' : `Every ${intervalValue} mo`;
      if (!monthlyMode || monthlyMode === 'same_date') return base;
      if (monthlyMode === 'specific_date') return `${base} · ${specificDate}th`;
      if (monthlyMode === 'first_day') return `${base} · 1st`;
      if (monthlyMode === 'last_day') return `${base} · Last day`;
      if (monthlyMode === 'nth_weekday')
        return `${base} · ${ORDINALS[nthWeek] || nthWeek + 'th'} ${weekDayName}`;
      if (monthlyMode === 'last_weekday') return `${base} · Last ${weekDayName}`;
      return base;
    }
    case 'years':
      return intervalValue === 1 ? 'Yearly' : `Every ${intervalValue} years`;
    default:
      return null;
  }
}

/** Build a recurrence object from a preset string */
export function presetToRecurrence(preset) {
  const presets = {
    daily:   { intervalValue: 1, intervalType: 'days',   degradationRate: 100 },
    weekly:  { intervalValue: 1, intervalType: 'weeks',  degradationRate: 14.3 },
    monthly: { intervalValue: 1, intervalType: 'months', degradationRate: 3.3 },
    yearly:  { intervalValue: 1, intervalType: 'years',  degradationRate: 0.27 },
  };
  return presets[preset] ?? null;
}

/** Infer a preset label from an existing recurrence config */
export function recurrenceToPreset(recurrence) {
  if (!recurrence) return 'none';
  const { intervalValue, intervalType, weekDays, monthlyMode } = recurrence;
  if (intervalType === 'days'   && intervalValue === 1 && !weekDays && !monthlyMode) return 'daily';
  if (intervalType === 'weeks'  && intervalValue === 1 && !weekDays && !monthlyMode) return 'weekly';
  if (intervalType === 'months' && intervalValue === 1 && (!monthlyMode || monthlyMode === 'same_date')) return 'monthly';
  if (intervalType === 'years'  && intervalValue === 1) return 'yearly';
  return 'custom';
}

/** Generate a 6-row × 7-col calendar grid for a given year/month */
export function getCalendarGrid(year, month) {
  const days = [];
  const firstDay = new Date(year, month, 1);
  // Convert getDay() (Sun=0) to Monday-first index
  let startOffset = (firstDay.getDay() + 6) % 7;

  // Previous month tail
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month, -i), currentMonth: false });
  }
  // Current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: new Date(year, month, d), currentMonth: true });
  }
  // Next month padding to complete 6 rows (42 cells)
  let nextD = 1;
  while (days.length < 42) {
    days.push({ date: new Date(year, month + 1, nextD++), currentMonth: false });
  }
  return days;
}
