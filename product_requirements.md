# Product Requirements Document: ADHD Task Engine

## Core Philosophy
We are building a simplified, gamified spinoff of traditional project management tools. The philosophy is "low-friction dopamine engine." Instead of a comprehensive database for organizing every detail of a project, the goal is to break through executive dysfunction, sustain motivation, and make baseline life maintenance engaging.

## 1. Life Zones (Flat Taxonomy)
- **Concept**: Flatten traditional nested "Projects" and "Sections" into pre-built, broad "Life Zones" (e.g., *Home & Chores*, *Shopping*, *Life Admin*, *Health & Body*).
- **Behavior**: Users do not build complex hierarchical structures. They simply tag tasks to one or more Life Zones. The system relies entirely on these zones for categorization and filtering.

## 2. Focus Dashboard & Focus Mode
- **Overview**: The main view must aggressively filter out noise to prevent overwhelm. It presents a single, unified timeline of upcoming actionable items.
- **Focus Mode Toggle**: When activated, the interface blurs, dims, or completely hides everything except the **absolute next task**. This eliminates the cognitive load of deciding "what to do next" or scanning a long list.

## 3. The "Quick Win" Button
- **Overview**: An emergency "break-glass" button for moments of severe task paralysis.
- **Behavior**: Clicking this button instantly surfaces one random, low-effort task marked as a "Quick Win" (e.g., "Refill water bottle", "Take out trash") taking under 5 minutes. Completing it is designed to build momentum.

## 4. Time Blocks vs. Quick Chores
- **Time Blocks**: Tasks meant for sustained effort (e.g., "Deep Work - 45 mins", "Study Math"). These are automatically routed and synced to a connected **Google Calendar** to reserve the time.
- **Quick Chores**: Minor housekeeping tasks (e.g., "Vacuum", "Water Plants", "Load Dishwasher"). These stay *purely inside the app* to avoid cluttering the external calendar with 5-minute entries.

## 5. Starter Packs (1-Click Import)
- **Overview**: A frictionless onboarding system to completely bypass the initial "setup phase" (which often triggers friction and abandonment). 
- **Behavior**: Users can click a URL containing a Starter Pack payload. This injects a pre-built recurring life engine (routines, common chores, basic life admin) into their account. Users simply "opt-out" (uncheck or delete) the tasks that don't apply to them, skipping the anxiety of a blank canvas empty-state.
