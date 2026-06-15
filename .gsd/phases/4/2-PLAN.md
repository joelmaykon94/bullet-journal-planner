---
phase: 4
plan: 2
wave: 2
gap_closure: false
---

# Plan 4.2: Build Validation and Functional Verification

## Objective
Verify the refactored project compiles cleanly for production, run checks to ensure zero regressions in local storage sync, local AI Web Worker inference, HTML-to-Canvas exports, and Option A responsive layout controls.

## Context
Load these files for context:
- .gsd/SPEC.md
- .gsd/ROADMAP.md
- package.json
- src/App.tsx

## Tasks

<task type="auto">
  <name>Run Build and Linter Checks</name>
  <files>
    package.json
  </files>
  <action>
    Run final production compilation to make sure everything compiles cleanly.
    
    Steps:
    1. Run `npm run build` to compile TypeScript and bundle assets.
    2. Check the output logs for any missing exports, imports, or type definition warnings.
  </action>
  <verify>
    npm run build
  </verify>
  <done>
    Vite production build completes successfully with zero compile warnings.
  </done>
</task>

<task type="checkpoint:human-verify">
  <name>Functional Verification in Browser</name>
  <action>
    Ask the user to test the built application in their web browser and verify:
    1. Daily log bullets can be created, crossed off, and edit inline.
    2. Ambient sound play and volume sliders change audio volume.
    3. Focus timer begins count, triggers sound alarms, and gives XP on work block done.
    4. AI split task modal decomposes tasks using local models without crashing.
    5. HTML to PDF export operates successfully.
    6. Layout is fully viewport-locked on desktop (no scrollbars on root page body).
  </action>
  <verify>
    User confirms all features function regression-free.
  </verify>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Output bundles are generated in the `dist` folder.
- [ ] No regression in core ADHD bullet journal features.
- [ ] Global state context correctly shares values between tabs.

## Success Criteria
- [ ] Final build finishes successfully
- [ ] Core features verified working
