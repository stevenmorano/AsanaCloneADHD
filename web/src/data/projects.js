/**
 * projects.js
 * 
 * Universal project + section taxonomy for the ADHD Task Engine.
 * These are the 6 default projects all users get on signup.
 * Users can add custom projects beyond these.
 * 
 * Section naming follows the user's Asana structure so that
 * task names like "Home - Apartment - Vacuum Living Room" map
 * cleanly to projectId: 'home', sectionId: 'apartment'.
 */

export const PROJECTS = [
  {
    id: 'general',
    name: 'General',
    color: '#4ecdc4',
    colorSoft: 'rgba(78, 205, 196, 0.12)',
    icon: '🗂️',
    sections: [
      { id: 'inbox',  name: 'Inbox' },
      { id: 'weekly', name: 'Weekly Review' },
      { id: 'goals',  name: 'Goals' },
    ],
  },
  {
    id: 'home',
    name: 'Home',
    color: '#a78bfa',
    colorSoft: 'rgba(167, 139, 250, 0.12)',
    icon: '🏠',
    sections: [
      { id: 'apartment',  name: 'Apartment' },
      { id: 'kitchen',    name: 'Kitchen' },
      { id: 'bedroom',    name: 'Bedroom' },
      { id: 'bathroom',   name: 'Bathroom' },
      { id: 'outdoor',    name: 'Outdoor' },
      { id: 'computers',  name: 'Computers' },
    ],
  },
  {
    id: 'shopping',
    name: 'Shopping',
    color: '#f97316',
    colorSoft: 'rgba(249, 115, 22, 0.12)',
    icon: '🛒',
    sections: [
      { id: 'groceries',  name: 'Groceries' },
      { id: 'household',  name: 'Household' },
      { id: 'personal',   name: 'Personal Care' },
      { id: 'family',     name: 'Family' },
      { id: 'clothing',   name: 'Clothing' },
    ],
  },
  {
    id: 'finance',
    name: 'Finance',
    color: '#22c55e',
    colorSoft: 'rgba(34, 197, 94, 0.12)',
    icon: '💰',
    sections: [
      { id: 'bills',        name: 'Bills & Utilities' },
      { id: 'credit_cards', name: 'Credit Cards' },
      { id: 'banks',        name: 'Banks' },
      { id: 'taxes',        name: 'Taxes' },
      { id: 'subscriptions',name: 'Subscriptions' },
    ],
  },
  {
    id: 'health',
    name: 'Health',
    color: '#ec4899',
    colorSoft: 'rgba(236, 72, 153, 0.12)',
    icon: '❤️',
    sections: [
      { id: 'medications',   name: 'Medications' },
      { id: 'appointments',  name: 'Appointments' },
      { id: 'fitness',       name: 'Fitness' },
      { id: 'mental_health', name: 'Mental Health' },
    ],
  },
  {
    id: 'work',
    name: 'Work',
    color: '#3b82f6',
    colorSoft: 'rgba(59, 130, 246, 0.12)',
    icon: '💼',
    sections: [
      { id: 'projects',  name: 'Projects' },
      { id: 'meetings',  name: 'Meetings' },
      { id: 'admin',     name: 'Admin' },
      { id: 'learning',  name: 'Learning' },
    ],
  },
];

/** Quick lookup helpers */
export function getProject(projectId) {
  return PROJECTS.find((p) => p.id === projectId) ?? null;
}

export function getSection(projectId, sectionId) {
  const project = getProject(projectId);
  return project?.sections.find((s) => s.id === sectionId) ?? null;
}
