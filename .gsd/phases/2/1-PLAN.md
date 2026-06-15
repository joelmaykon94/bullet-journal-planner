---
phase: 2
plan: 1
wave: 1
gap_closure: false
---

# Plan 2.1: Extract Procedural Audio Synthesis to Custom Hook

## Objective
Extract the procedural audio synthesis logic from `src/App.tsx` into a dedicated custom hook `src/hooks/useAmbientAudio.ts` to reduce file complexity, separate concern, and make the audio synthesizer modular.

## Context
Load these files for context:
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- src/App.tsx (specifically lines 317-635)
- src/utils/plannerUtils.ts

## Tasks

<task type="auto">
  <name>Create useAmbientAudio Custom Hook</name>
  <files>
    src/hooks/useAmbientAudio.ts
  </files>
  <action>
    Create the file `src/hooks/useAmbientAudio.ts` containing the Web Audio API synthesis logic from `App.tsx`.
    
    Steps:
    1. Import `useState`, `useEffect`, and `useRef` from 'react'.
    2. Define sound names map for toast notifications inside the hook.
    3. Copy the state variables `soundType`, `ambientPlaying`, `ambientVolume`.
    4. Copy the refs `audioCtxRef`, `gainNodeRef`, `audioSourcesRef`.
    5. Copy the functions `startAmbientAudio`, `stopAmbientAudio`, `toggleAmbientAudio`.
    6. Ensure `toggleAmbientAudio` accepts a callback or calls an injected `showToast` function for alerts.
    7. Copy the `useEffect` blocks that handle volume changes, soundType changes (auto-restart), and unmount cleanup.
    8. Return `soundType`, `setSoundType`, `ambientPlaying`, `ambientVolume`, `setAmbientVolume`, `toggleAmbientAudio`, and `stopAmbientAudio`.
  </action>
  <verify>
    npm run build
  </verify>
  <done>
    `src/hooks/useAmbientAudio.ts` is created and compiles cleanly.
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Sound synthesis methods (`startAmbientAudio`, `stopAmbientAudio`) contain the exact Web Audio configurations from the original code.
- [ ] No regression in types or imports.

## Success Criteria
- [ ] Custom hook created successfully
- [ ] Builds without TypeScript or lint errors
