---
milestone: v1.0-MVP
version: 1.0.0
updated: 2026-06-23T14:45:00Z
---

# Roadmap: BuJo Focus MVP (Angular + NestJS)

> **Current Phase:** 1 - Database Setup & Backend Architecture
> **Status:** ⏳ Pending

## Must-Haves (from SPEC)

- [ ] Docker Compose setup for Postgres database.
- [ ] Database Schema definitions (Prisma schema or TypeORM entities) inside `apps/backend/`.
- [ ] JWT Authentication API endpoints on NestJS backend.
- [ ] CRUD API endpoints for journal tasks, energy levels, and habits.
- [ ] Tailwind CSS layout setup and standalone component architecture inside `apps/frontend/`.
- [ ] AuthService and state tracking (Signals) in Angular frontend.
- [ ] Rebuilt gamified Daily Log, ADHD Energy Chart, and Someday/Maybe components.
- [ ] Offline sync resilience (local storage fallback) on Angular client.

---

## Phases

### Phase 1: Database Setup & Backend Architecture
**Status:** ⏳ Pending
**Objective:** Configure Docker Compose for PostgreSQL, set up the database schemas, and initialize NestJS config/prisma modules.

**Plans:**
- Plan 1.1: Docker Compose PostgreSQL and Prisma/TypeORM Initialization.
- Plan 1.2: Database entity schemas mapping (Users, Tasks, Habits, EnergyLogs).

### Phase 2: Backend Auth & Core REST APIs
**Status:** ⏳ Pending
**Objective:** Implement JWT authentication, and CRUD API endpoints for Bullet Journal items.

**Plans:**
- Plan 2.1: Authentication Controller & Guards with Passport/JWT.
- Plan 2.2: Journal Task & Collection API endpoints.
- Plan 2.3: Habit Tracker & ADHD Energy Chart API endpoints.

### Phase 3: Angular Foundation & Auth Integration
**Status:** ⏳ Pending
**Objective:** Setup Tailwind CSS, create global HTTP services, routing architecture, and build the Login/Signup screens.

**Plans:**
- Plan 3.1: Tailwind CSS, Global Theme Config, & Layout Shell in Angular.
- Plan 3.2: HTTP Client service, State Signals, and Authentication routing.

### Phase 4: Core Frontend Features
**Status:** ⏳ Pending
**Objective:** Build standalone components for Daily Log, ADHD Energy Chart, Habits Tracker, and Someday/Maybe Board.

**Plans:**
- Plan 4.1: Daily Log timeline and time-blocking components.
- Plan 4.2: Habit consistency tracker and Someday/Maybe Sticky Notes.
- Plan 4.3: ADHD Energy flutuation chart rendering (interactive SVG/Chart).

### Phase 5: Integration, Sync, & Validation
**Status:** ⏳ Pending
**Objective:** Integrate frontend with NestJS REST endpoints, implement local storage sync fallback, and verify production build.

**Plans:**
- Plan 5.1: API integration and Offline-first sync logic.
- Plan 5.2: Production bundle build validation and end-to-end user flows verification.

---

## Progress Summary

| Phase | Status | Plans | Complete |
|-------|--------|-------|----------|
| 1     | ⏳      | 0/2   | —        |
| 2     | ⏳      | 0/3   | —        |
| 3     | ⏳      | 0/2   | —        |
| 4     | ⏳      | 0/3   | —        |
| 5     | ⏳      | 0/2   | —        |

---

## Timeline

| Phase | Started | Completed | Duration |
|-------|---------|-----------|----------|
| 1     | —       | —         | —        |

