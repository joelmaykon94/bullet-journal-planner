---
phase: 1
plan: 2
wave: 1
gap_closure: false
---

# Plan 1.2: Viewport-Locked Layout Integration (Option A)

## Objective
Implement Option A (Viewport-Locked Dashboard) by updating global CSS and the container structure of `src/App.tsx`. This restricts the main window from scrolling, and creates a modular viewport-locked workspace where only lists (like logs and collections) scroll independently.

## Context
Load these files for context:
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- src/App.tsx (specifically lines 2350-2656)
- src/index.css

## Tasks

<task type="auto">
  <name>Add Viewport-Lock Utilities to index.css</name>
  <files>
    src/index.css
  </files>
  <action>
    Add CSS utility classes to lock viewports and structure scrolling blocks.
    
    Steps:
    1. Open `src/index.css` and append layout utility classes at the bottom of the `@layer utilities` section (around line 90).
    2. Define a class `.layout-locked-viewport` with styles: `height: 100vh; max-height: 100vh; overflow: hidden; display: flex; flex-direction: column;`.
    3. Ensure standard HTML/body tags are also reset: `html, body, #root { height: 100%; overflow: hidden; }`.
  </action>
  <verify>
    npm run build
  </verify>
  <done>
    `src/index.css` includes viewport-lock overrides, and the build runs successfully.
  </done>
</task>

<task type="auto">
  <name>Refactor App.tsx Root Container & Scroll Zones</name>
  <files>
    src/App.tsx
  </files>
  <action>
    Refactor the main rendering divs in `src/App.tsx` to lock viewport heights and allocate scroll zones.
    
    Steps:
    1. Wrap the return JSX in `App.tsx` inside a container with the new viewport-locked class (or inline Tailwind classes: `h-screen max-h-screen overflow-hidden flex flex-col`).
    2. Set the main workspace container (`className="flex-1 max-w-6xl w-full mx-auto..."`) to use `flex-1 min-h-0 overflow-hidden flex flex-col`.
    3. Set the active tab container (`className="flex-1 flex flex-col md:flex-row..."`) to `flex-1 min-h-0 overflow-hidden`.
    4. Set the main tab renderer (`<main id="bujo-export-area" ...>`) to `flex-1 min-h-0 overflow-y-auto flex flex-col pr-1`.
  </action>
  <verify>
    npm run build
  </verify>
  <done>
    `src/App.tsx` container HTML has been refactored, the viewport is locked, scrollbars only appear inside the main tabs container, and the app builds cleanly.
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Outer page scrolling is completely disabled.
- [ ] Main header navbar and sidebar navigation remain statically visible.
- [ ] Active tab workspace contains independent scroll zones without leaking height.
- [ ] No regression in rendering or layout formatting on different resolutions.

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] Clean build via `npm run build`
