---
phase: 1
plan: 1
wave: 1
gap_closure: false
---

# Plan 1.1: Context Skeleton and Hooks Directory Setup

## Objective
Establish the React Context and empty custom hook skeletons under `src/context/` and `src/hooks/`. This sets up the clean architecture needed for the subsequent state extraction without breaking the compile step.

## Context
Load these files for context:
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- src/App.tsx (for state types and definitions)
- src/types/index.ts

## Tasks

<task type="auto">
  <name>Create BujoContext and Provider Skeleton</name>
  <files>
    src/context/BujoContext.tsx
  </files>
  <action>
    Create the global `BujoContext` and `BujoProvider` in `src/context/BujoContext.tsx`.
    
    Steps:
    1. Import `createContext`, `useContext`, and `ReactNode` from 'react'.
    2. Define a TypeScript interface `BujoContextType` which will hold the states and actions (items, settings, collections, active tab, active timer state).
    3. Create the context using `createContext<BujoContextType | undefined>(undefined)`.
    4. Implement a custom hook `useBujo()` that exports this context, throwing an error if used outside `BujoProvider`.
    5. Implement the `BujoProvider` component returning the context provider wrapping its `children`.
  </action>
  <verify>
    npm run build
  </verify>
  <done>
    `src/context/BujoContext.tsx` is successfully created, exports `BujoProvider` and `useBujo`, and the codebase compiles without errors.
  </done>
</task>

<task type="auto">
  <name>Initialize State Custom Hook Placeholders</name>
  <files>
    src/hooks/useBujoItems.ts
    src/hooks/useCollections.ts
    src/hooks/useBujoSettings.ts
  </files>
  <action>
    Create the skeleton structures for custom hooks that will handle local storage persistence.
    
    Steps:
    1. In `src/hooks/useBujoItems.ts`, export a function `useBujoItems` that currently wraps a simple React state for bujo items (using the interface from `src/types/index.ts`).
    2. In `src/hooks/useCollections.ts`, export a function `useCollections` returning a simple state placeholder for collections.
    3. In `src/hooks/useBujoSettings.ts`, export a function `useBujoSettings` returning user settings state.
  </action>
  <verify>
    npm run build
  </verify>
  <done>
    The three hook files are created under `src/hooks/`, export their respective hook functions, and compile cleanly.
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Context provider and custom hooks are fully typed and match interfaces in `src/types/index.ts`.
- [ ] No compilation or TypeScript errors.

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] No regressions in build compile
