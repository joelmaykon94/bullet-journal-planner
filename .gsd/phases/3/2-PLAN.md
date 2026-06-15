---
phase: 3
plan: 2
wave: 1
gap_closure: false
---

# Plan 3.2: Extract Collections and Custom Lists State Hook

## Objective
Extract collections library and custom bullet lists state management, localStorage persistence, and all associated media/subtask helper handlers from `App.tsx` into a robust `useCollections` custom hook.

## Context
Load these files for context:
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- src/App.tsx (collections states, sync effects, and collection/media handlers)
- src/hooks/useCollections.ts (skeleton hook)

## Tasks

<task type="auto">
  <name>Implement useCollections Custom Hook</name>
  <files>
    src/hooks/useCollections.ts
  </files>
  <action>
    Refactor `src/hooks/useCollections.ts` to implement collections management.
    
    Steps:
    1. Lazy load initial collections array from `localStorage.getItem('bujo_collections')` with default books/creative list fallbacks matching the original code.
    2. Move collections action handlers:
       - `handleCreateCollection`: adds a new list category.
       - `handleCreateCollectionItem`: appends an item to a list.
       - `handleDeleteCollectionItem`: removes an item.
       - `handleUpdateCollectionItemStatus`: updates item status (todo, doing, done).
       - `handleAddCollectionItemSubtask`, `handleToggleCollectionItemSubtask`, `handleDeleteCollectionItemSubtask` to edit subtasks in items.
       - `handleUploadCollectionItemMedia`, `handleAddCollectionItemMediaLink`, `handleDeleteCollectionItemMedia` for media attachments.
       - `migrateCollectionItemToDailyLog` and `handleAICollectionItemDecompose`.
    3. Setup `useEffect` synchronizing collections state changes to `bujo_collections` in localStorage.
    4. Return `collections`, `setCollections` state, and all collections-related handlers.
  </action>
  <verify>
    npm run build
  </verify>
  <done>
    `src/hooks/useCollections.ts` is fully implemented and compiles successfully.
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Collections adding, deleting, and status changes are fully functional in hook.
- [ ] Media attachments and subtasks modifications inside collections update state correctly.
- [ ] Collections sync to localStorage on every update.

## Success Criteria
- [ ] Custom hook implemented successfully
- [ ] Project builds cleanly via `npm run build`
