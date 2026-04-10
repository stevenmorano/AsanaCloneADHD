/**
 * TaskRow.jsx  (v3 — inline edit + date picker + project/section/tag pickers)
 *
 * Clickable / editable for EVERY field:
 *   name       → click text → inline input (Enter save, Esc cancel)
 *   due date   → click → DatePickerPopover (calendar + recurrence)
 *   project    → click badge → project InlineDropdown (changes project, resets section)
 *   section    → click badge → section InlineDropdown (sections of current project)
 *   tags       → click cell → tag InlineDropdown (multi-select + create new)
 *
 * Column layout (My Tasks, showProject=true):
 *   health strip | check | name (flex) | due | project | section | tags | priority
 *
 * Column layout (Project View, showProject=false):
 *   health strip | check | name (flex) | due | section | tags | priority
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getProject } from '../data/projects';
import { formatDueDate, getDueDateStatus } from '../hooks/useAppState';
import { humanizeRecurrence } from '../utils/recurrenceUtils';
import { DatePickerPopover } from './DatePickerPopover';
import { InlineDropdown  } from './InlineDropdown';
import './TaskRow.css';

/* ── helpers ── */
function getHealthColor(pct) {
  if (pct >= 70) return '#4ade80';
  if (pct >= 30) return '#fbbf24';
  return '#f87171';
}

const PRIORITY_CONFIG = {
  High:   { className: 'priority--high' },
  Medium: { className: 'priority--medium' },
  Low:    { className: 'priority--low' },
};

/** Compute {x, y} from a ref's bounding rect — use as popover position */
function getRectPos(ref) {
  if (!ref.current) return { x: 0, y: 0 };
  const r = ref.current.getBoundingClientRect();
  return { x: r.left, y: r.bottom + 4 };
}

/* ───────────────────────────────────────────────────────── */

