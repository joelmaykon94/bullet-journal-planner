---
phase: 2
plan: 2
wave: 2
gap_closure: false
---

# Plan 2.2: Refactor UI Components to Consume Ambient Audio Hook

## Objective
Update the main `App.tsx` layout and its child tabs to consume the new `useAmbientAudio` custom hook, removing the monolithic audio synthesis code and significantly shrinking `App.tsx`.

## Context
Load these files for context:
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- src/App.tsx
- src/hooks/useAmbientAudio.ts
- src/features/planner/components/IndexTab.tsx

## Tasks

<task type="auto">
  <name>Refactor App.tsx to Consume useAmbientAudio Hook</name>
  <files>
    src/App.tsx
  </files>
  <action>
    Integrate `useAmbientAudio` hook inside `App.tsx` and delete the redundant monolithic audio implementation.
    
    Steps:
    1. Import `useAmbientAudio` from `./hooks/useAmbientAudio`.
    2. Replace local state hooks `soundType`, `ambientPlaying`, and `ambientVolume` with calls to `useAmbientAudio(showToast)`.
    3. Delete refs `audioCtxRef`, `gainNodeRef`, `audioSourcesRef`.
    4. Delete functions `startAmbientAudio`, `stopAmbientAudio`, and `toggleAmbientAudio`.
    5. Delete the three `useEffect` blocks tracking volume changes, soundType changes, and unmount cleanups.
    6. Double check that the variables passed to `IndexTab` props remain identical.
  </action>
  <verify>
    npm run build
  </verify>
  <done>
    `App.tsx` has been refactored, audio code has been removed, the hook is integrated, and the project builds cleanly.
  </done>
</task>

<task type="checkpoint:human-verify">
  <name>Verify Audio Playback in Browser</name>
  <action>
    Instruct the user to start the development server if not already running, open the app, and test all ambient sound loops (Rain, Lofi Jazz, Brown Noise, Forest Wind) to ensure audio plays, volume adjusts, and toggles work seamlessly.
  </action>
  <verify>
    User confirms audio playback and volume control function correctly.
  </verify>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Over 300 lines of procedural Web Audio API code are removed from `App.tsx`.
- [ ] Ambient sound playing controls (toggling sound, changing sound type, and volume sliders) function with zero lag.
- [ ] No regression in other tabs or components.

## Success Criteria
- [ ] UI components updated successfully
- [ ] Build passes without compilation errors
- [ ] Sound playback functionality verified
