/**
 * ProjectView.jsx
 *
 * Individual project view — tasks grouped by section.
 * Features added:
 *   - "+ Add Section" button at the bottom (inline name input)
 *   - Passes projects + allTags to TaskRow for inline editing
 *   - Section column NOT shown per-row (section is the group header here)
 *   - TaskRow showProject=false (project is already the page title)
 */

import { useState } from 'react';
import { TaskRow } from './TaskRow';
import './ProjectView.css';

/* ── Inline Add Task ── */
function InlineAddTask({ onAdd, projectId, sectionId }) {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');

  function activate() { setActive(true); }
  function cancel() { setActive(false); setValue(''); setDate(''); }

  function submit() {
    if (!value.trim()) { cancel(); return; }
    onAdd({ name: value.trim(), projectId, sectionId, dueDate: date || null });
    setValue('');
    setDate('');
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') cancel();
  }

  if (!active) {
    return (
      <button
        className="proj-add-task"
        onClick={activate}
        aria-label="Add task to section"
      >
        <span className="proj-add-task__plus">+</span>
        <span>Add task</span>
      </button>
    );
  }

  return (
    <div className="proj-add-task proj-add-task--active">
      <span className="proj-add-task__check" aria-hidden="true" />
      <input
        autoFocus
        className="proj-add-task__input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Task name…"
        aria-label="New task name"
      />
      <input
        className="proj-add-task__date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        aria-label="Due date"
      />
      <button className="proj-add-task__save" onClick={submit}>Save</button>
      <button className="proj-add-task__cancel" onClick={cancel} aria-label="Cancel">✕</button>
    </div>
  );
}

/* ── Add Section Input ── */
function AddSectionRow({ onAdd }) {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState('');

  function activate() { setActive(true); }
  function cancel() { setActive(false); setValue(''); }

  function submit() {
    if (!value.trim()) { cancel(); return; }
    onAdd(value.trim());
    setValue('');
    cancel();
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
    if (e.key === 'Escape') { e.preventDefault(); cancel(); }
  }

  if (!active) {
    return (
      <button className="proj-add-section" onClick={activate} aria-label="Add new section">
        <span className="proj-add-section__plus">+</span>
        Add Section
      </button>
    );
  }

  return (
    <div className="proj-add-section proj-add-section--active">
      <input
        autoFocus
        className="proj-add-section__input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Section name…"
        aria-label="New section name"
      />
      <button className="proj-add-section__save" onClick={submit}>Add</button>
      <button className="proj-add-section__cancel" onClick={cancel} aria-label="Cancel">✕</button>
    </div>
  );
}

