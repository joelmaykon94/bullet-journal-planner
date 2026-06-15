# DECISIONS.md — Architecture Decision Records

> **Purpose**: Log significant technical decisions and their rationale.

## Decisions

### [DECISION-001] Extract React Context for Bullet Journal State

**Date**: 2026-06-15
**Status**: Proposed

#### Context
`src/App.tsx` (2,655 lines) holds all state, utility logic, audio players, custom hooks, and page layouts. This monolithic design causes massive token consumption when the LLM reads/writes this file and triggers unnecessary re-renders.

#### Decision
Extract states (journal items, settings, collections, timer) and handlers into separate custom hooks. Group these custom hooks into a unified `src/context/BujoContext.tsx` context provider to manage state globally without prop drilling.

#### Rationale
- Decouples component layout from state logic.
- Reduces token footprint of `App.tsx` from 2,655 lines to under 400 lines.
- Fits the directory rules specified in `GEMINI.md`.

#### Consequences
- Minor increase in directory structure complexity (adding context and new custom hook files).
- Subcomponents need to be updated to consume the contexts.

#### Alternatives Considered
- Using Redux or Zustand: Rejected because local React Context + Hooks is lightweight, requires no extra external dependencies, and is standard for single-developer projects.

### [DECISION-002] Index Tab UI & Layout Optimization

**Date**: 2026-06-15
**Status**: Approved

#### Context
The `IndexTab` dashboard contains several heavy components (EnergyChart, HabitTracker, Quick Access Menu, and UserPersonaCard) that must fit within a viewport-locked layout (`100vh` root body) without overlapping text, squishing buttons, or triggering root vertical scrollbars.

#### Decision
- Re-architect the Quick Access Menu grid/flex columns with adaptive sizing and clean typography scaling.
- Constrain sub-section heights (e.g. lists of habits or recommendations) using flex-grow/flex-shrink and `overflow-y-auto` so they stay within their containers.
- Standardize card spacing using flex/grid gaps and implement sleek glassmorphic rectangular/square cards with glowing hover highlights for a modern ADHD-friendly UX.

#### Rationale
- Prevents text and card overlaps on smaller desktop resolutions.
- Complies strictly with the viewport-locked layout constraint.
- Delivers a premium, visual ADHD-friendly UX.

---

*Last updated: 2026-06-15*