export function TaskRow({
  task,
  isActive,
  showProject = true,
  onComplete,
  onClearNew,
  onUpdate,
  projects = [],   // full projects array for pickers
  allTags  = [],   // all unique tags across app
}) {
  const {
    id, name, projectId, sectionId, dueDate, tags = [], priority,
    isQuickWin, recurrence, healthPercentage, completed, isNew,
  } = task;

  /* ── spawn animation ── */
  const newFlagCleared = useRef(false);
  useEffect(() => {
    if (isNew && !newFlagCleared.current) {
      newFlagCleared.current = true;
      const t = setTimeout(() => onClearNew?.(id), 500);
      return () => clearTimeout(t);
    }
  }, [isNew, id, onClearNew]);

  /* ── checkbox / completion ── */
  const [shattering, setShattering] = useState(false);
  function handleCheck() {
    if (completed || shattering) return;
    if (isQuickWin) {
      setShattering(true);
      setTimeout(() => { setShattering(false); onComplete(id); }, 420);
    } else {
      onComplete(id);
    }
  }

  /* ── inline name edit ── */
  const [editingName, setEditingName] = useState(false);
  const [nameValue,   setNameValue]   = useState(name);
  const nameInputRef = useRef(null);

  useEffect(() => { setNameValue(name); }, [name]);

  function startNameEdit(e) {
    if (completed) return;
    e.stopPropagation();
    setNameValue(name);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 20);
  }
  function saveNameEdit() {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== name) onUpdate?.(id, { name: trimmed });
    setEditingName(false);
  }
  function cancelNameEdit() { setNameValue(name); setEditingName(false); }
  function onNameKeyDown(e) {
    if (e.key === 'Enter')  { e.preventDefault(); saveNameEdit(); }
    if (e.key === 'Escape') { e.preventDefault(); cancelNameEdit(); }
    e.stopPropagation();
  }

  /* ── due date picker ── */
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerPos,  setDatePickerPos]  = useState({ x: 0, y: 0 });
  const dueDateRef = useRef(null);

  function openDatePicker(e) {
    e.stopPropagation();
    setDatePickerPos(getRectPos(dueDateRef));
    setShowDatePicker(true);
  }
  function handleDateSave(newDate, newRec) {
    onUpdate?.(id, { dueDate: newDate, recurrence: newRec });
  }

  /* ── project picker ── */
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [projectPickerPos,  setProjectPickerPos]  = useState({ x: 0, y: 0 });
  const projectRef = useRef(null);

  function openProjectPicker(e) {
    e.stopPropagation();
    setProjectPickerPos(getRectPos(projectRef));
    setShowProjectPicker(true);
  }
  function handleProjectSelect(newProjectId) {
    // Reset sectionId to first section of new project
    const newProj = projects.find((p) => p.id === newProjectId);
    const newSectionId = newProj?.sections?.[0]?.id ?? 'inbox';
    onUpdate?.(id, { projectId: newProjectId, sectionId: newSectionId });
  }

  /* ── section picker ── */
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [sectionPickerPos,  setSectionPickerPos]  = useState({ x: 0, y: 0 });
  const sectionRef = useRef(null);

  function openSectionPicker(e) {
    e.stopPropagation();
    setSectionPickerPos(getRectPos(sectionRef));
    setShowSectionPicker(true);
  }
  function handleSectionSelect(newSectionId) {
    onUpdate?.(id, { sectionId: newSectionId });
  }

  /* ── tag picker ── */
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [tagPickerPos,  setTagPickerPos]  = useState({ x: 0, y: 0 });
  const tagRef = useRef(null);

  function openTagPicker(e) {
    e.stopPropagation();
    setTagPickerPos(getRectPos(tagRef));
    setShowTagPicker(true);
  }
  function handleTagsChange(newTags) { onUpdate?.(id, { tags: newTags }); }
  function handleTagCreate(newTag) {
    if (!tags.includes(newTag)) onUpdate?.(id, { tags: [...tags, newTag] });
  }

  /* ── derived display values ── */
  const project        = getProject(projectId);
  const currentProject = useMemo(() => projects.find((p) => p.id === projectId), [projects, projectId]);
  const currentSection = useMemo(
    () => currentProject?.sections?.find((s) => s.id === sectionId),
    [currentProject, sectionId]
  );
  const sectionName    = currentSection?.name ?? '';

  const dueDateLabel   = formatDueDate(dueDate);
  const dueDateStatus  = getDueDateStatus(dueDate);
  const healthColor    = recurrence ? getHealthColor(healthPercentage) : null;
  const isCritical     = recurrence && healthPercentage < 30;
  const recurrenceLabel = recurrence ? humanizeRecurrence(recurrence) : null;

  /* ── picker option arrays ── */
  const projectOptions = useMemo(
    () => projects.map((p) => ({ value: p.id, label: p.name, color: p.color })),
    [projects]
  );
  const sectionOptions = useMemo(
    () => (currentProject?.sections ?? []).map((s) => ({ value: s.id, label: s.name })),
    [currentProject]
  );
  const tagOptions = useMemo(
    () => allTags.map((t) => ({ value: t, label: t })),
    [allTags]
  );

  /* ── row class ── */
  const rowClass = [
    'task-row',
    isActive   && 'task-row--active',
    completed  && 'task-row--completed',
    isNew      && 'task-row--spawning',
    isCritical && 'task-row--critical',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={rowClass}
      data-task-id={id}
      style={healthColor ? { '--health-color': healthColor } : {}}
    >
      {/* ── Health strip ── */}
      <div
        className={`task-row__health-strip ${isCritical ? 'task-row__health-strip--pulse' : ''}`}
        title={recurrence ? `Upkeep: ${Math.round(healthPercentage)}% · ${recurrenceLabel ?? ''}` : ''}
        aria-hidden="true"
      />

      {/* ── Checkbox ── */}
      <button
        id={`check-${id}`}
        className={[
          'task-row__check',
          completed  && 'task-row__check--done',
          shattering && 'task-row__check--shattering',
        ].filter(Boolean).join(' ')}
        onClick={handleCheck}
        aria-label={`${completed ? 'Completed' : 'Mark complete'}: ${name}`}
        aria-pressed={completed}
        disabled={completed}
      >
        {completed && (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* ── Name (click to edit) ── */}
      <div className="task-row__name-cell">
        {editingName ? (
          <input
            ref={nameInputRef}
            className="task-row__name-input"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={saveNameEdit}
            onKeyDown={onNameKeyDown}
            onClick={(e) => e.stopPropagation()}
            aria-label="Edit task name"
          />
        ) : (
          <span
            className={`task-row__name ${completed ? 'task-row__name--done' : ''}`}
            onClick={startNameEdit}
            title={completed ? undefined : 'Click to edit name'}
            role={completed ? undefined : 'button'}
            tabIndex={completed ? -1 : 0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'F2') startNameEdit(e); }}
          >
            {name}
          </span>
        )}
        {isActive && !editingName && (
          <span className="task-row__focus-pip" aria-label="Focused">● FOCUS</span>
        )}
        {isNew && !editingName && (
          <span className="task-row__new-pip" aria-label="New">✨ Next</span>
        )}
      </div>

      {/* ── Due date (click → calendar popover) ── */}
      <div className="task-row__due-cell">
        <button
          ref={dueDateRef}
          className={`task-row__due task-row__due--${dueDateStatus} ${showDatePicker ? 'task-row__due--open' : ''}`}
          onClick={openDatePicker}
          aria-label={dueDate ? `Due ${dueDateLabel} — click to change` : 'Set due date'}
          aria-haspopup="dialog"
          aria-expanded={showDatePicker}
        >
          {dueDateLabel ? (
            <>
              {dueDateLabel}
              {dueDateStatus === 'overdue' && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                  className="task-row__overdue-icon" aria-hidden="true">
                  <circle cx="5" cy="5" r="4.5" stroke="currentColor" strokeWidth="1"/>
                  <path d="M5 2.5V5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <circle cx="5" cy="7" r="0.5" fill="currentColor"/>
                </svg>
              )}
            </>
          ) : (
            <span className="task-row__due--placeholder">Set date</span>
          )}
        </button>
        {recurrence && !showDatePicker && (
          <span className="task-row__rec-pip" title={recurrenceLabel ?? ''} aria-hidden="true">🔁</span>
        )}
      </div>

      {/* ── Project badge (My Tasks only — click → project picker) ── */}
      {showProject && (
        <div className="task-row__project-cell">
          <button
            ref={projectRef}
            className={`task-row__project-btn ${showProjectPicker ? 'task-row__picker-btn--open' : ''}`}
            onClick={openProjectPicker}
            aria-label={`Project: ${currentProject?.name ?? projectId} — click to change`}
            aria-haspopup="listbox"
            aria-expanded={showProjectPicker}
          >
            <span
              className="task-row__project-dot"
              style={{ backgroundColor: currentProject?.color ?? '#7c6af7' }}
              aria-hidden="true"
            />
            <span
              className="task-row__project-name"
              style={{ color: currentProject?.color ?? '#7c6af7' }}
            >
              {currentProject?.name ?? projectId}
            </span>
            <span className="task-row__chevron" aria-hidden="true">▾</span>
          </button>
        </div>
      )}

      {/* ── Section badge (click → section picker) ── */}
      <div className="task-row__section-cell">
        <button
          ref={sectionRef}
          className={`task-row__section-btn ${showSectionPicker ? 'task-row__picker-btn--open' : ''}`}
          onClick={openSectionPicker}
          aria-label={`Section: ${sectionName || 'none'} — click to change`}
          aria-haspopup="listbox"
          aria-expanded={showSectionPicker}
        >
          <span className="task-row__section-name">
            {sectionName || <span className="task-row__placeholder-text">—</span>}
          </span>
          <span className="task-row__chevron" aria-hidden="true">▾</span>
        </button>
      </div>

      {/* ── Tags (click → tag picker) ── */}
      <div
        ref={tagRef}
        className={`task-row__tags task-row__tags--clickable ${showTagPicker ? 'task-row__picker-btn--open' : ''}`}
        onClick={openTagPicker}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') openTagPicker(e); }}
        aria-label={`Tags: ${tags.join(', ') || 'none'} — click to edit`}
        title="Click to edit tags"
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className={`task-row__tag ${tag === 'Quick Task' || tag === 'Quick Win' ? 'task-row__tag--quick' : ''}`}
          >
            {tag}
          </span>
        ))}
        {isQuickWin && !tags.includes('Quick Task') && (
          <span className="task-row__tag task-row__tag--quick">⚡ Quick</span>
        )}
        {tags.length === 0 && !isQuickWin && (
          <span className="task-row__tag-placeholder">+ Tag</span>
        )}
      </div>

      {/* ── Priority ── */}
      <div className="task-row__priority">
        {priority && PRIORITY_CONFIG[priority] && (
          <span className={`task-row__priority-badge ${PRIORITY_CONFIG[priority].className}`}>
            {priority}
          </span>
        )}
      </div>

      {/* ══ Popovers ══ */}
      {showDatePicker && (
        <DatePickerPopover
          dueDate={dueDate}
          recurrence={recurrence}
          position={datePickerPos}
          onSave={handleDateSave}
          onClose={() => setShowDatePicker(false)}
        />
      )}
      {showProjectPicker && (
        <InlineDropdown
          title="Move to project"
          options={projectOptions}
          selected={projectId}
          onSelect={handleProjectSelect}
          position={projectPickerPos}
          onClose={() => setShowProjectPicker(false)}
          searchPlaceholder="Find project…"
        />
      )}
      {showSectionPicker && (
        <InlineDropdown
          title="Move to section"
          options={sectionOptions}
          selected={sectionId}
          onSelect={handleSectionSelect}
          position={sectionPickerPos}
          onClose={() => setShowSectionPicker(false)}
          searchPlaceholder="Find section…"
          emptyText="No sections in this project"
        />
      )}
      {showTagPicker && (
        <InlineDropdown
          title="Edit tags"
          options={tagOptions}
          selectedValues={tags}
          onMultiChange={handleTagsChange}
          onCreate={handleTagCreate}
          position={tagPickerPos}
          onClose={() => setShowTagPicker(false)}
          multiSelect={true}
          searchPlaceholder="Filter or create tag…"
          emptyText="No tags yet — type to create one"
        />
      )}
    </div>
  );
}
