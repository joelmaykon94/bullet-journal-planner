---
milestone: v1.0
version: 1.0.0
updated: 2026-06-15T19:48:00Z
---

# Roadmap

> **Current Phase:** 1 - Directory Organization & Context Foundation
> **Status:** planning

## Must-Haves (from SPEC)

- [ ] Reorganize files inside `src/` to strictly align with `GEMINI.md` feature guidelines.
- [ ] Move procedural audio generation from `src/App.tsx` to `src/hooks/useAmbientAudio.ts`.
- [ ] Move Pomodoro timer state and ticking code from `src/App.tsx` to `src/hooks/usePomodoroTimer.ts`.
- [ ] Refactor bullet journal states (items, collections, settings) to custom hooks and connect them through a React Context.
- [ ] Shrink `src/App.tsx` to under 400 lines while maintaining 100% feature parity.
- [ ] Ensure the project builds cleanly without TypeScript or lint errors.

---

## Phases

### Phase 1: Directory Organization & Context Foundation
**Status:** ✅ Complete
**Objective:** Align directory structure with feature rules and establish the context provider skeleton.
**Requirements:** SPEC Goal 3

**Plans:**
- [x] Plan 1.1: Context Skeleton and Hooks Directory Setup
- [x] Plan 1.2: Viewport-Locked Layout Integration (Option A)

---

### Phase 2: Procedural Audio & Auxiliary Refactoring
**Status:** ✅ Complete
**Objective:** Extract the complex Web Audio API synthesizer code and secondary UI helpers.
**Depends on:** Phase 1
**Requirements:** SPEC Goal 2, SPEC Goal 4

**Plans:**
- [x] Plan 2.1: Extract Procedural Audio Synthesis to Custom Hook
- [x] Plan 2.2: Refactor UI Components to Consume Ambient Audio Hook

---

### Phase 3: Core State & State Hooks Extraction
**Status:** ⬜ Not Started
**Objective:** Move all bullet log, collections, settings, and Pomodoro timer states from `App.tsx` to modular hooks.
**Depends on:** Phase 2
**Requirements:** SPEC Goal 1, SPEC Goal 4

**Plans:**
- [ ] Plan 3.1: Extract items and settings state to `src/hooks/useBujoItems.ts` and `src/hooks/useBujoSettings.ts`.
- [ ] Plan 3.2: Extract custom lists and collections state to `src/hooks/useCollections.ts`.
- [ ] Plan 3.3: Extract Pomodoro timer state and audio ticking to `src/hooks/usePomodoroTimer.ts`.

---

### Phase 4: App.tsx Slimming & Validation
**Status:** ⬜ Not Started
**Objective:** Wrap application in Context, wire child components, clean up App.tsx, and run full test verification.
**Depends on:** Phase 3
**Requirements:** SPEC Goal 4, Success Criteria

**Plans:**
- [ ] Plan 4.1: Simplify `src/App.tsx` to a layout shell, utilizing context for state sharing.
- [ ] Plan 4.2: Verify and resolve import paths, type definitions, build correctness, and functionality.

---

## Progress Summary

| Phase | Status | Plans | Complete |
|-------|--------|-------|----------|
| 1 | ✅ | 2/2 | 2026-06-15 |
| 2 | ✅ | 2/2 | 2026-06-15 |
| 3 | ⬜ | 0/3 | — |
| 4 | ⬜ | 0/2 | — |

---

## Timeline

| Phase | Started | Completed | Duration |
|-------|---------|-----------|----------|
| 1 | 2026-06-15 | 2026-06-15 | 10m |
| 2 | 2026-06-15 | 2026-06-15 | 5m |
| 3 | — | — | — |
| 4 | — | — | — |
