# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision

Maximize token efficiency and improve coding structure by refactoring the monolithic `src/App.tsx` file (2,655 lines) into modular React components, custom hooks, and React Context, and organizing the `src` directory according to the React Project Organization Rules specified in `GEMINI.md`.

## Goals

1. **Modularize State Management:** Extract bullet journal items, user settings, collections, and Pomodoro timer states from `src/App.tsx` into custom React hooks (e.g., `useBujoItems`, `useBujoSettings`, `useCollections`, `usePomodoroTimer`) and a global React Context provider.
2. **Decompose Procedural Audio Synthesis:** Move the 150+ lines of Web Audio API procedural audio generation (rain, campfire, wind, and lofi noises) from `src/App.tsx` into a dedicated custom hook (`useAmbientAudio.ts`).
3. **Restructure Directory Structure:** Reorganize files inside `src/` to strictly align with feature-based guidelines (moving global reusable components to `src/components/common/`, feature-specific components to `src/features/[feature-name]/components/`, hooks to `src/hooks/`, and context files to `src/context/`).
4. **Reduce File-level Token Footprint:** Shrink `src/App.tsx` from 2,655 lines to a high-level layout file under 400 lines to minimize context window consumption for future edits.

## Non-Goals (Out of Scope)

- Adding new end-user features or changes to the app's visual layout.
- Replacing the client-side local storage with a backend database.
- Rewriting the background AI Web Worker (`src/ai.worker.ts`).
- Upgrading React or Tailwind to major versions that break existing APIs.

## Constraints

- **Single-page client-only application:** Must continue to run completely offline in the browser.
- **Strict import correctness:** All TypeScript imports must be updated and remain fully type-safe.
- **Zero regression in functionality:** The ambient sounds, CSV/PDF exporting, AI suggestions, and ADHD energy log must work exactly as they do currently.

## Success Criteria

- [ ] `src/App.tsx` line count is reduced from 2,655 lines to under 400 lines.
- [ ] No compilation errors or TypeScript warnings in the build (`npm run build` passes).
- [ ] Refactored custom hooks and context files are fully functional and placed under `src/hooks/` and `src/context/`.
- [ ] Ambient sound playing and mixing function correctly without audio context errors.
- [ ] All components reside in their correct directories according to the guidelines.

---

*Last updated: 2026-06-15*
