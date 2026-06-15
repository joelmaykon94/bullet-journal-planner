---
phase: 3
plan: 3
wave: 1
gap_closure: false
---

# Plan 3.3: Extract Pomodoro Timer State Hook

## Objective
Extract the Pomodoro timer states (time, running status, work/break mode, completed sessions count), alarm sounds, and ticking loop from `App.tsx` into a dedicated, reusable `usePomodoroTimer.ts` hook to decouple focus logic from layouts.

## Context
Load these files for context:
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- src/App.tsx (Pomodoro states, ticking effects, and beep sound generators)

## Tasks

<task type="auto">
  <name>Create usePomodoroTimer Custom Hook</name>
  <files>
    src/hooks/usePomodoroTimer.ts
  </files>
  <action>
    Create the custom hook in `src/hooks/usePomodoroTimer.ts` to encapsulate all Pomodoro timer behaviors.
    
    Steps:
    1. Import `useState`, `useEffect` from 'react'.
    2. Define states: `pomodoroTime` (default 25 * 60), `pomodoroRunning` (false), `pomodoroMode` ('work'), and `completedPomodoros` (loaded from localStorage `bujo_focus_completed_pomodoros`).
    3. Implement sound and vibration actions:
       - `playBeep`: synthesizes beep sound via Web Audio API.
       - Vibration trigger checking `navigator.vibrate`.
    4. Implement tick effect using `useEffect` with 1-second interval when running:
       - Decrements `pomodoroTime`.
       - On time hitting 0, stops timer, plays beep/vibrates, and triggers phase transition (work -> break, or break -> work) along with toasts.
       - Hook calls injected callbacks `onWorkComplete` (to add XP) and `showToast` (for metrics toasts).
    5. Sync `completedPomodoros` to `bujo_focus_completed_pomodoros` in localStorage.
    6. Return timer state and controls: `pomodoroTime`, `setPomodoroTime`, `pomodoroRunning`, `setPomodoroRunning`, `pomodoroMode`, `completedPomodoros`.
  </action>
  <verify>
    npm run build
  </verify>
  <done>
    `src/hooks/usePomodoroTimer.ts` is created and compiles cleanly.
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Pomodoro ticking updates time correctly and switches between work (25m) and break (5m).
- [ ] Beep alarm synthesizes correctly at the end of sessions.
- [ ] Completed sessions increments and saves to local storage.

## Success Criteria
- [ ] Hook created successfully
- [ ] Build passes cleanly
