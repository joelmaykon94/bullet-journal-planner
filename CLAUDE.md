# Claude AI Rules & Guidelines — Bullet Journal Planner

This file serves as the environment guide for Claude. To separate AI instructions from project documentation, the full documentation is organized under the `docs/` directory.

---

## 📚 AI Documentation Index

- **GSD Canonical Rules**: [docs/ai/PROJECT_RULES.md](docs/ai/PROJECT_RULES.md)
- **GSD Style Guide**: [docs/ai/GSD-STYLE.md](docs/ai/GSD-STYLE.md)
- **Coding Guidelines (Angular & NestJS)**: [docs/ai/CODING_GUIDELINES.md](docs/ai/CODING_GUIDELINES.md)
- **Custom Tools Rules**: [docs/ai/CUSTOM_TOOLS.md](docs/ai/CUSTOM_TOOLS.md)

---

## 🛠️ Build & Test Commands

- **Install dependencies:** `pnpm install`
- **Start frontend (Angular):** `pnpm --filter frontend start`
- **Start backend (NestJS):** `pnpm --filter backend start:dev`
- **Build frontend:** `pnpm --filter frontend build`
- **Build backend:** `pnpm --filter backend build`
- **Run frontend tests:** `pnpm --filter frontend test`
- **Run backend tests:** `pnpm --filter backend test`

---

## ⚠️ Core System Instructions (Active Guard Rails)

To ensure these rules remain active inside the agent's system prompt, the core tool rules are summarized below:

### Custom Tools Rules (Workspace `/tools`)
- **Mandatory Tool Rules:**
  1. Use `search_symbol` or `find_usages` before opening any file.
  2. Use `summarize_file` before reading a file completely to decide if it's worth it.
  3. Use `list_changed_files` at start of review or debugging.
  4. Only read complete files when the tools above aren't sufficient.
