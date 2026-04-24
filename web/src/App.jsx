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
import { UnpackingModal } from './components/UnpackingModal';
import { exportStarterPack } from './utils/starterPackUtils';
import { useState, useRef } from 'react';
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
    updateSection,
    deleteSection,
    moveSection,
    addProject,
    getProjectTasks,
    importData,
  } = useAppState();

  const [unpackPayload, setUnpackPayload] = useState(null);
  const fileInputRef = useRef(null);

  const activeProject = projects.find((p) => p.id === activeView) ?? null;

  function handleExportPack() {
    exportStarterPack(projects, tasks);
  }

  function handleImportPackClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json.packId && json.lifeZones && json.tasks) {
          setUnpackPayload(json);
        } else {
          alert('Invalid starter pack format.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
      e.target.value = null; // reset
    };
    reader.readAsText(file);
  }

  function handleExecuteImport(zonesToImport, tasksToImport) {
    importData(zonesToImport, tasksToImport);
    setUnpackPayload(null);
  }

  return (
    <div className="app-shell">
      {/* Fixed left sidebar */}
      <Sidebar
        projects={projects}
        activeView={activeView}
        onNavigate={navigateTo}
        onAddProject={addProject}
        onExportPack={handleExportPack}
        onImportPackClick={handleImportPackClick}
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
            onUpdateSection={updateSection}
            onDeleteSection={deleteSection}
            onMoveSection={moveSection}
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

      {/* Hidden File Input for JSON Imports */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".json"
        onChange={handleFileChange}
      />

      {/* Unpacking Modal Overlay */}
      {unpackPayload && (
        <UnpackingModal
          payload={unpackPayload}
          onClose={() => setUnpackPayload(null)}
          onImport={handleExecuteImport}
        />
      )}
    </div>
  );
}

export default App;
