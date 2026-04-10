/**
 * App.jsx — Root component
 *
 * Two-column layout:
 *   [Sidebar 240px] | [Main content: MyTasks or ProjectView]
 *
 * State lives in useAppState().
 * Quick Win FAB is always mounted in the corner.
 */

import { useAppState } from './hooks/useAppState';
import { Sidebar } from './components/Sidebar';
import { MyTasks } from './components/MyTasks';
import { ProjectView } from './components/ProjectView';
import { QuickWinButton } from './components/QuickWinButton';
import './App.css';

function App() {
  const {
    tasks,
    projects,
    activeView,
    focusMode,
    activeTaskId,
    quickWinStreak,
    collapsedGroups,
    collapsedSections,
    allTags,
    navigateTo,
    completeTask,
    clearNewFlag,
    updateTask,
    getRandomQuickWin,
    toggleFocusMode,
    toggleGroupCollapse,
    toggleSectionCollapse,
    addTask,
    addSection,
    addProject,
    getProjectTasks,
  } = useAppState();

  const activeProject = projects.find((p) => p.id === activeView) ?? null;

  return (
    <div className="app-shell">
      {/* Fixed left sidebar */}
      <Sidebar
        projects={projects}
        activeView={activeView}
        onNavigate={navigateTo}
        onAddProject={addProject}
      />

      {/* Scrollable main content */}
      <main className="app-main" id="main-content">
        {activeView === 'my-tasks' || !activeProject ? (
          <MyTasks
            tasks={tasks}
            focusMode={focusMode}
            activeTaskId={activeTaskId}
            collapsedGroups={collapsedGroups}
            onToggleFocus={toggleFocusMode}
            onToggleGroup={toggleGroupCollapse}
            onComplete={completeTask}
            onClearNew={clearNewFlag}
            onUpdate={updateTask}
            onAdd={addTask}
            projects={projects}
            allTags={allTags}
          />
        ) : (
          <ProjectView
            project={activeProject}
            tasks={getProjectTasks(activeProject.id)}
            collapsedSections={collapsedSections}
            activeTaskId={activeTaskId}
            onToggleSection={toggleSectionCollapse}
            onComplete={completeTask}
            onClearNew={clearNewFlag}
            onUpdate={updateTask}
            onAdd={addTask}
            onAddSection={addSection}
            projects={projects}
            allTags={allTags}
          />
        )}
      </main>

      {/* Quick Win FAB — always present */}
      <QuickWinButton
        onGetQuickWin={getRandomQuickWin}
        onCompleteTask={completeTask}
        quickWinStreak={quickWinStreak}
      />
    </div>
  );
}

export default App;
