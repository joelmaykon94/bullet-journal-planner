# Coding Guidelines — Bullet Journal Planner

This document outlines the coding standards, directory structure, and best practices for the frontend (Angular) and backend (NestJS) applications in this monorepo.

---

## 🎨 Angular (Frontend) Project Organization Rules

Organize the Angular application located in `apps/frontend/src/app/` using a clean, standalone component structure:

### Directory Structure
- **Core Services (`src/app/core/`):** Put singleton services, custom HTTP interceptors, route guards, and global state managers here.
- **Shared Elements (`src/app/shared/`):** Put reusable visual components, directives, custom pipes, and design system models here.
- **Feature Folders (`src/app/features/`):** Organize core features (e.g. `planner`, `focus`, `adhd`, `settings`) in individual folders.
  - Structure each feature: `apps/frontend/src/app/features/[feature-name]/`
    - `components/` - Standalone components specific to the feature.
    - `services/` - Services/APIs specific to the feature.
    - `models/` - Domain interfaces/types.

### Best Practices & Rules
- **Standalone Components:** Prefer Standalone Components and functional routing.
- **State Management:** Keep logic decoupled from presentation. Use services and Angular Signals (`input()`, `computed()`, etc.) to handle business logic, state management, and external API requests.
- **Naming Conventions:** Follow the Angular Style Guide naming conventions (e.g., `*.component.ts`, `*.service.ts`, `*.directive.ts`).
- **Templates:** Use native control flow (`@if`, `@for`, `@switch`) instead of legacy directive-based templates (`*ngIf`, `*ngFor`).

---

## ⚙️ NestJS (Backend) Project Organization Rules

Organize the NestJS application located in `apps/backend/src/` using a clean, module-based domain-driven structure:

### Directory Structure
- **Core Module (`src/core/`):** Global configurations, database connection modules, filters, interceptors, and guards.
- **Feature Modules (`src/[feature-name]/`):** Place controllers, services, modules, and domain models together by feature.
  - Structure each feature: `apps/backend/src/[feature-name]/`
    - `dto/` - Data Transfer Objects for input validation (using `class-validator`).
    - `entities/` - Database schemas or ORM entities.
    - `[feature-name].controller.ts` - HTTP request handlers.
    - `[feature-name].service.ts` - Business logic and database operations.
    - `[feature-name].module.ts` - Feature module definition.

### Best Practices & Rules
- **Business Logic Separation:** Never put raw business logic in controllers; delegate strictly to services.
- **Input Validation:** Use DTOs with validation decorators for all inputs.
- **Error Handling:** Standardize error handling using NestJS built-in Exceptions.
- **TypeScript:** Use strict type checking and avoid using `any`.
