---
milestone: v1.0
version: 1.0.0
updated: 2026-06-15T19:48:00Z
---

# Roadmap

> **Current Phase:** 5 - Index Tab UI & Layout Optimization
> **Status:** ✅ Complete

## Must-Haves (from SPEC)

- [x] Reorganize files inside `src/` to strictly align with `GEMINI.md` feature guidelines.
- [x] Move procedural audio generation from `src/App.tsx` to `src/hooks/useAmbientAudio.ts`.
- [x] Move Pomodoro timer state and ticking code from `src/App.tsx` to `src/hooks/usePomodoroTimer.ts`.
- [x] Refactor bullet journal states (items, collections, settings) to custom hooks and connect them through a React Context.
- [x] Shrink `src/App.tsx` to under 400 lines while maintaining 100% feature parity.
- [x] Ensure the project builds cleanly without TypeScript or lint errors.

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
**Status:** ✅ Complete
**Objective:** Move all bullet log, collections, settings, and Pomodoro timer states from `App.tsx` to modular hooks.
**Depends on:** Phase 2
**Requirements:** SPEC Goal 1, SPEC Goal 4

**Plans:**
- [x] Plan 3.1: Extract Items and Settings State Hooks
- [x] Plan 3.2: Extract Collections and Custom Lists State Hook
- [x] Plan 3.3: Extract Pomodoro Timer State Hook

---

### Phase 4: App.tsx Slimming & Validation
**Status:** ✅ Complete
**Objective:** Wrap application in Context, wire child components, clean up App.tsx, and run full test verification.
**Depends on:** Phase 3
**Requirements:** SPEC Goal 4, Success Criteria

**Plans:**
- [x] Plan 4.1: Simplify `src/App.tsx` to a layout shell, utilizing context for state sharing.
- [x] Plan 4.2: Verify and resolve import paths, type definitions, build correctness, and functionality.

---

### Phase 5: Index Tab UI & Layout Optimization
**Status**: ✅ Complete
**Objective**: Redesign the components at the Indice (IndexTab) to optimize the Quick Access Menu layout and sizing, fix spacing using Flexbox/Grid to avoid overflows and overlaps, and design modern square or rectangular cards for a beautiful, responsive ADHD-friendly UX.
**Depends on**: Phase 4

**Plans**:
- [x] Plan 5.1: Redesign and adjust spacing/aspect ratios of IndexTab layout and Quick Access cards.
- [x] Plan 5.2: Verify layout responsiveness, locked viewport compliance, and zero overlaps.

---

### Phase 6: Advanced GTD & Visual Customization features
**Status**: 🚧 In Progress
**Objective**: Implement Trash Bin (Lixeira), Someday/Maybe (Algum Dia/Talvez) capture workspace, delegation status, task visual icons/avatar picker, and a gamified Dream Board (Quadro dos Sonhos).
**Depends on**: Phase 5

**Plans**:
- [x] Plan 6.1: Trash Bin (Lixeira) & Someday/Maybe (Algum Dia) Tab
- [/] Plan 6.2: Task Delegation & Icon/Avatar Selection
- [ ] Plan 6.3: Dream Board (Quadro dos Sonhos)

---

## Progress Summary

| Phase | Status | Plans | Complete |
|-------|--------|-------|----------|
| 1 | ✅ | 2/2 | 2026-06-15 |
| 2 | ✅ | 2/2 | 2026-06-15 |
| 3 | ✅ | 3/3 | 2026-06-15 |
| 4 | ✅ | 2/2 | 2026-06-15 |
| 5 | ✅ | 2/2 | 2026-06-15 |
| 6 | 🚧 | 0/3 | |

---

## Timeline

| Phase | Started | Completed | Duration |
|-------|---------|-----------|----------|
| 1 | 2026-06-15 | 2026-06-15 | 10m |
| 2 | 2026-06-15 | 2026-06-15 | 5m |
| 3 | 2026-06-15 | 2026-06-15 | 5m |
| 4 | 2026-06-15 | 2026-06-15 | 15m |
| 5 | 2026-06-15 | 2026-06-15 | 10m |
| 6 | 2026-06-15 | | |

