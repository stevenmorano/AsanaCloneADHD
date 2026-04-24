import { useState, useEffect } from 'react';
import './ReclaimSyncModal.css';

const RECLAIM_SCHEDULES = [
  'Working Hours',
  'Personal Hours',
  'Work - Full Week Grind 9am-10pm',
  'Gym',
  'Work - Full Week Late Night - 8pm-2am',
  'Work - Weekday Work Grind - 9am-10pm'
];

export function ReclaimSyncModal({ task, onClose, onSubmit }) {
  const [timeEstimate, setTimeEstimate] = useState('1h');
  const [priority, setPriority] = useState('High priority');
  const [earliestDate, setEarliestDate] = useState('');
  const [scheduleCategory, setScheduleCategory] = useState('Working Hours');

  useEffect(() => {
    // default earliest date to today
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
    setEarliestDate(localISOTime);
  }, []);

  function handleSubmit() {
    onSubmit({
      timeEstimate,
      priority,
      earliestDate,
      scheduleCategory
    });
  }

  // Format the due date for the top text
  const dueDateStr = task?.dueDate 
    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : earliestDate 
      ? new Date(earliestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'today';

  return (
    <div className="reclaim-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="reclaim-modal" role="dialog" aria-modal="true" aria-labelledby="reclaim-title">
        <header className="reclaim-modal__header">
          <div className="reclaim-modal__header-left">
            <span className="reclaim-icon" aria-hidden="true">
              {/* Fake Reclaim Logo */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="9" height="9" rx="2" fill="#F472B6"/>
                <rect x="13" y="2" width="9" height="9" rx="2" fill="#60A5FA"/>
                <rect x="2" y="13" width="9" height="9" rx="2" fill="#FBBF24"/>
                <rect x="13" y="13" width="9" height="9" rx="2" fill="#818CF8"/>
              </svg>
            </span>
            <h2 id="reclaim-title">Sync Task to Reclaim</h2>
          </div>
          <button className="reclaim-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="reclaim-modal__body">
          <p className="reclaim-modal__subtitle">Submitting will set a due date {dueDateStr}.</p>

          <div className="reclaim-modal__row">
            <div className="reclaim-modal__field">
              <label>Time Estimate</label>
              <input 
                type="text" 
                value={timeEstimate} 
                onChange={(e) => setTimeEstimate(e.target.value)}
              />
            </div>
            <div className="reclaim-modal__field">
              <label>Priority <span className="req">*</span></label>
              <div className="reclaim-select-wrap">
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option>Critical</option>
                  <option>High priority</option>
                  <option>Medium priority</option>
                  <option>Low priority</option>
                </select>
              </div>
            </div>
          </div>

          <div className="reclaim-modal__field">
            <label>Earliest Scheduled Date <span className="req">*</span></label>
            <div className="reclaim-date-wrap">
              <input 
                type="date" 
                value={earliestDate}
                onChange={(e) => setEarliestDate(e.target.value)}
              />
            </div>
          </div>

          <div className="reclaim-modal__field reclaim-schedules">
            <label>Schedule During <span className="req">*</span></label>
            <div className="reclaim-radio-group">
              {RECLAIM_SCHEDULES.map((sched) => (
                <label key={sched} className="reclaim-radio-label">
                  <input 
                    type="radio" 
                    name="reclaim_schedule" 
                    value={sched}
                    checked={scheduleCategory === sched}
                    onChange={(e) => setScheduleCategory(e.target.value)}
                  />
                  <span className="reclaim-radio-custom"></span>
                  {sched}
                </label>
              ))}
            </div>
          </div>

          <p className="reclaim-modal__note">
            Note: If the due date for this task is before the Earliest Scheduled Date, Reclaim will update the due date to match.
          </p>
        </div>

        <footer className="reclaim-modal__footer">
          <button className="reclaim-btn reclaim-btn--cancel" onClick={onClose}>Cancel</button>
          <button className="reclaim-btn reclaim-btn--submit" onClick={handleSubmit}>Submit</button>
        </footer>
      </div>
    </div>
  );
}
