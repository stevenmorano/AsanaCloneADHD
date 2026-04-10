/**
 * MyTasks.jsx
 *
 * Default home view — tasks grouped by due date.
 * Groups: Last 7 Days → Yesterday → Today → Tomorrow → Next 7 Days → Later → No Date
 *
 * Columns: Name | Due Date | Projects | Section | Tags | Priority
 * Every column cell is clickable/editable directly from this view.
 */

import { useState, useRef } from 'react';
import { TaskRow } from './TaskRow';
import { DATE_GROUPS, getDateGroup } from '../hooks/useAppState';
import './MyTasks.css';

/* ── Inline Add Task row ── */
function AddTaskRow({ onAdd, projectId = 'general', sectionId = 'inbox' }) {
  const [active, setActive] = useState(false);
  const [value,  setValue]  = useState('');
  const [date,   setDate]   = useState('');
  const inputRef = useRef(null);

  function activate() {
    setActive(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }
  function cancel() { setActive(false); setValue(''); setDate(''); }
  function submit() {
    if (!value.trim()) { cancel(); return; }
    onAdd({ name: value.trim(), projectId, sectionId, dueDate: date || null });
    setValue('');
    setDate('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }
  function onKeyDown(e) {
    if (e.key === 'Enter')  submit();
    if (e.key === 'Escape') cancel();
  }

  if (!active) {
    return (
      <button className="add-task-row add-task-row--trigger" onClick={activate} aria-label="Add a task">
        <span className="add-task-row__plus">+</span>
        <span>Add task</span>
      </button>
    );
  }

  return (
    <div className="add-task-row add-task-row--active">
      <span className="add-task-row__check-placeholder" aria-hidden="true" />
      <input
        ref={inputRef}
        className="add-task-row__input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Task name…"
        aria-label="New task name"
      />
      <input
        className="add-task-row__date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        aria-label="Due date"
      />
      <button className="add-task-row__save" onClick={submit}>Save</button>
      <button className="add-task-row__cancel" onClick={cancel} aria-label="Cancel">✕</button>
    </div>
  );
}

/* ── Date Group ── */
function DateGroup({
  groupKey, label, tasks, collapsedGroups, onToggle,
  activeTaskId, onComplete, onClearNew, onUpdate, onAdd,
  projects, allTags,
}) {
  const isCollapsed    = collapsedGroups[groupKey] ?? false;
  const incompleteCount = tasks.filter((t) => !t.completed).length;

  if (tasks.length === 0) return null;

  return (
    <section className="date-group" aria-labelledby={`dg-${groupKey}`}>
      <button
        id={`dg-${groupKey}`}
        className={`date-group__header ${groupKey === 'today' ? 'date-group__header--today' : ''}`}
        onClick={() => onToggle(groupKey)}
        aria-expanded={!isCollapsed}
      >
        <span className={`date-group__caret ${isCollapsed ? 'date-group__caret--collapsed' : ''}`} aria-hidden="true">▾</span>
        <span className="date-group__label">{label}</span>
        {incompleteCount > 0 && (
          <span className="date-group__count" aria-label={`${incompleteCount} tasks`}>{incompleteCount}</span>
        )}
      </button>

      {!isCollapsed && (
        <div className="date-group__tasks" role="list">
          {tasks.map((task) => (
            <div key={task.id} role="listitem">
              <TaskRow
                task={task}
                isActive={task.id === activeTaskId}
                showProject={true}
                onComplete={onComplete}
                onClearNew={onClearNew}
                onUpdate={onUpdate}
                projects={projects}
                allTags={allTags}
              />
            </div>
          ))}
          <AddTaskRow onAdd={onAdd} projectId="general" sectionId="inbox" />
        </div>
      )}
    </section>
  );
}

/* ── My Tasks ── */
export function MyTasks({
  tasks, focusMode, activeTaskId, collapsedGroups,
  onToggleFocus, onToggleGroup, onComplete, onClearNew, onUpdate, onAdd,
  projects, allTags,
}) {
  const grouped = DATE_GROUPS.reduce((acc, { key }) => {
    acc[key] = tasks.filter((t) => getDateGroup(t.dueDate) === key);
    return acc;
  }, {});

  const totalIncomplete = tasks.filter((t) => !t.completed).length;

  return (
    <div className="my-tasks">
      {/* ── Header ── */}
      <header className="my-tasks__header">
        <div className="my-tasks__header-left">
          <h1 className="my-tasks__title">My Tasks</h1>
          <p className="my-tasks__subtitle">
            {totalIncomplete > 0
              ? `${totalIncomplete} task${totalIncomplete !== 1 ? 's' : ''} remaining`
              : '🎉 All clear — nothing left to do!'}
          </p>
        </div>
        <div className="my-tasks__controls">
          <button
            id="focus-mode-toggle"
            className={`focus-toggle ${focusMode ? 'focus-toggle--active' : ''}`}
            onClick={onToggleFocus}
            aria-pressed={focusMode}
            aria-label={focusMode ? 'Disable Focus Mode' : 'Enable Focus Mode'}
          >
            <span className="focus-toggle__dot" aria-hidden="true" />
            <span>{focusMode ? '🎯 Focus ON' : '🎯 Focus Mode'}</span>
          </button>
        </div>
      </header>

      {/* ── Focus Banner ── */}
      {focusMode && activeTaskId && (
        <div className="my-tasks__focus-banner" role="status" aria-live="polite">
          <span aria-hidden="true">✨</span>
          <span>Highlighter Focus <strong>ON</strong> — your next task glows purple.</span>
        </div>
      )}

      {/* ── Column Headers ── */}
      <div className="my-tasks__col-headers" aria-hidden="true">
        <div className="col-h col-h--health" />
        <div className="col-h col-h--check" />
        <div className="col-h col-h--name">Name</div>
        <div className="col-h col-h--due">Due date ↕</div>
        <div className="col-h col-h--project">Project</div>
        <div className="col-h col-h--section">Section</div>
        <div className="col-h col-h--tags">Tags</div>
        <div className="col-h col-h--priority">Priority</div>
      </div>

      {/* ── Date Groups ── */}
      <div className="my-tasks__groups">
        {DATE_GROUPS.map(({ key, label }) => (
          <DateGroup
            key={key}
            groupKey={key}
            label={label}
            tasks={grouped[key] || []}
            collapsedGroups={collapsedGroups}
            onToggle={onToggleGroup}
            activeTaskId={activeTaskId}
            onComplete={onComplete}
            onClearNew={onClearNew}
            onUpdate={onUpdate}
            onAdd={onAdd}
            projects={projects}
            allTags={allTags}
          />
        ))}
      </div>
    </div>
  );
}
