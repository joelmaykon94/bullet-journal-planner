# SPEC.md — Project Specification for Angular + NestJS MVP

> **Status**: `FINALIZED`

## Vision

Re-architect and rebuild **BuJo Focus** — a cognitive minimalist planner for ADHD individuals — as a professional, scalable web application using **Angular** on the frontend and **NestJS** on the backend in a pnpm monorepo. This transition ensures secure user accounts, cloud database sync, and a decoupled architecture that optimizes local/offline execution while persisting logs and energy charts to a centralized API.

---

## Goals

1. **Monorepo Integration:**
   - Establish a clean, well-managed pnpm monorepo under `apps/frontend/` (Angular) and `apps/backend/` (NestJS).
   
2. **NestJS Backend REST API:**
   - Implement authentication using JWT (JSON Web Tokens).
   - CRUD endpoints for Bullet Journal entries (Daily, Weekly, Monthly logs).
   - APIs to persist and query Habit Tracker data.
   - Persistence for ADHD Energy Charts and user configuration settings.
   - Database layer using PostgreSQL with Prisma or TypeORM.

3. **Angular Frontend SPA:**
   - Re-implement the original gamified BuJo Focus client layout using Angular standalone components.
   - Modular features for:
     - **Daily Log:** Time-blocked tasks, emoji tags, and inline link parsing.
     - **Focus Mode:** Pomodoro timer and ambient audio generator (translated to Angular services).
     - **Energy Log:** Interactive interactive chart representing focus/energy levels.
     - **Someday/Maybe Board:** A sticky-notes style dashboard.
   - Implement state management using RxJS/NgRx Component Store or custom Services with Signals.

4. **Offline Resilience:**
   - Integrate an offline-fallback capability using local storage so the user can continue planning even when the NestJS API is unreachable.

---

## Non-Goals (Out of Scope)
- Porting the background AI suggestions in Phase 1 (postponed to Phase 2).
- Implementing third-party OAuth logins in the initial MVP.
- Mobile PWA deployment (Vite PWA conversion was done, Angular PWA will be done in subsequent releases).

---

## Constraints

- **Unified Styling:** Must use Tailwind CSS for the frontend UI to match the premium aesthetics.
- **Strict TypeScript:** All projects must compile cleanly in strict mode.
- **OpenAPI/Swagger:** Backend must expose fully documented Swagger endpoints at `/api/docs`.
- **Database Portability:** Support local Postgres run via Docker Compose.

---

## Success Criteria

- [ ] NestJS application successfully connects to PostgreSQL database.
- [ ] Angular frontend standalone routing and state management function cleanly.
- [ ] Full user authentication flow (Register/Login) works end-to-end.
- [ ] Daily log entries can be created, updated, deleted, and queried via API.
- [ ] Project compiles with zero TypeScript or build errors in both apps.

---

*Last updated: 2026-06-23*
