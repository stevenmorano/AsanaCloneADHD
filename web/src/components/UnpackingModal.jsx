import { useState } from 'react';
import './UnpackingModal.css';

export function UnpackingModal({ payload, onClose, onImport }) {
  const { packName, description, lifeZones = [], tasks = [] } = payload;

  // By default, select everything
  const [selectedZones, setSelectedZones] = useState(() => 
    new Set(lifeZones.map(z => z.id))
  );
  const [selectedTasks, setSelectedTasks] = useState(() => 
    new Set(tasks.map(t => t.id))
  );

  function toggleZone(zoneId) {
    const nextZones = new Set(selectedZones);
    if (nextZones.has(zoneId)) {
      nextZones.delete(zoneId);
      // Auto unselect all tasks in this zone
      const nextTasks = new Set(selectedTasks);
      tasks.forEach(t => {
        if (t.projectId === zoneId) nextTasks.delete(t.id);
        if (t.lifeZones && t.lifeZones.includes(zoneId)) nextTasks.delete(t.id);
      });
      setSelectedTasks(nextTasks);
    } else {
      nextZones.add(zoneId);
      // Auto select all tasks in this zone
      const nextTasks = new Set(selectedTasks);
      tasks.forEach(t => {
        if (t.projectId === zoneId) nextTasks.add(t.id);
        if (t.lifeZones && t.lifeZones.includes(zoneId)) nextTasks.add(t.id);
      });
      setSelectedTasks(nextTasks);
    }
    setSelectedZones(nextZones);
  }

  function toggleTask(taskId) {
    const next = new Set(selectedTasks);
    if (next.has(taskId)) next.delete(taskId);
    else next.add(taskId);
    setSelectedTasks(next);
  }

  function handleImport() {
    const filteredZones = lifeZones.filter(z => selectedZones.has(z.id));
    const filteredTasks = tasks.filter(t => selectedTasks.has(t.id));
    onImport(filteredZones, filteredTasks);
  }

  return (
    <div className="unpack-overlay">
      <div className="unpack-modal" role="dialog" aria-modal="true" aria-labelledby="unpack-title">
        <header className="unpack-header">
          <span className="unpack-icon" aria-hidden="true">📦</span>
          <div className="unpack-header-text">
            <h2 id="unpack-title">Unpack Starter Pack</h2>
            <p className="unpack-subtitle">{packName || "Unknown Pack"}</p>
          </div>
          <button className="unpack-close" onClick={onClose} aria-label="Cancel">✕</button>
        </header>

        <div className="unpack-body">
          <p className="unpack-desc">{description || "Review the items below and uncheck anything you don't want to import."}</p>

          <div className="unpack-lists">
            {lifeZones.map(zone => {
              const zoneTasks = tasks.filter(t => t.projectId === zone.id || (t.lifeZones && t.lifeZones.includes(zone.id)));
              
              return (
                <div key={zone.id} className="unpack-zone">
                  <label className="unpack-label unpack-label--zone">
                    <input 
                      type="checkbox" 
                      checked={selectedZones.has(zone.id)}
                      onChange={() => toggleZone(zone.id)}
                    />
                    <span 
                      className="unpack-zone-dot" 
                      style={{ backgroundColor: zone.colorTheme || '#a78bfa' }}
                    />
                    <strong>{zone.name}</strong> 
                    <span className="unpack-count">({zoneTasks.length} tasks)</span>
                  </label>

                  {selectedZones.has(zone.id) && zoneTasks.length > 0 && (
                    <div className="unpack-task-list">
                      {zoneTasks.map(task => (
                        <label key={task.id} className="unpack-label unpack-label--task">
                          <input 
                            type="checkbox" 
                            checked={selectedTasks.has(task.id)}
                            onChange={() => toggleTask(task.id)}
                          />
                          <span className="unpack-task-name">{task.name || task.title}</span>
                          {task.recurrence && (
                            <span className="unpack-task-recur">({task.recurrence.intervalValue} {task.recurrence.intervalType})</span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <footer className="unpack-footer">
          <span className="unpack-summary">
            Importing {selectedZones.size} projects and {selectedTasks.size} tasks.
          </span>
          <div className="unpack-actions">
            <button className="unpack-btn unpack-btn--cancel" onClick={onClose}>Cancel</button>
            <button className="unpack-btn unpack-btn--import" onClick={handleImport}>Import Engine</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
