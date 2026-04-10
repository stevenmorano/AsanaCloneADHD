/**
 * DatePickerPopover.jsx
 *
 * Floating date picker with:
 *   - Mini calendar (Mon-Sun, 6 rows)
 *   - Due date text input (editable)
 *   - Repeats section: None / Daily / Weekly / Monthly / Yearly / Custom
 *     - Every [N] [unit] row
 *     - Weekly: day-of-week checkboxes (M T W T F S S)
 *     - Monthly: mode selector (same date / specific date / first / last / nth weekday / last weekday)
 *       + weekday + nth sub-selectors
 *   - Clear button
 *
 * Positioned `fixed` using client-space coordinates from the trigger element.
 * Closes on outside click or Escape.
 *
 * Props:
 *   dueDate    - ISO date string | null  (current due date)
 *   recurrence - recurrence object | null
 *   position   - { x, y } in viewport pixels (bottom-left of trigger)
 *   onSave     - fn(dueDate: string|null, recurrence: object|null)
 *   onClose    - fn()
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  DAY_NAMES,
  getCalendarGrid,
  presetToRecurrence,
  recurrenceToPreset,
  computeDegradationRate,
  humanizeRecurrence,
} from '../utils/recurrenceUtils';
import './DatePickerPopover.css';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const MONTHLY_MODES = [
  { value: 'same_date',      label: 'Same date each month' },
  { value: 'specific_date',  label: 'Specific day of month…' },
  { value: 'first_day',      label: 'First day of month' },
  { value: 'last_day',       label: 'Last day of month' },
  { value: 'nth_weekday',    label: '… weekday of month' },
  { value: 'last_weekday',   label: 'Last … of month' },
];

function toIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

export function DatePickerPopover({ dueDate, recurrence, position, onSave, onClose }) {
  const containerRef = useRef(null);

  // ── Calendar state ──────────────────────────────────────
  const initDate = dueDate ? new Date(dueDate) : new Date();
  const [viewYear,  setViewYear]  = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const [selectedDate, setSelectedDate] = useState(dueDate || null);

  // Text input value for the date field
  const [dateInput, setDateInput] = useState(
    dueDate ? new Date(dueDate).toLocaleDateString('en-US') : ''
  );

  // ── Recurrence state ────────────────────────────────────
  const initPreset = recurrenceToPreset(recurrence);
  const [preset, setPreset] = useState(initPreset);

  // All custom fields — pre-fill from existing recurrence
  const [every,         setEvery]         = useState(recurrence?.intervalValue ?? 1);
  const [unit,          setUnit]           = useState(recurrence?.intervalType ?? 'weeks');
  const [weekDays,      setWeekDays]       = useState(recurrence?.weekDays ?? []);
  const [monthlyMode,   setMonthlyMode]    = useState(recurrence?.monthlyMode ?? 'same_date');
  const [specificDate,  setSpecificDate]   = useState(recurrence?.specificDate ?? 1);
  const [nthWeek,       setNthWeek]        = useState(recurrence?.nthWeek ?? 1);
  const [weekDayName,   setWeekDayName]    = useState(recurrence?.weekDayName ?? 'Mon');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ── Compute and emit recurrence object ──────────────────
  const buildRecurrence = useCallback(() => {
    if (preset === 'none') return null;

    let rec;
    if (preset === 'custom') {
      rec = {
        intervalValue: Math.max(1, every),
        intervalType: unit,
        weekDays: unit === 'weeks' && weekDays.length > 0 ? weekDays : null,
        monthlyMode: unit === 'months' ? monthlyMode : null,
        specificDate: unit === 'months' && monthlyMode === 'specific_date' ? specificDate : null,
        nthWeek: unit === 'months' && (monthlyMode === 'nth_weekday') ? nthWeek : null,
        weekDayName: unit === 'months' && (monthlyMode === 'nth_weekday' || monthlyMode === 'last_weekday')
          ? weekDayName
          : null,
      };
    } else if (preset === 'weekly') {
      rec = {
        intervalValue: every,
        intervalType: 'weeks',
        weekDays: weekDays.length > 0 ? weekDays : null,
        monthlyMode: null,
        specificDate: null, nthWeek: null, weekDayName: null,
      };
    } else if (preset === 'monthly') {
      rec = {
        intervalValue: every,
        intervalType: 'months',
        weekDays: null,
        monthlyMode,
        specificDate: monthlyMode === 'specific_date' ? specificDate : null,
        nthWeek: monthlyMode === 'nth_weekday' ? nthWeek : null,
        weekDayName: (monthlyMode === 'nth_weekday' || monthlyMode === 'last_weekday') ? weekDayName : null,
      };
    } else if (preset === 'daily') {
      rec = { intervalValue: every, intervalType: 'days', weekDays:null, monthlyMode:null, specificDate:null, nthWeek:null, weekDayName:null };
    } else if (preset === 'yearly') {
      rec = { intervalValue: every, intervalType: 'years', weekDays:null, monthlyMode:null, specificDate:null, nthWeek:null, weekDayName:null };
    }

    if (rec) {
      rec.degradationRate = computeDegradationRate(rec);
    }
    return rec ?? null;
  }, [preset, every, unit, weekDays, monthlyMode, specificDate, nthWeek, weekDayName]);

  // Save on every change
  function emitSave(newDate, newPreset, newEvery, newUnit, newWeekDays, newMonthlyMode, newSpecificDate, newNthWeek, newWeekDayName) {
    // Build recurrence with the freshly provided values
    const p  = newPreset      ?? preset;
    const e  = newEvery       ?? every;
    const u  = newUnit        ?? unit;
    const wd = newWeekDays    ?? weekDays;
    const mm = newMonthlyMode ?? monthlyMode;
    const sd = newSpecificDate ?? specificDate;
    const nw = newNthWeek     ?? nthWeek;
    const wn = newWeekDayName ?? weekDayName;
    const d  = newDate !== undefined ? newDate : selectedDate;

    let rec = null;
    if (p !== 'none') {
      const getIt = (preset, every, unit, weekDays, monthlyMode, specificDate, nthWeek, weekDayName) => {
        let r;
        if (preset === 'daily')   r = { intervalValue:every, intervalType:'days' };
        else if (preset === 'weekly')  r = { intervalValue:every, intervalType:'weeks', weekDays: weekDays.length ? weekDays : null };
        else if (preset === 'monthly') r = { intervalValue:every, intervalType:'months', monthlyMode, specificDate: monthlyMode === 'specific_date' ? specificDate : null, nthWeek: monthlyMode === 'nth_weekday' ? nthWeek : null, weekDayName: (monthlyMode === 'nth_weekday' || monthlyMode === 'last_weekday') ? weekDayName : null };
        else if (preset === 'yearly')  r = { intervalValue:every, intervalType:'years' };
        else if (preset === 'custom') {
          r = { intervalValue:every, intervalType:unit };
          if (unit === 'weeks' && weekDays.length) r.weekDays = weekDays;
          if (unit === 'months') {
            r.monthlyMode = monthlyMode;
            if (monthlyMode === 'specific_date') r.specificDate = specificDate;
            if (monthlyMode === 'nth_weekday')   { r.nthWeek = nthWeek; r.weekDayName = weekDayName; }
            if (monthlyMode === 'last_weekday')  r.weekDayName = weekDayName;
          }
        }
        if (r) r.degradationRate = computeDegradationRate(r);
        return r ?? null;
      };
      rec = getIt(p, e, u, wd, mm, sd, nw, wn);
    }
    onSave(d, rec);
  }

  // ── Outside click / Escape ──────────────────────────────
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    function onDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // ── Adjust popover to stay in viewport ─────────────────
  const popupStyle = useCallback(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const popW = 280;
    const popH = 500; // approx
    let x = position.x;
    let y = position.y;
    if (x + popW > W - 8) x = W - popW - 8;
    if (y + popH > H - 8) y = position.y - popH - 8;
    return { left: x, top: y };
  }, [position]);

  // ── Handlers ────────────────────────────────────────────

  function selectDay(isoDate) {
    setSelectedDate(isoDate);
    const d = new Date(isoDate);
    setDateInput(d.toLocaleDateString('en-US'));
    emitSave(isoDate);
  }

  function handleDateInput(e) {
    setDateInput(e.target.value);
    const parsed = new Date(e.target.value);
    if (!isNaN(parsed)) {
      const iso = toIso(parsed);
      setSelectedDate(iso);
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
      emitSave(iso);
    }
  }

  function clearDate() {
    setSelectedDate(null);
    setDateInput('');
    setPreset('none');
    onSave(null, null);
    onClose();
  }

  function changePreset(p) {
    setPreset(p);
    const defaultUnit = p === 'daily' ? 'days'
      : p === 'weekly' ? 'weeks'
      : p === 'monthly' ? 'months'
      : p === 'yearly' ? 'years'
      : unit;
    const newRec = p === 'none' ? null : (() => {
      const base = presetToRecurrence(p === 'custom' ? (defaultUnit === 'weeks' ? 'weekly' : defaultUnit === 'months' ? 'monthly' : defaultUnit === 'years' ? 'yearly' : 'daily') : p);
      return base ? { ...base, intervalValue: every } : null;
    })();
    if (p !== 'custom') setUnit(defaultUnit);
    onSave(selectedDate, newRec);
  }

  function toggleWeekDay(day) {
    const next = weekDays.includes(day)
      ? weekDays.filter((d) => d !== day)
      : [...weekDays, day];
    setWeekDays(next);
    emitSave(undefined, undefined, undefined, undefined, next);
  }

  // ── Calendar rendering ──────────────────────────────────
  const calDays = getCalendarGrid(viewYear, viewMonth);
  const selectedObj = selectedDate ? new Date(selectedDate) : null;

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  // ── Derived UI flags ────────────────────────────────────
  const showEvery     = preset !== 'none';
  const showDayPicker = showEvery && (preset === 'weekly' || (preset === 'custom' && unit === 'weeks'));
  const showMonthly   = showEvery && (preset === 'monthly' || (preset === 'custom' && unit === 'months'));
  const showNthWeek   = showMonthly && monthlyMode === 'nth_weekday';
  const showLastWkDay = showMonthly && monthlyMode === 'last_weekday';
  const showSpecDate  = showMonthly && monthlyMode === 'specific_date';
  const unitOptions   = preset === 'custom'
    ? [['days','Days'], ['weeks','Weeks'], ['months','Months'], ['years','Years']]
    : preset === 'daily'   ? [['days','Days']]
    : preset === 'weekly'  ? [['weeks','Weeks']]
    : preset === 'monthly' ? [['months','Months']]
    : [['years','Years']];

  const recSummary = preset !== 'none' ? humanizeRecurrence(buildRecurrence()) : null;

  return (
    <div
      ref={containerRef}
      className="dpop"
      style={{ ...popupStyle() }}
      role="dialog"
      aria-label="Set due date and repeat"
    >
      {/* ── Calendar ── */}
      <div className="dpop__cal">
        <div className="dpop__cal-nav">
          <button className="dpop__nav-btn" onClick={prevMonth} aria-label="Previous month">‹</button>
          <span className="dpop__cal-month">{MONTHS[viewMonth]} {viewYear}</span>
          <button className="dpop__nav-btn" onClick={nextMonth} aria-label="Next month">›</button>
        </div>

        <div className="dpop__cal-grid">
          {/* Day headers */}
          {['M','T','W','T','F','S','S'].map((h, i) => (
            <div key={i} className="dpop__cal-hdr">{h}</div>
          ))}
          {/* Day cells */}
          {calDays.map(({ date, currentMonth }, idx) => {
            const iso      = toIso(date);
            const isToday  = isSameDay(date, today);
            const isSel    = selectedDate ? isSameDay(date, new Date(selectedDate)) : false;
            return (
              <button
                key={idx}
                className={[
                  'dpop__day',
                  !currentMonth  && 'dpop__day--dim',
                  isToday        && 'dpop__day--today',
                  isSel          && 'dpop__day--selected',
                ].filter(Boolean).join(' ')}
                onClick={() => selectDay(iso)}
                aria-label={date.toDateString()}
                aria-pressed={isSel}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Date text input ── */}
      <div className="dpop__date-row">
        <span className="dpop__date-icon" aria-hidden="true">📅</span>
        <input
          className="dpop__date-input"
          value={dateInput}
          onChange={handleDateInput}
          placeholder="MM/DD/YYYY"
          aria-label="Due date"
        />
        {selectedDate && (
          <button className="dpop__date-clear" onClick={clearDate} aria-label="Clear date">×</button>
        )}
      </div>

      <div className="dpop__divider" />

      {/* ── Repeats section ── */}
      <div className="dpop__repeats">
        <div className="dpop__repeats-header">
          <span className="dpop__repeats-label">Repeats</span>
          <select
            className="dpop__preset-select"
            value={preset}
            onChange={(e) => changePreset(e.target.value)}
            aria-label="Repeat frequency"
          >
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom…</option>
          </select>
        </div>

        {showEvery && (
          <div className="dpop__repeats-config">
            {/* Every N [unit] row */}
            <div className="dpop__every-row">
              <span className="dpop__every-label">Every</span>
              <input
                className="dpop__every-num"
                type="number"
                min="1"
                max="999"
                value={every}
                onChange={(e) => {
                  const v = Math.max(1, parseInt(e.target.value) || 1);
                  setEvery(v);
                  emitSave(undefined, undefined, v);
                }}
                aria-label="Repeat every N"
              />
              <select
                className="dpop__unit-select"
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value);
                  emitSave(undefined, undefined, undefined, e.target.value);
                }}
                aria-label="Repeat unit"
                disabled={preset !== 'custom'}
              >
                {unitOptions.map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            {/* Weekly: day-of-week checkboxes */}
            {showDayPicker && (
              <div className="dpop__day-picker">
                <span className="dpop__sub-label">On these days</span>
                <div className="dpop__day-btns">
                  {DAY_NAMES.map((day) => (
                    <button
                      key={day}
                      className={`dpop__day-btn ${weekDays.includes(day) ? 'dpop__day-btn--active' : ''}`}
                      onClick={() => toggleWeekDay(day)}
                      aria-pressed={weekDays.includes(day)}
                      aria-label={day}
                    >
                      {day[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly: mode selector */}
            {showMonthly && (
              <div className="dpop__monthly">
                <span className="dpop__sub-label">On</span>
                <select
                  className="dpop__monthly-mode"
                  value={monthlyMode}
                  onChange={(e) => {
                    setMonthlyMode(e.target.value);
                    emitSave(undefined, undefined, undefined, undefined, undefined, e.target.value);
                  }}
                  aria-label="Monthly repeat mode"
                >
                  {MONTHLY_MODES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>

                {/* Specific day-of-month number */}
                {showSpecDate && (
                  <div className="dpop__sub-row">
                    <span>Day</span>
                    <input
                      className="dpop__every-num"
                      type="number"
                      min="1"
                      max="31"
                      value={specificDate}
                      onChange={(e) => {
                        const v = Math.min(31, Math.max(1, parseInt(e.target.value) || 1));
                        setSpecificDate(v);
                        emitSave(undefined, undefined, undefined, undefined, undefined, undefined, v);
                      }}
                      aria-label="Day of month"
                    />
                  </div>
                )}

                {/* Nth weekday sub-pickers */}
                {showNthWeek && (
                  <div className="dpop__sub-row">
                    <select
                      className="dpop__sub-select"
                      value={nthWeek}
                      onChange={(e) => { const v = parseInt(e.target.value); setNthWeek(v); emitSave(undefined,undefined,undefined,undefined,undefined,undefined,undefined,v); }}
                      aria-label="Which week"
                    >
                      {[1,2,3,4].map((n) => (
                        <option key={n} value={n}>{['1st','2nd','3rd','4th'][n-1]}</option>
                      ))}
                    </select>
                    <select
                      className="dpop__sub-select"
                      value={weekDayName}
                      onChange={(e) => { setWeekDayName(e.target.value); emitSave(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,e.target.value); }}
                      aria-label="Weekday"
                    >
                      {DAY_NAMES.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                )}

                {/* Last weekday sub-picker */}
                {showLastWkDay && (
                  <div className="dpop__sub-row">
                    <span className="dpop__sub-muted">Last</span>
                    <select
                      className="dpop__sub-select"
                      value={weekDayName}
                      onChange={(e) => { setWeekDayName(e.target.value); emitSave(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,e.target.value); }}
                      aria-label="Weekday for last occurrence"
                    >
                      {DAY_NAMES.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <span className="dpop__sub-muted">of month</span>
                  </div>
                )}
              </div>
            )}

            {/* Summary pill */}
            {recSummary && (
              <div className="dpop__rec-summary">
                <span className="dpop__rec-icon" aria-hidden="true">🔁</span>
                <span>{recSummary} — after completion</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="dpop__footer">
        <div className="dpop__footer-icons" aria-hidden="true">
          <span title="Due time (coming soon)" className="dpop__footer-icon">🕐</span>
          <span title="Notes (coming soon)" className="dpop__footer-icon">💬</span>
        </div>
        <button className="dpop__clear-btn" onClick={clearDate}>
          Clear
        </button>
      </div>
    </div>
  );
}
