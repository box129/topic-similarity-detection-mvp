# Repository Workflow

## Branching Approach

Use small, focused branches for each task. Name branches by purpose, for example `fix/frontend-results-display`, `docs/update-api-notes`, or `test/backend-similarity`.

## Starting A Task

Before changing files, inspect the relevant area of the repo and read `docs/archive/status-reports/current-status.md` and `AGENTS.md`. Check the worktree for existing changes so current work is not overwritten.

## Small Focused Changes

Keep changes limited to the task. Avoid broad rewrites, folder restructuring, or changes to protected similarity, API, database, frontend mapping, or SBERT logic unless the task specifically requires it.

## Updating Docs

When behavior, API responses, setup steps, ports, commands, data flow, or testing instructions change, update the related docs in the same PR.

## Testing Before PRs

Before opening or updating a PR, run the relevant checks for the changed area:

- Backend: `cd backend && npm test`
- Frontend: `cd frontend && npm test`
- Frontend build: `cd frontend && npm run build`
- SBERT service: `cd sbert-service && python test_service.py`
- Manual check when needed: backend health, frontend submission, and results display.

If a check is not run, state why in the PR.

## Needs Verification

Do not guess when something is unclear. Mark it as `needs verification` in code comments, docs, PR notes, or task summaries so it can be checked later.
