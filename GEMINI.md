# Gemini AI Rules & Guidelines — Bullet Journal Planner

This file serves as the system rules configuration for Gemini. To separate AI instructions from project documentation, the full documentation is organized under the `docs/` directory.

---

## 📚 AI Documentation Index

- **GSD Canonical Rules**: [docs/ai/PROJECT_RULES.md](docs/ai/PROJECT_RULES.md)
- **GSD Style Guide**: [docs/ai/GSD-STYLE.md](docs/ai/GSD-STYLE.md)
- **Coding Guidelines (Angular & NestJS)**: [docs/ai/CODING_GUIDELINES.md](docs/ai/CODING_GUIDELINES.md)
- **Custom Tools Rules**: [docs/ai/CUSTOM_TOOLS.md](docs/ai/CUSTOM_TOOLS.md)

---

## ⚠️ Core System Instructions (Active Guard Rails)

To ensure these rules remain active inside the agent's system prompt (since this file is loaded automatically via system configuration), the core coding guidelines and tool rules are summarized below:

### 1. Angular (Frontend) Project Organization
- **Path:** `apps/frontend/src/app/`
- **Core Services (`src/app/core/`):** Singleton services, custom interceptors, guards, global state managers.
- **Shared Elements (`src/app/shared/`):** Reusable components, directives, pipes, shared models.
- **Feature Folders (`src/app/features/`):** Features like `planner`, `focus`, `adhd`, `settings` inside individual folders with `components/`, `services/`, and `models/`.
- **Rules:** Prefer Standalone Components, use Angular Signals for state management, decouple logic from templates.

### 2. NestJS (Backend) Project Organization
- **Path:** `apps/backend/src/`
- **Core Module (`src/core/`):** Global configurations, database connection modules, filters, interceptors, and guards.
- **Feature Modules (`src/[feature-name]/`):** Controllers, services, modules, and database schemas/entities by feature.
  - Structure: `dto/`, `entities/`, `[feature-name].controller.ts`, `[feature-name].service.ts`, `[feature-name].module.ts`
- **Rules:** Keep controllers thin, delegate strictly to services, validate inputs using DTOs with `class-validator`.

### 3. Custom Tools Rules (Workspace `/tools`)
- **Mandatory Tool Rules:**
  1. Use `search_symbol` or `find_usages` before opening any file.
  2. Use `summarize_file` before reading a file completely to decide if it's worth it.
  3. Use `list_changed_files` at start of review or debugging.
  4. Only read complete files when the tools above aren't sufficient.

### 4. Active Testing & Property Validation Guardrail
- **Tester Discipline**: Run complete verification checks (`pnpm build:backend && pnpm test:backend` and `pnpm build:frontend && pnpm --filter frontend test --no-watch`) before completing any task.
- **Double-Ended Match**: Ensure all payload properties returned by backend APIs exactly match the types and properties consumed by Angular templates, signals, and services to prevent runtime failures.
- **TDD Cycles**: Follow test-driven cycles (write/update tests before or during implementation, verify failures first, then verify success).
