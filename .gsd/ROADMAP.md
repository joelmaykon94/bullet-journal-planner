---
milestone: v2.0
version: 2.0.0
updated: 2026-06-16T11:20:00Z
---

# Roadmap

> **Current Phase:** 15 - Migration Duplication Fix & Unified Delay Tracking
> **Status:** 🚧 In Progress

## Must-Haves (from SPEC)

- [x] Reorganize files inside `src/` to strictly align with `GEMINI.md` feature guidelines.
- [x] Move procedural audio generation from `src/App.tsx` to `src/hooks/useAmbientAudio.ts`.
- [x] Move Pomodoro timer state and ticking code from `src/App.tsx` to `src/hooks/usePomodoroTimer.ts`.
- [x] Refactor bullet journal states (items, collections, settings) to custom hooks and connect them through a React Context.
- [x] Shrink `src/App.tsx` to under 400 lines while maintaining 100% feature parity.
- [x] Ensure the project builds cleanly without TypeScript or lint errors.
- [x] Ensure critical UI overlays (Tutorial) are responsive on mobile.
- [x] Implement Brag Document tracking integrated with professional growth metrics.

---

## Phases

### Phase 1: Directory Organization & Context Foundation
**Status:** ✅ Complete
**Objective:** Align directory structure with feature rules and establish the context provider skeleton.

### Phase 2: Procedural Audio & Auxiliary Refactoring
**Status:** ✅ Complete
**Objective:** Extract the complex Web Audio API synthesizer code and secondary UI helpers.

### Phase 3: Core State & State Hooks Extraction
**Status:** ✅ Complete
**Objective:** Move all bullet log, collections, settings, and Pomodoro timer states from `App.tsx` to modular hooks.

### Phase 4: App.tsx Slimming & Validation
**Status:** ✅ Complete
**Objective:** Wrap application in Context, wire child components, clean up App.tsx, and run full test verification.

### Phase 5: Index Tab UI & Layout Optimization
**Status**: ✅ Complete
**Objective**: Redesign the components at the Indice (IndexTab) to optimize the Quick Access Menu layout and sizing.

### Phase 6: Advanced GTD & Visual Customization features
**Status**: ✅ Complete
**Objective**: Implement Trash Bin (Lixeira), Someday/Maybe (Algum Dia/Talvez), delegation status, task visual icons, and Dream Board.

### Phase 7: Supabase Persistence & Local Storage Migration
**Status**: ✅ Complete
**Objective**: Replace pure LocalStorage persistence with an integrated local-first Supabase cloud database sync.

### Phase 8: Local LLM AI Assistant & Task Decomposition
**Status**: ✅ Complete
**Objective**: Integrate Local LLM (Web Worker) for task decomposition and cognitive relief suggestions.

### Phase 9: Quality of Life, Advanced Modals & Core Enhancements
**Status**: ✅ Complete
**Objective**: Implement detailed view modals, core UI refinements, and improved task management workflows.

**Plans**:
- [x] Plan 9.1: Timeline UI Enhancements and Visual Feedback.
- [x] Plan 9.2: Advanced Search and Filtering across all logs.
- [x] Plan 9.3: Weekly & Monthly Log Day Modals.
- [x] Plan 9.4: Global Data Management & Technical Debt Removal.
- [x] Plan 9.5: Global Search & Omnibox.
- [x] Plan 9.6: PWA Install & Offline Awareness.

### Phase 10: Mobile Optimization & UX Polish
**Status**: ✅ Complete
**Objective**: Finalize mobile-specific UI fixes and ensure a seamless experience across devices.

**Plans**:
- [x] Plan 10.1: Tutorial Mobile Responsiveness & UX Polish.

### Phase 11: Brag Document Integration
**Status**: ✅ Complete
**Objective**: Provide a built-in UI for career tracking, linked to XP progression and cloud sync.

**Plans**:
- [x] Plan 11.1: Brag Document Integration, Sync & UI Layout.

### Phase 12: Smart Add NLP Input
**Status**: ✅ Complete
**Objective**: Implement a Todoist-style natural language parser for rapid task entry.

**Plans**:
- [x] Plan 12.1: Todoist-style Smart Add NLP Parser.

### Phase 13: Contextual Feature Help
**Status**: ✅ Complete
**Objective**: Implement specific, auto-triggering contextual help modals for each feature in the sidebar.

**Plans**:
- [x] Plan 13.1: Contextual Feature Help & Floating Button.

### Phase 14: Task Links Input & Clean Domain Rendering
**Status**: ✅ Complete
**Objective**: Add collapsible text input fields for link entries in task forms, showing short hostname/domain links inline.

**Plans**:
- [x] Plan 14.1: Ponytail Refactoring - Component & Context Cleanup.
- [x] Plan 14.2: Task Links Input and Clean Domain Rendering.

### Phase 15: Migration Duplication Fix & Unified Delay Tracking
**Status**: 🚧 In Progress
**Objective**: Fix task migration duplication in manual and auto-migration, unify card aging based on hours/days, and render consistent delay badges across all log screens.

**Plans**:
- [ ] Plan 15.1: Migration Duplication Fix & Unified Delay Tracking.

---

## Progress Summary

| Phase | Status | Plans | Complete |
|-------|--------|-------|----------|
| 1     | ✅     | 2/2   | 2026-06-15 |
| 2     | ✅     | 2/2   | 2026-06-15 |
| 3     | ✅     | 3/3   | 2026-06-15 |
| 4     | ✅     | 2/2   | 2026-06-15 |
| 5     | ✅     | 2/2   | 2026-06-15 |
| 6     | ✅     | 3/3   | 2026-06-16 |
| 7     | ✅     | 1/1   | 2026-06-16 |
| 8     | ✅     | 2/2   | 2026-06-16 |
| 9     | ✅     | 6/6   | 2026-06-16 |
| 10    | ✅     | 1/1   | 2026-06-16 |
| 11    | ✅     | 1/1   | 2026-06-16 |
| 12    | ✅     | 1/1   | 2026-06-16 |
| 13    | ✅     | 1/1   | 2026-06-16 |
| 14    | ✅     | 2/2   | 2026-06-22 |
| 15    | 🚧     | 1/1   | In Progress |

---

## Timeline

| Phase | Started | Completed | Duration |
|-------|---------|-----------|----------|
| 1-5   | 2026-06-15 | 2026-06-15 | 1 day |
| 6-13  | 2026-06-16 | 2026-06-16 | 1 day |
| 14    | 2026-06-22 | 2026-06-22 | 1 day |
| 15    | 2026-06-22 | In Progress | - |