/* ── ProjectView ── */
export function ProjectView({
  project,
  tasks,
  collapsedSections,
  activeTaskId,
  onToggleSection,
  onComplete,
  onClearNew,
  onUpdate,
  onAdd,
  onAddSection,
  onUpdateSection,
  onDeleteSection,
  onMoveSection,
  projects = [],
  allTags = [],
}) {
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editSectionValue, setEditSectionValue] = useState("");
  const [deletingSectionId, setDeletingSectionId] = useState(null);

  function getTasksForSection(sectionId) {
    return tasks.filter((t) => t.sectionId === sectionId);
  }

  const totalIncomplete = tasks.filter((t) => !t.completed).length;

  return (
    <div className="project-view">
      {/* ── Project Header ── */}
      <header className="project-view__header">
        <div className="project-view__header-left">
          <span
            className="project-view__color-icon"
            style={{ backgroundColor: project.color }}
            aria-hidden="true"
          >
            {project.icon}
          </span>
          <div>
            <h1 className="project-view__title" style={{ color: project.color }}>
              {project.name}
            </h1>
            <p className="project-view__subtitle">
              {totalIncomplete > 0
                ? `${totalIncomplete} task${totalIncomplete !== 1 ? 's' : ''} remaining`
                : '🎉 All tasks completed!'}
            </p>
          </div>
        </div>
      </header>

      {/* ── Column Headers ── */}
      <div className="project-view__col-headers" aria-hidden="true">
        <div className="pv-col pv-col--health" />
        <div className="pv-col pv-col--check" />
        <div className="pv-col pv-col--name">Name</div>
        <div className="pv-col pv-col--due">Due date ↕</div>
        <div className="pv-col pv-col--section">Section</div>
        <div className="pv-col pv-col--tags">Tags</div>
        <div className="pv-col pv-col--type">Type</div>
        <div className="pv-col pv-col--priority">Priority</div>
      </div>


      {/* ── Sections ── */}
      <div className="project-view__sections">
        {project.sections.map((section) => {
          const sectionTasks = getTasksForSection(section.id);
          const isCollapsed = collapsedSections[section.id] ?? false;
          const incompleteCount = sectionTasks.filter((t) => !t.completed).length;

          return (
            <section
              key={section.id}
              className="proj-section"
              aria-labelledby={`section-${section.id}`}
            >
              {/* Section header container */}
              <div className="proj-section__header-wrapper">
                <div
                  id={`section-${section.id}`}
                  className="proj-section__header"
                  onClick={() => onToggleSection(section.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onToggleSection(section.id);
                    }
                  }}
                  aria-expanded={!isCollapsed}
                  role="button"
                  tabIndex="0"
                >
                  <span
                    className={`proj-section__caret ${isCollapsed ? 'proj-section__caret--collapsed' : ''}`}
                    aria-hidden="true"
                  >
                    ▾
                  </span>

                  {editingSectionId === section.id ? (
                    <input
                      type="text"
                      className="proj-section__name-input"
                      value={editSectionValue}
                      onChange={(e) => setEditSectionValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') {
                          if (editSectionValue.trim() !== section.name) {
                            onUpdateSection?.(project.id, section.id, editSectionValue);
                          }
                          setEditingSectionId(null);
                        }
                        if (e.key === 'Escape') setEditingSectionId(null);
                      }}
                      autoFocus
                      onBlur={() => {
                        if (editSectionValue.trim() !== section.name) {
                          onUpdateSection?.(project.id, section.id, editSectionValue);
                        }
                        setEditingSectionId(null);
                      }}
                    />
                  ) : (
                    <span className="proj-section__name">{section.name}</span>
                  )}

                  {incompleteCount > 0 && editingSectionId !== section.id && (
                    <span className="proj-section__count">{incompleteCount}</span>
                  )}

                  {deletingSectionId === section.id && (
                    <span className="proj-section__delete-confirm" onClick={(e) => e.stopPropagation()}>
                      <span className="proj-section__delete-warn">Delete & move tasks to General?</span>
                      <button className="confirm-btn" onClick={(e) => { e.stopPropagation(); onDeleteSection?.(project.id, section.id); setDeletingSectionId(null); }}>Yes</button>
                      <button className="cancel-btn" onClick={(e) => { e.stopPropagation(); setDeletingSectionId(null); }}>No</button>
                    </span>
                  )}
                </div>
                <div className="proj-section__actions">
                  {section.id !== 'general' && (
                    <>
                      <button
                        className="proj-section__action-btn"
                        onClick={(e) => { e.stopPropagation(); onMoveSection?.(project.id, section.id, 'up'); }}
                        aria-label="Move Section Up"
                        title="Move Up"
                      >
                        ↑
                      </button>
                      <button
                        className="proj-section__action-btn"
                        onClick={(e) => { e.stopPropagation(); onMoveSection?.(project.id, section.id, 'down'); }}
                        aria-label="Move Section Down"
                        title="Move Down"
                      >
                        ↓
                      </button>
                      <button
                        className="proj-section__action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSectionId(section.id);
                          setEditSectionValue(section.name);
                        }}
                        aria-label="Edit Section Name"
                        title="Edit Name"
                      >
                        ✎
                      </button>
                      {section.id !== 'inbox' && (
                        <button
                          className="proj-section__action-btn proj-section__action-btn--delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingSectionId(section.id);
                          }}
                          aria-label="Delete Section"
                          title="Delete Section"
                        >
                          ✕
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Task rows */}
              {!isCollapsed && (
                <div className="proj-section__tasks" role="list">
                  {sectionTasks.length === 0 ? (
                    <div className="proj-section__empty">No tasks yet</div>
                  ) : (
                    sectionTasks.map((task) => (
                      <div key={task.id} role="listitem">
                        <TaskRow
                          task={task}
                          isActive={task.id === activeTaskId}
                          showProject={false}
                          onComplete={onComplete}
                          onClearNew={onClearNew}
                          onUpdate={onUpdate}
                          projects={projects}
                          allTags={allTags}
                        />
                      </div>
                    ))
                  )}
                  <InlineAddTask
                    onAdd={onAdd}
                    projectId={project.id}
                    sectionId={section.id}
                  />
                </div>
              )}
            </section>
          );
        })}

        {/* ── Add Section ── */}
        <div className="proj-add-section-wrapper">
          <AddSectionRow onAdd={(name) => onAddSection?.(project.id, name)} />
        </div>
      </div>
    </div>
  );
}
