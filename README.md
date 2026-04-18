# Dave's Project Management

A lightweight local Next.js app for project and career planning with a simple built-in backend.

## What this app does

It answers three questions:
1. What am I doing this week?
2. Why am I doing it?
3. What development outcome is this supposed to create?

## Current scope

- 12-week detailed system for Quarter 1
- Months 1-12 detailed roadmap
- Week-by-week objectives, reasons, and deliverables
- Task tracking with backend persistence
- Notes persistence by week
- Multi-project support using the same 52-week data model and UI template

## Why it exists

The original dashboard tracked tasks, but it did not clearly encode:
- the full 12-month outcome
- why each week exists
- what learning or development outcome is intended

This version fixes that.

## Tooling assumptions

- Cursor personal account is the main coding environment
- Claude comes through Cursor
- Gemini through work is used for second-opinion review
- Claude Code remains for repo-aware work only

## Run locally

```bash
npm install
npm run dev
```

Open:
http://localhost:3002

## Lightweight backend

This app now uses local JSON file persistence through Next.js API routes.

- Data file: `data/projects.json`
- Project list and creation: `app/api/projects`
- Project fetch and reset: `app/api/projects/[projectId]`
- Task operations: `app/api/projects/[projectId]/tasks`
- Notes operations: `app/api/projects/[projectId]/notes`

## Start and stop helpers

Spin up:

```bash
npm run dev:start
```

Spin down:

```bash
npm run dev:stop
```

Optional custom port:

```bash
npm run dev:start -- 3010
```

## How to extend this in Cursor

Suggested next features:
- add a real Month 4–12 detailed roadmap
- add notes per week
- add artifact tracker
- add job application tracker
- add workflow library pages
- add export/import
- add scoring and streaks

## Added in this version

- project name updated to Dave's Project Management
- backend persistence for tasks and notes
- multi-project support with a "New project" flow
- reusable shared plan template used for every new project
- start and stop helper scripts for easy app lifecycle management
