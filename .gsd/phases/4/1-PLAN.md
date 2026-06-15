---
phase: 4
plan: 1
wave: 1
gap_closure: false
---

# Plan 4.1: Simplify App.tsx to Layout Shell & Context Wiring

## Objective
Finalize the global `BujoContext` by orchestrating all state hooks, refactor tab components to consume `useBujo()` directly (eliminating massive prop-drilling), and shrink `App.tsx` into a lightweight, clean layout shell of under 400 lines.

## Context
Load these files for context:
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- src/App.tsx
- src/context/BujoContext.tsx
- src/features/planner/components/IndexTab.tsx
- src/features/planner/components/DailyLogTab.tsx

## Tasks

<task type="auto">
  <name>Finalize Global BujoContext State Orchestration</name>
  <files>
    src/context/BujoContext.tsx
  </files>
  <action>
    Complete `src/context/BujoContext.tsx` to integrate all hooks and manage global states.
    
    Steps:
    1. Import all custom hooks: `useBujoItems`, `useBujoSettings`, `useCollections`, `usePomodoroTimer`, `useAmbientAudio`.
    2. Move state initializers for `userXp` (loaded from `bujo_focus_xp`), `anxietyLevel` (loaded from `bujo_focus_anxiety_level`), and `currentEnergy` (loaded from `bujo_focus_current_energy`) into `BujoProvider`.
    3. Setup `useEffect` sync loops for `userXp`, `anxietyLevel`, and `currentEnergy`.
    4. Call the state hooks, passing required handlers (e.g. inject `showToast`, `setUserXp`, `setCollections` into `useBujoItems`, and inject `setUserXp`, `showToast` into `usePomodoroTimer`).
    5. Expose all state variables, setters, and hook return values in the `BujoContext.Provider` value.
  </action>
  <verify>
    npm run build
  </verify>
  <done>
    `BujoContext.tsx` exposes the complete state and compile checks succeed.
  </done>
</task>

<task type="auto">
  <name>Refactor App.tsx and Child Tabs to Consume BujoContext</name>
  <files>
    src/App.tsx
    src/features/planner/components/IndexTab.tsx
    src/features/planner/components/DailyLogTab.tsx
    src/features/planner/components/WeeklyLogTab.tsx
    src/features/planner/components/MonthlyLogTab.tsx
    src/features/planner/components/TimelineTab.tsx
    src/features/planner/components/FutureLogTab.tsx
    src/features/braindump/components/BrainDumpStation.tsx
    src/features/settings/components/SettingsTab.tsx
    src/features/collections/components/CollectionsLibrary.tsx
    src/features/focus/components/FocusMode.tsx
  </files>
  <action>
    Wire the application to the new Context Provider and clean up prop-drilling in components.
    
    Steps:
    1. Update the tabs (like `IndexTab`, `DailyLogTab`, etc.) to get their props from `useBujo()` instead of parameters.
    2. In `App.tsx`, wrap the output JSX inside `<BujoProvider>`.
    3. Retrieve UI layout states and hooks controls from `useBujo()` inside `App`.
    4. Delete all prop definitions in `<IndexTab />`, `<DailyLogTab />`, etc. inside `App.tsx` and render them as prop-less elements (or passing only parent layout callbacks where necessary).
    5. Remove the duplicate states, refs, handlers, and sync effects from `App.tsx`.
  </action>
  <verify>
    npm run build
  </verify>
  <done>
    The component tree consumes the context, redundant code is removed, and the build compiles successfully.
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] `src/App.tsx` is reduced to under 400 lines.
- [ ] Tab components retrieve properties directly from context hook.
- [ ] Local storage serialization continues to work on state changes.

## Success Criteria
- [ ] No compilation or TypeScript errors
- [ ] Build passes cleanly
