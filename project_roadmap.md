# Project Roadmap

This is a living document. Agents must append or adjust sub-tasks as needed and mark boxes (`[x]`) upon the verified completion of a feature.

## Phase 1: Architecture & Data Models
- [x] Create Product Requirements Document (`product_requirements.md`)
- [x] Define Data Architecture and Schemas (`data_schema.md`)
- [x] Define Gamification and Engagement Logic (`gamification_logic.md`)
- [x] Build Project Roadmap (`project_roadmap.md`)
- [x] Create Agent Instruction Manual (`instruction_manual.md`)

## Phase 2: Agent Configuration
- [x] Configure frontend and backend agents with the context of the workspace.
- [x] Initialize repositories, core dependencies, and project scaffolding (Vite + React in `web/`).
  - [x] Scaffold with `create-vite@latest --template react`
  - [x] Install `uuid` dependency
  - [x] Verify dev server runs at `http://localhost:5173`
- [ ] Set up linting, testing pipelines, and environment variables.

## Phase 3: Core UI & Focus Dashboard
- [x] Build baseline UI components and design system (colors, typography).
  - [x] `index.css` with full CSS custom properties, keyframe animations, scrollbar styling
  - [x] Inter font (Google Fonts), premium dark theme (#0d0f14 base)
- [x] Implement the flat "Life Zones" tagging taxonomy.
  - [x] Three zones defined: General (teal), Shopping (orange), Cleaning (purple)
  - [x] Zone color chips, section headers, and task filtering
- [x] Develop the Focus Dashboard (scrollable Asana-style list view).
  - [x] Sticky header with task count
  - [x] Zone-grouped sections with color bars and task counts
  - [x] `HealthBar` component (green/amber/red thresholds per gamification_logic.md)
- [x] Implement "Highlighter Focus Mode" toggle.
  - [x] **Override**: Does NOT blur/hide. First incomplete task gets pulsing purple glow border.
  - [x] Rest of list remains scrollable for context (per user spec)
  - [x] "● FOCUS" label on active task card
- [x] Implement "Just-in-Time" Recurrence spawning.
  - [x] No pre-filled future tasks. Next instance spawns only on task completion.
  - [x] `spawnNextRecurrence()` in `useTaskEngine.js` — calculates due date from blueprint.
  - [x] New task has fresh UUID + healthPercentage: 100 + spawn animation.
- [x] Develop "Quick Win Button" UI and functionality.
  - [x] Fixed FAB (bottom-right), coral gradient, pulsing glow animation
  - [x] Modal with random Quick Win task surface
  - [x] Momentum prompt post-completion: "Great job! Use that momentum!"
  - [x] Hidden Quick Win Streak counter (scales confetti + message intensity)
- [x] Asana-Style Advanced Task Engine & Hierarchy
  - [x] Data Model: Projects -> Sections -> Tasks
  - [x] "My Tasks" view (Grouped by relative due date) with unified column headers
  - [x] "Project" view (Grouped by Sections) with inline "+ Add Section" support
  - [x] Universal Click-to-Edit Task Rows
    - [x] Inline Task Name text editing
    - [x] Due Date Calendar Popover with Custom Recurrence engine
    - [x] Project dropdown picker (auto-adjusts valid sections)
    - [x] Section dropdown picker (filtered by active project)
    - [x] Tags multi-select dropdown with instant creation
  - [x] Advanced Section Management
    - [x] Inline React Section Renaming (replaces system popups)
    - [x] Section Reordering (Up/Down arrow handling)
    - [x] Section Deletion with inline safety confirmation
    - [x] Protected "General" bucket logic injected at index `0` for orphaned tasks
  - [x] Asana-aligned UI styling (Pill badges, mute text elements, hover interaction borders)

## Phase 4: Gamification & Sync Logic
- [x] Implement local state management and background engine for task updates.
- [x] Build Gamified "Upkeep Streaks" (Health Bars) for recurring tasks.
- [x] Integrate visual and audio micro-interactions (confetti, sounds, haptics) for Quick Wins.
- [ ] Set up differentiation between "Time Blocks" and "Quick Chores".
- [ ] Link "Time Blocks" to Reclaim.ai integration via Sync Modal.

## Phase 5: Starter Pack Ecosystem
- [x] Build JSON payload export logic for life engines.
- [x] Build 1-click import system via URL payload or file drop.
- [x] Develop the user "opt-out" unpacking UI for imported Starter Packs.
- [x] Test end-to-end integration and polish the MVP user experience.
