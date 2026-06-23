# Angular (Frontend) Project Organization Rules
Organize the Angular application located in `apps/frontend/src/app/` using a clean, standalone component structure:
- **Core Services (`src/app/core/`):** Put singleton services, custom HTTP interceptors, route guards, and global state managers here.
- **Shared Elements (`src/app/shared/`):** Put reusable visual components, directives, custom pipes, and design system models here.
- **Feature Folders (`src/app/features/`):** Organize core features (e.g. `planner`, `focus`, `adhd`, `settings`) in individual folders.
  - Structure each feature: `apps/frontend/src/app/features/[feature-name]/`
    - `components/` - Standalone components specific to the feature.
    - `services/` - Services/APIs specific to the feature.
    - `models/` - Domain interfaces/types.
- **Rules:**
  - Prefer Standalone Components and functional routing.
  - Keep logic decoupled from presentation. Use services to handle business logic, state management, and external API requests.
  - Follow the Angular Style Guide naming conventions (e.g., `*.component.ts`, `*.service.ts`, `*.directive.ts`).

# NestJS (Backend) Project Organization Rules
Organize the NestJS application located in `apps/backend/src/` using a clean, module-based domain-driven structure:
- **Core Module (`src/core/`):** Global configurations, database connection modules, filters, interceptors, and guards.
- **Feature Modules (`src/[feature-name]/`):** Place controllers, services, modules, and domain models together by feature.
  - Structure each feature: `apps/backend/src/[feature-name]/`
    - `dto/` - Data Transfer Objects for input validation (using `class-validator`).
    - `entities/` - Database schemas or ORM entities.
    - `[feature-name].controller.ts` - HTTP request handlers.
    - `[feature-name].service.ts` - Business logic and database operations.
    - `[feature-name].module.ts` - Feature module definition.
- **Rules:**
  - Never put raw business logic in controllers; delegate strictly to services.
  - Use DTOs with validation decorators for all inputs.
  - Standardize error handling using NestJS built-in Exceptions.

