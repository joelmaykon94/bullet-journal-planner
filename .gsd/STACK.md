# Technology Stack — BuJo Focus (Angular + NestJS)

> **Monorepo Structure:** Managed via pnpm workspaces in a single repository.

## Overview

| Component | Location | Framework/Runtime | Styling/State |
|-----------|----------|-------------------|---------------|
| **Frontend** | `apps/frontend/` | Angular 19+ | Tailwind CSS, RxJS, Angular Signals |
| **Backend** | `apps/backend/` | NestJS 11+ / Node.js | TypeScript, Prisma ORM |
| **Database** | — | PostgreSQL | Managed via Docker Compose / local instance |

---

## Frontend Specifications (`apps/frontend`)

### Runtime & Core Framework
- **Angular 19.x** (Standalone Component architecture, routing, HTTP client).
- **TypeScript 5.x** (Strict compilation rules enabled).
- **RxJS 7.x** (Reactive extensions for HTTP requests and event-driven architectures).

### Styling & UI
- **Tailwind CSS 3.x/4.x** (Sleek utility classes, dark-mode support matching Hashira theme).
- **Lucide Angular** (Vector icons).

### State Management
- **Angular Signals:** Fine-grained reactive state for user settings, daily logs, energy logs, and active items.
- **LocalStorage Fallback Service:** Local client persistence mapping database state locally when offline.

---

## Backend Specifications (`apps/backend`)

### Runtime & Web Framework
- **NestJS 11.x** (Modular architecture, Controllers, Services).
- **Node.js v20+** (Asynchronous non-blocking backend runtime).

### Database & ORM
- **PostgreSQL** (Relational database for storing user accounts and tasks).
- **Prisma ORM** (Type-safe schema definition, migrations, and database queries).

### Security & Authentication
- **Passport JWT** (`@nestjs/jwt`, `@nestjs/passport`): Token-based API access.
- **Bcrypt:** Hashing passwords securely before storing in database.

### Input Validation
- **class-validator / class-transformer:** Strict DTO checking on HTTP controllers.

---

## Development & Infrastructure

### Containerization
- **Docker Compose:** Spinning up database instances (`postgres:16-alpine`) and local admin utilities (pgAdmin).

### Build Tools & Tooling
- **pnpm Workspaces:** Managing scripts and linking packages at workspace root.
- **ESLint & Prettier:** Uniform linting guidelines across frontend and backend modules.

---

*Last updated: 2026-06-23*
