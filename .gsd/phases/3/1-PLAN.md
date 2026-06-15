---
phase: 3
plan: 1
wave: 1
gap_closure: false
---

# Plan 3.1: Extract Items and Settings State Hooks

## Objective
Extract bullet journal items and user settings state management along with their localStorage sync logic and handler functions from `App.tsx` into robust, typed custom hooks.

## Context
Load these files for context:
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- src/App.tsx (state definitions, sync effects, and handlers)
- src/hooks/useBujoItems.ts (skeleton hook)
- src/hooks/useBujoSettings.ts (skeleton hook)

## Tasks

<task type="auto">
  <name>Implement useBujoItems Custom Hook</name>
  <files>
    src/hooks/useBujoItems.ts
  </files>
  <action>
    Refactor `src/hooks/useBujoItems.ts` to manage BujoItem state with persistence and handlers.
    
    Steps:
    1. Import `useState`, `useEffect`, `useRef` from 'react' and `BujoItem` interface.
    2. Setup initial state lazy loader reading from `localStorage.getItem('bujo_focus_items')` with fallback default items matching the original code.
    3. Implement handler functions:
       - `handleSaveStandardInput`: adds a new rapid log entry (task, event, note) based on inputs.
       - `handleSaveEditItem`: commits inline content edits.
       - `handleDeleteItem`: removes items from state.
       - `addSubtask`, `toggleSubtask`, `deleteSubtask` to modify subtasks array of items.
    4. Implement `useEffect` syncing `items` to `bujo_focus_items` in localStorage.
    5. Return `items`, `setItems`, and all state handlers.
  </action>
  <verify>
    npm run build
  </verify>
  <done>
    `src/hooks/useBujoItems.ts` is fully implemented and compiles without errors.
  </done>
</task>

<task type="auto">
  <name>Implement useBujoSettings Custom Hook</name>
  <files>
    src/hooks/useBujoSettings.ts
  </files>
  <action>
    Refactor `src/hooks/useBujoSettings.ts` to handle theme adjustments and settings persistence.
    
    Steps:
    1. Setup initial settings lazy loader from `localStorage.getItem('bujo_focus_settings')` forcing dark theme and mono font by default.
    2. Add `useEffect` tracking adjustments to `settings` variables (highlightColor, accentColor). It must modify the DOM element `document.documentElement` styles and save values to localStorage.
    3. Return `settings`, `setSettings` state updater.
  </action>
  <verify>
    npm run build
  </verify>
  <done>
    `src/hooks/useBujoSettings.ts` is implemented and compiles successfully.
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Bujo item actions (add, delete, toggle, edit) function in hook exactly as they did in `App.tsx`.
- [ ] CSS highlight/accent variables are correctly applied to `document.documentElement` inside settings hook.
- [ ] No regression in types.

## Success Criteria
- [ ] Hooks compile successfully
- [ ] Build passes cleanly
