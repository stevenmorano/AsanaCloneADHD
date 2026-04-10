/**
 * dummyTasks.js  (full replacement)
 *
 * Realistic seed data following the user's ACTUAL Asana naming convention:
 *   "Project - Section - Task Detail"
 * This keeps task names self-contained for Google Calendar / Reclaim.ai export.
 *
 * All due dates are computed relative to TODAY so the app always looks correct.
 *
 * Schema follows data_schema.md exactly.
 * Health percentages are set to demo all three gamification states.
 */

import { v4 as uuidv4 } from 'uuid';

/** Compute an ISO date string N days offset from today */
function d(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
}

const now = new Date().toISOString();

function task(overrides) {
  return {
    id: uuidv4(),
    name: '',
    projectId: 'general',
    sectionId: 'inbox',
    dueDate: null,
    tags: [],
    priority: null,          // null | 'High' | 'Medium' | 'Low'
    isQuickWin: false,
    type: 'quick_chore',     // 'quick_chore' | 'time_block'
    recurrence: null,        // null | { intervalValue, intervalType, degradationRate }
    healthPercentage: 100,
    completed: false,
    createdAt: now,
    lastCompletedAt: null,
    isNew: false,
    ...overrides,
  };
}

export const DUMMY_TASKS = [

  // ──────────────────────────────────────────────────────────
  // GENERAL
  // ──────────────────────────────────────────────────────────
  task({
    name: 'General - Download Snow Photos',
    projectId: 'general', sectionId: 'inbox',
    dueDate: d(0), tags: [], priority: null,
    isQuickWin: true, type: 'quick_chore',
    recurrence: null, healthPercentage: 100,
  }),
  task({
    name: 'General - Task List For Week',
    projectId: 'general', sectionId: 'weekly',
    dueDate: d(0), tags: ['Quick Task'], priority: null,
    isQuickWin: true, type: 'quick_chore',
    recurrence: { intervalValue: 7, intervalType: 'days', degradationRate: 14.3 },
    healthPercentage: 68,
  }),
  task({
    name: 'General - Review Weekly Goals',
    projectId: 'general', sectionId: 'weekly',
    dueDate: d(1), tags: [], priority: null,
    type: 'time_block',
    recurrence: { intervalValue: 7, intervalType: 'days', degradationRate: 14.3 },
    healthPercentage: 85,
  }),

  // ──────────────────────────────────────────────────────────
  // HOME — APARTMENT
  // ──────────────────────────────────────────────────────────
  task({
    name: 'Home - Apartment - Descale Moccamaster',
    projectId: 'home', sectionId: 'kitchen',
    dueDate: d(-3), tags: ['Quick Task'], priority: null,
    isQuickWin: true, type: 'quick_chore',
    recurrence: { intervalValue: 3, intervalType: 'months', degradationRate: 1.1 },
    healthPercentage: 48,
  }),
  task({
    name: 'Home - Apartment - Sharpen Knifes',
    projectId: 'home', sectionId: 'kitchen',
    dueDate: d(0), tags: ['Quick Task'], priority: null,
    isQuickWin: true, type: 'quick_chore',
    recurrence: null, healthPercentage: 100,
  }),
  task({
    name: 'Home - Apartment - Vacuum Living Room',
    projectId: 'home', sectionId: 'apartment',
    dueDate: d(1), tags: ['Quick Task'], priority: null,
    isQuickWin: true, type: 'quick_chore',
    recurrence: { intervalValue: 7, intervalType: 'days', degradationRate: 14.3 },
    healthPercentage: 62,
  }),
  task({
    name: 'Home - Apartment - Clean Stove',
    projectId: 'home', sectionId: 'kitchen',
    dueDate: d(2), tags: ['Quick Task'], priority: null,
    isQuickWin: true, type: 'quick_chore',
    recurrence: { intervalValue: 14, intervalType: 'days', degradationRate: 7.1 },
    healthPercentage: 78,
  }),
  task({
    name: 'Home - Apartment - Mop',
    projectId: 'home', sectionId: 'apartment',
    dueDate: d(2), tags: ['Quick Task'], priority: null,
    isQuickWin: true, type: 'quick_chore',
    recurrence: { intervalValue: 10, intervalType: 'days', degradationRate: 10 },
    healthPercentage: 55,
  }),
  task({
    name: 'Home - Apartment - Vacuum Bedroom',
    projectId: 'home', sectionId: 'bedroom',
    dueDate: d(4), tags: ['Quick Task'], priority: null,
    isQuickWin: true, type: 'quick_chore',
    recurrence: { intervalValue: 7, intervalType: 'days', degradationRate: 14.3 },
    healthPercentage: 72,
  }),
  task({
    name: 'Home - Apartment - Vacuum Bedroom Under Bed',
    projectId: 'home', sectionId: 'bedroom',
    dueDate: d(4), tags: ['Quick Task'], priority: null,
    isQuickWin: true, type: 'quick_chore',
    recurrence: { intervalValue: 14, intervalType: 'days', degradationRate: 7.1 },
    healthPercentage: 83,
  }),
  task({
    name: 'Home - Apartment - Dust Rooms',
    projectId: 'home', sectionId: 'apartment',
    dueDate: d(4), tags: ['Quick Task'], priority: null,
    isQuickWin: true, type: 'quick_chore',
    recurrence: { intervalValue: 7, intervalType: 'days', degradationRate: 14.3 },
    healthPercentage: 41,
  }),
  task({
    name: 'Home - Apartment - Clean Bathroom',
    projectId: 'home', sectionId: 'bathroom',
    dueDate: d(6), tags: ['Quick Task'], priority: null,
    isQuickWin: false, type: 'quick_chore',
    recurrence: { intervalValue: 7, intervalType: 'days', degradationRate: 14.3 },
    healthPercentage: 29,
  }),
  task({
    name: 'Home - Apartment - Clean Fridge/Dishwasher Exterior',
    projectId: 'home', sectionId: 'kitchen',
    dueDate: d(1), tags: ['Quick Task'], priority: 'Medium',
    isQuickWin: false, type: 'quick_chore',
    recurrence: { intervalValue: 1, intervalType: 'months', degradationRate: 3.3 },
    healthPercentage: 21,
  }),
  task({
    name: 'Home - Apartment - Clean Tub',
    projectId: 'home', sectionId: 'bathroom',
    dueDate: d(16), tags: ['Quick Task'], priority: null,
    isQuickWin: false, type: 'quick_chore',
    recurrence: { intervalValue: 3, intervalType: 'months', degradationRate: 1.1 },
    healthPercentage: 44,
  }),
  task({
    name: 'Home - Apartment - Vacuum Balcony',
    projectId: 'home', sectionId: 'outdoor',
    dueDate: d(18), tags: ['Quick Task'], priority: null,
    isQuickWin: true, type: 'quick_chore',
    recurrence: { intervalValue: 1, intervalType: 'months', degradationRate: 3.3 },
    healthPercentage: 88,
  }),

  // HOME — COMPUTERS
  task({
    name: 'Home - Computers - Check Sync',
    projectId: 'home', sectionId: 'computers',
    dueDate: d(2), tags: ['Quick Task'], priority: null,
    isQuickWin: true, type: 'quick_chore',
    recurrence: { intervalValue: 7, intervalType: 'days', degradationRate: 14.3 },
    healthPercentage: 55,
  }),
  task({
    name: 'Home - Computers - All Read',
    projectId: 'home', sectionId: 'computers',
    dueDate: d(2), tags: ['Quick Task'], priority: null,
    isQuickWin: true, type: 'quick_chore',
    recurrence: { intervalValue: 7, intervalType: 'days', degradationRate: 14.3 },
    healthPercentage: 70,
  }),
  task({
    name: 'Home - Computers - Reboot Routers/Modem',
    projectId: 'home', sectionId: 'computers',
    dueDate: d(2), tags: ['Quick Task'], priority: null,
    isQuickWin: true, type: 'quick_chore',
    recurrence: { intervalValue: 30, intervalType: 'days', degradationRate: 3.3 },
    healthPercentage: 90,
  }),

  // ──────────────────────────────────────────────────────────
  // SHOPPING
  // ──────────────────────────────────────────────────────────
  task({
    name: 'Shopping - Buy Paper Shredder',
    projectId: 'shopping', sectionId: 'household',
    dueDate: d(0), tags: [], priority: null,
    isQuickWin: false, type: 'quick_chore',
    recurrence: null, healthPercentage: 100,
  }),
  task({
    name: 'Shopping - Buy Behind the Couch Table',
    projectId: 'shopping', sectionId: 'household',
    dueDate: d(0), tags: [], priority: null,
    isQuickWin: false, type: 'quick_chore',
    recurrence: null, healthPercentage: 100,
  }),
  task({
    name: 'Shopping - Buy Descaler',
    projectId: 'shopping', sectionId: 'household',
    dueDate: d(-1), tags: [], priority: null,
    isQuickWin: false, type: 'quick_chore',
    recurrence: null, healthPercentage: 100,
  }),
  task({
    name: 'Shopping - Mom Bday Present',
    projectId: 'shopping', sectionId: 'family',
    dueDate: d(0), tags: ['Gifts'], priority: 'High',
    isQuickWin: false, type: 'quick_chore',
    recurrence: null, healthPercentage: 100,
  }),
  task({
    name: 'Shopping - Groceries - Weekly Run',
    projectId: 'shopping', sectionId: 'groceries',
    dueDate: d(2), tags: [], priority: null,
    isQuickWin: false, type: 'quick_chore',
    recurrence: { intervalValue: 7, intervalType: 'days', degradationRate: 14.3 },
    healthPercentage: 35,
  }),
  task({
    name: 'Shopping - Personal - Refill Supplements',
    projectId: 'shopping', sectionId: 'personal',
    dueDate: d(5), tags: [], priority: null,
    isQuickWin: true, type: 'quick_chore',
    recurrence: { intervalValue: 1, intervalType: 'months', degradationRate: 3.3 },
    healthPercentage: 60,
  }),
  task({
    name: 'Shopping - Clothing - Buy Running Shoes',
    projectId: 'shopping', sectionId: 'clothing',
    dueDate: null, tags: [], priority: 'Low',
    isQuickWin: false, type: 'quick_chore',
    recurrence: null, healthPercentage: 100,
  }),

  // ──────────────────────────────────────────────────────────
  // FINANCE — CREDIT CARDS
  // ──────────────────────────────────────────────────────────
  task({
    name: 'Finance - CC - Amazon',
    projectId: 'finance', sectionId: 'credit_cards',
    dueDate: d(-4), tags: [], priority: 'High',
    isQuickWin: false, type: 'quick_chore',
    recurrence: { intervalValue: 1, intervalType: 'months', degradationRate: 3.3 },
    healthPercentage: 15,
  }),
  task({
    name: 'Finance - CC - Chase Freedom',
    projectId: 'finance', sectionId: 'credit_cards',
    dueDate: d(-1), tags: [], priority: 'High',
    isQuickWin: false, type: 'quick_chore',
    recurrence: { intervalValue: 1, intervalType: 'months', degradationRate: 3.3 },
    healthPercentage: 8,
  }),
  task({
    name: 'Finance - CC - Chase Sapphire',
    projectId: 'finance', sectionId: 'credit_cards',
    dueDate: d(7), tags: [], priority: 'High',
    isQuickWin: false, type: 'quick_chore',
    recurrence: { intervalValue: 1, intervalType: 'months', degradationRate: 3.3 },
    healthPercentage: 72,
  }),

  // FINANCE — TAXES
  task({
    name: 'Finance - Taxes - File By Reminder',
    projectId: 'finance', sectionId: 'taxes',
    dueDate: d(3), tags: [], priority: 'High',
    isQuickWin: false, type: 'time_block',
    recurrence: { intervalValue: 1, intervalType: 'years', degradationRate: 0.27 },
    healthPercentage: 22,
  }),
  task({
    name: 'Finance - Taxes - Get All Documents Reminder',
    projectId: 'finance', sectionId: 'taxes',
    dueDate: d(40), tags: [], priority: null,
    isQuickWin: false, type: 'time_block',
    recurrence: { intervalValue: 1, intervalType: 'years', degradationRate: 0.27 },
    healthPercentage: 90,
  }),
  task({
    name: 'Finance - Taxes - Start Reminder',
    projectId: 'finance', sectionId: 'taxes',
    dueDate: d(40), tags: [], priority: null,
    isQuickWin: false, type: 'time_block',
    recurrence: null, healthPercentage: 100,
  }),

  // FINANCE — SUBSCRIPTIONS
  task({
    name: 'Finance - Subscriptions - Review & Cancel Unused',
    projectId: 'finance', sectionId: 'subscriptions',
    dueDate: d(10), tags: ['Quick Task'], priority: null,
    isQuickWin: false, type: 'quick_chore',
    recurrence: { intervalValue: 3, intervalType: 'months', degradationRate: 1.1 },
    healthPercentage: 55,
  }),

  // FINANCE — BILLS
  task({
    name: 'Finance - Bills - Pay Electricity',
    projectId: 'finance', sectionId: 'bills',
    dueDate: d(5), tags: [], priority: 'Medium',
    isQuickWin: false, type: 'quick_chore',
    recurrence: { intervalValue: 1, intervalType: 'months', degradationRate: 3.3 },
    healthPercentage: 65,
  }),

  // ──────────────────────────────────────────────────────────
  // HEALTH
  // ──────────────────────────────────────────────────────────
  task({
    name: 'Health - Medications - Take Daily Meds',
    projectId: 'health', sectionId: 'medications',
    dueDate: d(0), tags: ['Quick Task'], priority: 'High',
    isQuickWin: true, type: 'quick_chore',
    recurrence: { intervalValue: 1, intervalType: 'days', degradationRate: 100 },
    healthPercentage: 12,
  }),
  task({
    name: 'Health - Medications - Refill Prescription',
    projectId: 'health', sectionId: 'medications',
    dueDate: d(21), tags: [], priority: 'Medium',
    isQuickWin: false, type: 'quick_chore',
    recurrence: { intervalValue: 1, intervalType: 'months', degradationRate: 3.3 },
    healthPercentage: 78,
  }),
  task({
    name: 'Health - Appointments - Annual Physical',
    projectId: 'health', sectionId: 'appointments',
    dueDate: d(30), tags: [], priority: null,
    isQuickWin: false, type: 'time_block',
    recurrence: { intervalValue: 1, intervalType: 'years', degradationRate: 0.27 },
    healthPercentage: 92,
  }),
  task({
    name: 'Health - Fitness - Workout',
    projectId: 'health', sectionId: 'fitness',
    dueDate: d(0), tags: ['Quick Task'], priority: null,
    isQuickWin: false, type: 'time_block',
    recurrence: { intervalValue: 2, intervalType: 'days', degradationRate: 50 },
    healthPercentage: 45,
  }),
  task({
    name: 'Health - Mental Health - Journal',
    projectId: 'health', sectionId: 'mental_health',
    dueDate: d(0), tags: ['Quick Task'], priority: null,
    isQuickWin: true, type: 'quick_chore',
    recurrence: { intervalValue: 1, intervalType: 'days', degradationRate: 100 },
    healthPercentage: 30,
  }),

  // ──────────────────────────────────────────────────────────
  // WORK
  // ──────────────────────────────────────────────────────────
  task({
    name: 'Work - Admin - Respond to Emails',
    projectId: 'work', sectionId: 'admin',
    dueDate: d(0), tags: [], priority: null,
    isQuickWin: false, type: 'time_block',
    recurrence: { intervalValue: 2, intervalType: 'days', degradationRate: 50 },
    healthPercentage: 40,
  }),
  task({
    name: 'Work - Admin - LinkedIn - Check',
    projectId: 'work', sectionId: 'admin',
    dueDate: d(4), tags: ['Quick Task'], priority: null,
    isQuickWin: true, type: 'quick_chore',
    recurrence: { intervalValue: 7, intervalType: 'days', degradationRate: 14.3 },
    healthPercentage: 70,
  }),
  task({
    name: 'Work - Learning - Read Industry Article',
    projectId: 'work', sectionId: 'learning',
    dueDate: d(3), tags: [], priority: 'Low',
    isQuickWin: false, type: 'time_block',
    recurrence: { intervalValue: 7, intervalType: 'days', degradationRate: 14.3 },
    healthPercentage: 82,
  }),
  task({
    name: 'Work - Meetings - Weekly Sync Prep',
    projectId: 'work', sectionId: 'meetings',
    dueDate: d(6), tags: [], priority: null,
    isQuickWin: false, type: 'time_block',
    recurrence: { intervalValue: 7, intervalType: 'days', degradationRate: 14.3 },
    healthPercentage: 95,
  }),
];
