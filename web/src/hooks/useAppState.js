/**
 * useAppState.js
 *
 * Central state hook for the ADHD Task Engine.
 *
 * Manages:
 *  - tasks (full flat list with all schema fields)
 *  - projects (static taxonomy, but user can add more)
 *  - activeView: 'my-tasks' | <projectId>
 *  - focusMode (Highlighter Focus — first incomplete task in Today gets glow)
 *  - quickWinStreak (hidden counter, scales confetti intensity)
 *
 * JIT Recurrence (from data_schema.md):
 *   completeTask() → marks done → calls spawnNextRecurrence()
 *   → inserts ONE new instance immediately after the completed task
 *   → new instance has fresh UUID + healthPercentage: 100
 */

import { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DUMMY_TASKS } from '../data/dummyTasks';
import { PROJECTS } from '../data/projects';
import { calcNextDueDate as calcNext } from '../utils/recurrenceUtils';

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

// ── Recurrence Utilities ────────────────────────────────────

function calcNextDueDate(recurrence, fromDate) {
  return calcNext(recurrence, fromDate);
}

function spawnNextRecurrence(blueprint) {
  if (!blueprint.recurrence) return null;
  const completedAt = new Date().toISOString();
  return {
    ...blueprint,
    id: uuidv4(),
    completed: false,
    healthPercentage: 100,
    lastCompletedAt: completedAt,
    createdAt: completedAt,
    dueDate: calcNextDueDate(blueprint.recurrence, new Date()),
    isNew: true,
  };
}

// ── Main Hook ───────────────────────────────────────────────

export function useAppState() {
  const [tasks, setTasks] = useState(DUMMY_TASKS);
  const [projects, setProjects] = useState(PROJECTS);
  const [activeView, setActiveView] = useState('my-tasks'); // 'my-tasks' | projectId
  const [focusMode, setFocusMode] = useState(false);
  const [quickWinStreak, setQuickWinStreak] = useState(0);
  // Tracks which date groups are collapsed {groupKey: bool}
  const [collapsedGroups, setCollapsedGroups] = useState({
    last_7_days: true,   // default: past collapsed
    yesterday: false,
    today: false,
    tomorrow: false,
    next_7_days: false,
    later: true,
    no_date: true,
  });
  // Tracks which project sections are collapsed {sectionId: bool}
  const [collapsedSections, setCollapsedSections] = useState({});

  // ── Completion & Recurrence ─────────────────────────────

  const completeTask = useCallback((taskId) => {
    let completedTask = null;

    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === taskId);
      if (idx === -1 || prev[idx].completed) return prev;

      const task = prev[idx];
      completedTask = task;
      const updated = [...prev];
      updated[idx] = { ...task, completed: true };

      // JIT Recurrence — spawn ONE next instance
      const next = spawnNextRecurrence(task);
      if (next) updated.splice(idx + 1, 0, next);

      return updated;
    });

    // Update streak after state settles
    if (completedTask?.isQuickWin) {
      setQuickWinStreak((s) => s + 1);
    } else {
      setQuickWinStreak(0);
    }
  }, []);

  const clearNewFlag = useCallback((taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isNew: false } : t))
    );
  }, []);

  // ── Quick Win ───────────────────────────────────────────

  const getRandomQuickWin = useCallback(() => {
    const candidates = tasks.filter((t) => t.isQuickWin && !t.completed);
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }, [tasks]);

  // ── Focus Mode ──────────────────────────────────────────

  const toggleFocusMode = useCallback(() => setFocusMode((v) => !v), []);

  const activeTaskId = useMemo(() => {
    if (!focusMode) return null;
    // Focus lands on first incomplete task due today
    const todayTasks = tasks.filter(
      (t) => !t.completed && getDateGroup(t.dueDate) === 'today'
    );
    return todayTasks[0]?.id ?? tasks.find((t) => !t.completed)?.id ?? null;
  }, [focusMode, tasks]);

  // ── Navigation ──────────────────────────────────────────

  const navigateTo = useCallback((view) => setActiveView(view), []);

  // ── Group Collapse ──────────────────────────────────────

  const toggleGroupCollapse = useCallback((key) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleSectionCollapse = useCallback((sectionId) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }, []);

  // ── Add Task (inline) ───────────────────────────────────

  const addTask = useCallback(({ name, projectId, sectionId, dueDate = null }) => {
    if (!name?.trim()) return;
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
      createdAt: new Date().toISOString(),
      lastCompletedAt: null,
      isNew: true,
    };
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  // ── Update Task (name, dueDate, recurrence, priority, etc.) ────

  const updateTask = useCallback((taskId, changes) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...changes } : t))
    );
  }, []);

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
  }, []);

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
  }, []);

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
    addProject,
    getProjectTasks,
  };
}
