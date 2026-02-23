# Copilot Instructions for This Repository

## Primary goals
- Keep changes minimal and focused on the user request.
- Preserve existing architecture and naming unless explicitly requested.
- Prefer small, reviewable diffs over broad refactors.

## Cost-aware workflow (premium request optimization)
- Before proposing edits, first inspect the smallest necessary file range.
- Batch related changes in one response instead of many small back-and-forth edits.
- Reuse existing utilities/hooks/components before introducing new files.
- When errors occur, show one concrete fix plan and apply it in one pass.
- Run targeted checks first, then broader checks only if needed.

## Output expectations
- List changed files and why each was changed.
- Avoid unrelated formatting churn.
- If requirement is ambiguous, ask concise clarifying questions first.
- Prefer one complete, validated patch over multiple incremental micro-patches.

## UI and styling rules
- Keep weather icon color tokens managed via `tailwind-variants`.
- For inline SVG in this repo, keep `xmlns="http://www.w3.org/2000/svg"` explicitly.
