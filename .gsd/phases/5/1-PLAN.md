---
phase: 5
plan: 1
wave: 1
gap_closure: false
---

# Plan 5.1: Redesign and Spacing/Aspect Ratio Tuning for IndexTab

## Objective
Re-architect the `IndexTab` dashboard components (Quick Access Menu, Energy Chart, Habit Tracker, User Persona Card) to use adaptive flexbox/grid layout systems, ensuring a consistent premium look with square/rectangular glassmorphic cards, correct margins, and zero text/button overlaps under viewport-locked constraints.

## Context
- .gsd/SPEC.md
- src/features/planner/components/IndexTab.tsx
- src/features/planner/components/UserPersonaCard.tsx
- src/features/planner/components/HabitTracker.tsx

## Tasks

<task type="auto">
  <name>Optimize Quick Access Menu Grid and Text Scaling</name>
  <files>
    src/features/planner/components/IndexTab.tsx
  </files>
  <action>
    Re-layout the Quick Access Menu to prevent card squishing and text wraps.
    
    Steps:
    1. Adjust the grid layout of the menu cards to use flex wrapping or responsive grid auto-fit so card text has adequate space.
    2. Add standard border, padding, and text-size definitions (e.g., `text-[9px] md:text-xs`) to the cards.
    3. Implement sleek hover effects (e.g. outline glow `hover:border-bujo-highlight/60`, translate hover, and soft drop shadow).
  </action>
  <verify>
    npm run build
  </verify>
  <done>
    IndexTab compiles successfully and uses a responsive layout for the quick menu.
  </done>
</task>

<task type="auto">
  <name>Configure Spacing and Height Constraints for Index Cards</name>
  <files>
    src/features/planner/components/IndexTab.tsx
    src/features/planner/components/UserPersonaCard.tsx
    src/features/planner/components/HabitTracker.tsx
  </files>
  <action>
    Standardize outer card spacing and set height bounds.
    
    Steps:
    1. Wrap dynamic sub-lists in `HabitTracker` and `UserPersonaCard` (e.g., recommendations or log items) in fixed or max-height flex classes with `overflow-y-auto` scrollbars.
    2. Align all margins, paddings, and card gaps (`gap-4`) so the dashboard components sit evenly across the layout.
    3. Ensure all cards share consistent styling properties: `rounded-3xl` corners, `bg-zinc-200/20 dark:bg-zinc-900/30` background colors, and subtle borders.
  </action>
  <verify>
    npm run build
  </verify>
  <done>
    Height constraints are applied, card aesthetics are unified, and the build succeeds cleanly.
  </done>
</task>

## Success Criteria
- [ ] No compilation or TypeScript errors.
- [ ] Card shapes are clean squares or rectangles with glassmorphism.
