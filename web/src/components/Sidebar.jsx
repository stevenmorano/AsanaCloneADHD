/**
 * Sidebar.jsx
 *
 * Left navigation panel (fixed, ~240px).
 * Matches the Asana sidebar structure from the user's screenshots:
 *   - App name / logo
 *   - "My Tasks" primary link
 *   - Projects list with colored dots
 *   - "+ New Project" at bottom
 */

import './Sidebar.css';

export function Sidebar({ projects, activeView, onNavigate }) {
  function handleNewProject() {
    const name = prompt('Project name?');
    if (name?.trim()) {
      // Placeholder — project color picker would go in a modal (Phase 5)
      alert(`Project "${name}" would be created here. (Full UI coming in Phase 5)`);
    }
  }

  return (
    <nav className="sidebar" aria-label="Main navigation">
      {/* ── Logo ── */}
      <div className="sidebar__logo">
        <span className="sidebar__logo-icon" aria-hidden="true">🧠</span>
        <span className="sidebar__logo-text">FocusFlow</span>
      </div>

      {/* ── Primary Nav ── */}
      <div className="sidebar__section">
        <button
          id="nav-my-tasks"
          className={`sidebar__item ${activeView === 'my-tasks' ? 'sidebar__item--active' : ''}`}
          onClick={() => onNavigate('my-tasks')}
          aria-current={activeView === 'my-tasks' ? 'page' : undefined}
        >
          <span className="sidebar__item-icon" aria-hidden="true">🗂️</span>
          <span className="sidebar__item-label">My Tasks</span>
        </button>
      </div>

      {/* ── Divider + Projects ── */}
      <div className="sidebar__section sidebar__section--projects">
        <div className="sidebar__section-header">
          <span className="sidebar__section-label">Projects</span>
          <button
            id="sidebar-new-project"
            className="sidebar__section-action"
            onClick={handleNewProject}
            aria-label="Add new project"
            title="Add new project"
          >
            +
          </button>
        </div>

        <ul className="sidebar__project-list" role="list">
          {projects.map((project) => (
            <li key={project.id} role="listitem">
              <button
                id={`nav-project-${project.id}`}
                className={`sidebar__item ${activeView === project.id ? 'sidebar__item--active' : ''}`}
                onClick={() => onNavigate(project.id)}
                aria-current={activeView === project.id ? 'page' : undefined}
              >
                {/* Colored dot — matches Asana project indicator */}
                <span
                  className="sidebar__project-dot"
                  style={{ backgroundColor: project.color }}
                  aria-hidden="true"
                />
                <span className="sidebar__item-label">{project.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
