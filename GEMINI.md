# React Project Organization Rules
Organize the src directory using a feature-based architecture:
- Move global reusable components to `src/components/common/`.
- Move feature-specific components to `src/features/[feature-name]/components/`.
- Keep hooks in `src/hooks/` and context files in `src/context/`.
- Always update relative import statements inside modified files when moving them.


# /organize
1. Scan all files inside `src/`.
2. Identify loosely grouped components.
3. Propose target directories based on architecture guidelines.
4. Automatically update imports across the codebase.
