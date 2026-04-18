# Dave's Project Management

A local-first Next.js app for running outcome-focused multi-week projects with built-in persistence, project settings, and week-by-week execution workflows.

## What the app does

- Manage multiple projects with independent plans, context, roadmap phases, tasks, and notes.
- Plan and execute work week-by-week with objective, why, intended outcome, and task details.
- Track completion progress across each project.
- Configure project settings directly in the UI (project name, total weeks, target outcome, context, week setup, and roadmap phases).
- Persist everything locally via an embedded SQLite database.

## Current scope

- Dynamic project duration (1-104 weeks).
- Flexible weekly plans with per-task why/outcome fields.
- Roadmap phases are editable and persisted per project.
- Context is treated as project background for humans/LLMs.
- Notes are stored per week and edited in Week View.
- Tasks tab shows all project tasks in a fixed scrollable window.

## Run locally

```bash
npm install
npm run dev:start
```

Open:
http://localhost:3002

Stop the dev server:

```bash
npm run dev:stop
```

Optional custom port:

```bash
npm run dev:start -- 3010
```

## Persistence and backend

The app uses local SQLite persistence through Next.js API routes.

- Database file: `data/projects.db`
- Project list and creation: `app/api/projects`
- Project fetch/update/delete/settings: `app/api/projects/[projectId]`
- Task operations: `app/api/projects/[projectId]/tasks`
- Notes operations: `app/api/projects/[projectId]/notes`

## Agent/app runbook (project-safe)

Use this section if another agent, script, or app is operating this project.

### Non-negotiable isolation rules

- Always resolve the target `projectId` first from `GET /api/projects`.
- Always write through project-scoped endpoints:
  - `PUT /api/projects/[projectId]`
  - `PUT /api/projects/[projectId]/tasks`
  - `PUT /api/projects/[projectId]/notes`
- Never reuse a stale `projectId` from an earlier run.
- Never update multiple projects in one operation unless explicitly requested.
- Never write directly to `data/projects.db` outside the app APIs, except via the official snapshot admin commands (`db:export`, `db:snapshots`, `db:import`).

### Create a new project (UI flow)

1. Choose/add project name and week count in the top project bar.
2. Click `Add project`.
3. Confirm the new project is selected in the project dropdown.
4. Open `Settings` and save project-specific:
   - target outcome
   - context
   - week setup
   - roadmap phases

### Create a new project (API flow)

```bash
# 1) Create project
curl -s -X POST http://localhost:3002/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"My New Project","weeks":12}'

# 2) List projects and copy the new id
curl -s http://localhost:3002/api/projects

# 3) Update only that project via its id
curl -s -X PUT "http://localhost:3002/api/projects/<projectId>" \
  -H "Content-Type: application/json" \
  -d '{
    "action":"settings",
    "name":"My New Project",
    "targetOutcome":"...",
    "totalWeeks":12,
    "context": { "...": "..." },
    "plan": [],
    "roadmap": []
  }'
```

### Safe update checklist (before any write)

- Read current target project with `GET /api/projects/<projectId>`.
- Verify returned `name` matches intended project.
- Perform one scoped write.
- Re-read both:
  - target project should reflect the change
  - at least one non-target project should remain unchanged

### Anti-bleed verification pattern

When automating, use a marker test:

1. Add temporary marker text to target project context.
2. Confirm marker appears only in target project.
3. Remove marker.

This confirms no cross-project writes.

## Database snapshots (backup/restore)

Export a snapshot:

```bash
npm run db:export
```

List snapshots:

```bash
npm run db:snapshots
```

Import a snapshot (requires `--force` and dev server stopped):

```bash
npm run db:import -- data/snapshots/<snapshot-file>.db --force
```

Import automatically creates a pre-import backup snapshot.
The import safety check detects servers started via `npm run dev:start`; also make sure no other `next dev` process is running before import.

## Notes

- Legacy `data/projects.json` is treated as a migration source if the database is empty.
- Active persistence is SQLite (`data/projects.db`).
