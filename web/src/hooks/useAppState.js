/**
 * useAppState.js
 *
 * Central state hook for the ADHD Task Engine.
 *
 * Manages:
 *  - tasks  (persisted to localStorage key: 'adhd_tasks')
 *  - projects (persisted to localStorage key: 'adhd_projects')
 *  - UI state: activeView, focusMode, quickWinStreak, collapsed groups/sections
 *
 * Phase 4 additions:
 *  - localStorage persistence via useLocalStorage
 *  - Health Bar Degradation Engine: on mount + daily tick,
 *    depletes healthPercentage on all incomplete tasks that have recurrence.
 *    degradationRate (% per day) is computed from recurrenceUtils.computeDegradationRate().
 *
 * JIT Recurrence (from data_schema.md):
 *   completeTask() → marks done → calls spawnNextRecurrence()
 *   → inserts ONE new instance immediately after the completed task
 *   → new instance has fresh UUID + healthPercentage: 100
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from './useLocalStorage';
import { DUMMY_TASKS } from '../data/dummyTasks';
import { PROJECTS } from '../data/projects';
import {
  calcNextDueDate as calcNext,
  computeDegradationRate,
} from '../utils/recurrenceUtils';

// ── Date Utilities ──────────────────────────────────────────

/** Days between today (midnight) and a given ISO date string */
function daysDiff(isoDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(isoDateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

/**
 * Date group keys for My Tasks view.
 * Order matches Asana: past → today → future
 */
export const DATE_GROUPS = [
  { key: 'last_7_days', label: 'Last 7 Days' },
  { key: 'yesterday',   label: 'Yesterday' },
  { key: 'today',       label: 'Today' },
  { key: 'tomorrow',    label: 'Tomorrow' },
  { key: 'next_7_days', label: 'Next 7 Days' },
  { key: 'later',       label: 'Later' },
  { key: 'no_date',     label: 'No Due Date' },
];

export function getDateGroup(dueDate) {
  if (!dueDate) return 'no_date';
  const diff = daysDiff(dueDate);
  if (diff < -7) return null;           // older than 7 days — not shown
  if (diff >= -7 && diff < -1) return 'last_7_days';
  if (diff === -1) return 'yesterday';
  if (diff === 0)  return 'today';
  if (diff === 1)  return 'tomorrow';
  if (diff >= 2 && diff <= 7) return 'next_7_days';
  return 'later';
}

/** Format a date string for display in the Due Date column */
export function formatDueDate(isoDateStr) {
  if (!isoDateStr) return null;
  const diff = daysDiff(isoDateStr);
  if (diff === 0) return 'Today';
  if (diff === -1) return 'Yesterday';
  if (diff === 1) return 'Tomorrow';
  const date = new Date(isoDateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Color class for due date label */
export function getDueDateStatus(isoDateStr) {
  if (!isoDateStr) return 'none';
  const diff = daysDiff(isoDateStr);
  if (diff < 0)  return 'overdue';
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  return 'future';
}

// ── Health Degradation ──────────────────────────────────────

/**
 * Given a task list, compute how many real days have passed since
 * the last recorded degradation, and reduce healthPercentage accordingly.
 *
 * `lastDegradedAt` (ISO string) is stored on each task.
 * On first run (no lastDegradedAt), we treat it as the task's createdAt.
 *
 * Returns a new tasks array with updated healthPercentage values.
 */
function applyDegradation(tasks) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return tasks.map((task) => {
    // Only degrade incomplete recurring tasks
    if (task.completed || !task.recurrence) return task;

    const rate = computeDegradationRate(task.recurrence); // % per day
    if (rate <= 0) return task;

    const referenceIso = task.lastDegradedAt || task.createdAt || now.toISOString();
    const reference = new Date(referenceIso);
    reference.setHours(0, 0, 0, 0);

    const daysPassed = Math.round((now - reference) / (1000 * 60 * 60 * 24));
    if (daysPassed <= 0) return task;

    const newHealth = Math.max(0, (task.healthPercentage ?? 100) - rate * daysPassed);
    return {
      ...task,
      healthPercentage: Math.round(newHealth * 10) / 10,
      lastDegradedAt: now.toISOString(),
    };
  });
}

// ── Recurrence Utilities ────────────────────────────────────

function spawnNextRecurrence(blueprint) {
  if (!blueprint.recurrence) return null;
  const completedAt = new Date().toISOString();
  return {
    ...blueprint,
    id: uuidv4(),
    completed: false,
    healthPercentage: 100,
    lastCompletedAt: completedAt,
    lastDegradedAt: completedAt,
    createdAt: completedAt,
    dueDate: calcNext(blueprint.recurrence, new Date()),
    isNew: true,
  };
}

// ── Main Hook ───────────────────────────────────────────────

export function useAppState() {
  // Persisted state — survives page reload
  const [tasks, setTasks] = useLocalStorage('adhd_tasks', DUMMY_TASKS);
  const [projects, setProjects] = useLocalStorage('adhd_projects', PROJECTS);

  // UI-only state (no need to persist)
  const [activeView, setActiveView] = useLocalStorage('adhd_active_view', 'my-tasks');
  const [focusMode, setFocusMode]   = useLocalStorage('adhd_focus_mode', false);
  const [quickWinStreak, setQuickWinStreak] = useLocalStorage('adhd_qw_streak', 0);
  const [collapsedGroups, setCollapsedGroups] = useLocalStorage('adhd_collapsed_groups', {
    last_7_days: true,
    yesterday: false,
    today: false,
    tomorrow: false,
    next_7_days: false,
    later: true,
    no_date: true,
  });
  const [collapsedSections, setCollapsedSections] = useLocalStorage('adhd_collapsed_sections', {});

  // ── Health Degradation Engine ───────────────────────────
  // Run once on mount to catch up any days we missed while the app was closed.
  // Then set a daily interval to run again at midnight.
  const degradationRef = useRef(false);

  useEffect(() => {
    if (degradationRef.current) return;
    degradationRef.current = true;

    // Apply immediately on mount (catch-up for days app was closed)
    setTasks((prev) => applyDegradation(prev));

    // Ensure all existing localized projects have a 'General' section at the top
    setProjects((prev) => 
      prev.map(p => {
        if (!p.sections || !p.sections.some(s => s.id === 'general')) {
          return { ...p, sections: [{ id: 'general', name: 'General' }, ...(p.sections || [])] };
        }
        return p;
      })
    );

    // Then tick every 60 seconds to catch the case the app stays open across midnight
    const interval = setInterval(() => {
      setTasks((prev) => applyDegradation(prev));
    }, 60 * 1000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Completion & Recurrence ─────────────────────────────

  const completeTask = useCallback((taskId) => {
    let isQW = false;

    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === taskId);
      if (idx === -1 || prev[idx].completed) return prev;

      const task = prev[idx];
      isQW = !!task.isQuickWin;
      const updated = [...prev];
      updated[idx] = { ...task, completed: true };

      // JIT Recurrence — spawn ONE next instance
      const next = spawnNextRecurrence(task);
      if (next) updated.splice(idx + 1, 0, next);

      return updated;
    });

    setQuickWinStreak((s) => (isQW ? s + 1 : 0));
  }, [setTasks, setQuickWinStreak]);

  const clearNewFlag = useCallback((taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isNew: false } : t))
    );
  }, [setTasks]);

  // ── Quick Win ───────────────────────────────────────────

  const getRandomQuickWin = useCallback(() => {
    const candidates = tasks.filter((t) => t.isQuickWin && !t.completed);
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }, [tasks]);

  // ── Focus Mode ──────────────────────────────────────────

  const toggleFocusMode = useCallback(() => setFocusMode((v) => !v), [setFocusMode]);

  const activeTaskId = useMemo(() => {
    if (!focusMode) return null;
    const todayTasks = tasks.filter(
      (t) => !t.completed && getDateGroup(t.dueDate) === 'today'
    );
    return todayTasks[0]?.id ?? tasks.find((t) => !t.completed)?.id ?? null;
  }, [focusMode, tasks]);

  // ── Navigation ──────────────────────────────────────────

  const navigateTo = useCallback((view) => setActiveView(view), [setActiveView]);

  // ── Group Collapse ──────────────────────────────────────

  const toggleGroupCollapse = useCallback((key) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  }, [setCollapsedGroups]);

  const toggleSectionCollapse = useCallback((sectionId) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }, [setCollapsedSections]);

  // ── Add Task (inline) ───────────────────────────────────

  const addTask = useCallback(({ name, projectId, sectionId, dueDate = null }) => {
    if (!name?.trim()) return;
    const now = new Date().toISOString();
    const newTask = {
      id: uuidv4(),
      name: name.trim(),
      projectId: projectId || 'general',
      sectionId: sectionId || 'inbox',
      dueDate,
      tags: [],
      priority: null,
      isQuickWin: false,
      type: 'quick_chore',
      recurrence: null,
      healthPercentage: 100,
      completed: false,
      createdAt: now,
      lastCompletedAt: null,
      lastDegradedAt: now,
      isNew: true,
    };
    setTasks((prev) => [newTask, ...prev]);
  }, [setTasks]);

  // ── Update Task (name, dueDate, recurrence, priority, etc.) ──

  const updateTask = useCallback((taskId, changes) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...changes } : t))
    );
  }, [setTasks]);

  // ── Add Section to an existing project ──────────────────

  const addSection = useCallback((projectId, name) => {
    if (!name?.trim()) return;
    const id = name.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, sections: [...p.sections, { id, name: name.trim() }] }
          : p
      )
    );
  }, [setProjects]);

  const updateSection = useCallback((projectId, sectionId, newName) => {
    if (!newName?.trim()) return;
    setProjects((prev) => prev.map((p) => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        sections: p.sections.map((s) => s.id === sectionId ? { ...s, name: newName.trim() } : s)
      };
    }));
  }, [setProjects]);

  const deleteSection = useCallback((projectId, sectionId) => {
    let fallbackSectionId = 'general';
    setProjects((prev) => prev.map((p) => {
      if (p.id !== projectId) return p;
      let filtered = p.sections.filter((s) => s.id !== sectionId);
      // Enforce general always exists to catch deleted items
      if (!filtered.some(s => s.id === 'general')) {
        filtered.unshift({ id: 'general', name: 'General' });
      }
      return { ...p, sections: filtered };
    }));
    
    setTasks(prev => prev.map(t => 
      (t.projectId === projectId && t.sectionId === sectionId) 
        ? { ...t, sectionId: fallbackSectionId } 
        : t
    ));
  }, [setProjects, setTasks]);

  const moveSection = useCallback((projectId, sectionId, direction) => {
    setProjects((prev) => prev.map((p) => {
      if (p.id !== projectId) return p;
      const idx = p.sections.findIndex(s => s.id === sectionId);
      if (idx === -1 || sectionId === 'general') return p; // Cannot move General
      
      const newSections = [...p.sections];
      // Cannot slide up past General (which is at index 0)
      if (direction === 'up' && idx > 1) {
        [newSections[idx - 1], newSections[idx]] = [newSections[idx], newSections[idx - 1]];
      } else if (direction === 'down' && idx < newSections.length - 1) {
        [newSections[idx + 1], newSections[idx]] = [newSections[idx], newSections[idx + 1]];
      }
      return { ...p, sections: newSections };
    }));
  }, [setProjects]);

  // ── All Tags — computed from task list ──────────────────

  const allTags = useMemo(() => {
    const tagSet = new Set();
    tasks.forEach((t) => (t.tags || []).forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [tasks]);

  // ── Add Project ─────────────────────────────────────────

  const addProject = useCallback(({ name, color, icon }) => {
    const id = name.toLowerCase().replace(/\s+/g, '_');
    setProjects((prev) => [
      ...prev,
      {
        id,
        name,
        color: color || '#7c6af7',
        colorSoft: 'rgba(124, 106, 247, 0.12)',
        icon: icon || '📁',
        sections: [{ id: 'general', name: 'General' }],
      },
    ]);
  }, [setProjects]);

  const importData = useCallback((importedZones, importedTasks) => {
    // Prevent ID collisions mapping old project IDs to new ones
    const idMap = {};
    const newProjects = importedZones.map(zone => {
      const newId = `project_${uuidv4().substring(0, 8)}`;
      idMap[zone.id] = newId;
      return {
        id: newId,
        name: zone.name,
        color: zone.colorTheme || '#10b981',
        icon: zone.icon || '📦',
        sections: zone.sections || [{ id: 'general', name: 'General' }]
      };
    });

    const newTasks = importedTasks.map(t => ({
      ...t,
      id: uuidv4(), // fresh ID
      projectId: idMap[t.projectId] || 'general',
      completed: false,
      healthPercentage: 100,
      createdAt: new Date().toISOString()
    }));

    setProjects(prev => [...prev, ...newProjects]);
    setTasks(prev => [...prev, ...newTasks]);
  }, [setProjects, setTasks]);

  // ── Computed: tasks for a project view ─────────────────

  const getProjectTasks = useCallback(
    (projectId) => tasks.filter((t) => t.projectId === projectId),
    [tasks]
  );

  return {
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
    importData,
    getProjectTasks,
  };
}
