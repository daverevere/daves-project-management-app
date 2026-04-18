# Cursor Context and Product Vision

## What this project is

This app is a local-first career operating system for Dave Revere. It is not a generic productivity dashboard. It is specifically being built to help Dave pivot over 12 months from his current role as a Staff AI Engineer at SonderMind toward roles that look more like AI governance, AI evaluation, AI oversight, AI safety-adjacent implementation, or other human-centered AI judgment roles.

The app exists because ordinary to-do lists and vague weekly plans were not enough. Dave wanted something that:
1. tells him what to do this week
2. explains why that work matters
3. states the intended learning or development outcome
4. accumulates real evidence of progress over time
5. can be maintained and extended inside Cursor rather than being trapped in chat

## Why this app is being built

Dave has been carrying a lot:
- high work stress
- family financial pressure
- uncertainty about the future of AI and work
- a desire to build more agency and optionality
- a wish to become far more fluent with AI tooling, orchestration, workflow automation, and governance thinking

He does not want a vague “learn AI” plan. He wants a system that makes progress concrete.

The first version of the app was too vague. It tracked tasks but did not clearly encode:
- the 12-month target state
- what each week was supposed to accomplish
- why each week existed
- what the development outcome was
- how the plan ladders up into a real career pivot

This version addresses those gaps.

## Core product principles

### 1. Explain the why
Every week or month should say:
- what you are doing
- why you are doing it
- what development outcome is intended
- what deliverables prove the work happened

### 2. Local-first and Cursor-friendly
Dave wants to use Cursor as his primary environment.
Assumptions:
- Cursor is on a personal account
- Claude access comes through the Cursor subscription
- Gemini through work is available for second-opinion review
- Claude Code remains reserved for repo-aware work and real work tasks, with token discipline

The code should remain easy to understand and extend. Avoid overengineering.

### 3. Career-only scope
This app should focus on career development, not writing, wellness, family, or general life management. Those may matter in Dave’s life, but this product is focused on:
- AI-Lab setup
- workflow discipline
- learning structure
- governance artifacts
- model comparison habits
- portfolio development
- job-readiness
- career pivot execution

### 4. Agentic engineering, not vibe coding
The philosophy behind the app comes partly from Dave’s training notes from work:
- plan before prompting
- use markdown-first specs
- treat AI like a junior engineer or assistant, not a magic oracle
- verify and review
- compare models rather than trusting one output
- store reusable workflows and templates

### 5. Extendability
This should be a clean foundation for future features. Likely next features:
- notes per week
- artifact tracker
- workflow library pages
- resume and LinkedIn tracker
- application tracker
- export/import
- quarterly review pages
- skill-gap tracker
- evidence log for role-readiness

## The target outcome

The current 12-month target outcome is:

“In 12 months, you have a working personal AI-Lab, repeatable AI workflows, a portfolio of AI governance artifacts, clear tool discipline, and credible job-readiness for AI governance / eval / oversight roles.”

That means the app should always orient back toward:
- systems
- evidence
- role-readiness
- sustainable progress

## The shape of the roadmap

Quarter 1 is broken into detailed week-by-week plans.
Months 1 through 12 are now broken into detailed month plans.

Quarter 1 emphasis:
- foundation
- templates
- workflow discipline
- training extraction
- model comparison
- first governance artifacts
- automation starter
- job-market mapping
- career narrative
- quarter review

Months 1–12 emphasis:
- deepen workflows
- build more artifacts
- package portfolio
- start outreach
- refine external materials
- apply selectively
- prepare for interviews
- close targeted skill gaps
- review and design Year 2

## Important constraints

- Do not let this become a giant generic productivity app.
- Keep the UI understandable and direct.
- Prioritize clarity over cleverness.
- Assume Dave may want Cursor to generate or maintain many future features.
- Avoid locking important knowledge inside components only. It should be easy to inspect and edit.

## What “success” looks like for the app

Success is not “the app has a million features.”
Success is:
- Dave knows exactly what to do this week
- he understands why that work matters
- he produces visible outputs
- the system teaches him how to work with AI like a pro
- the system builds toward a real career pivot, not just endless self-improvement

## Suggested next features

1. Add a notes field and reflection per week
2. Add a portfolio artifact database
3. Add a workflow library section
4. Add a job application tracker
5. Add a role-target matrix
6. Add quarterly review and scoring
7. Add export to markdown or JSON
8. Add persistence beyond localStorage if needed later

## Final instruction to Cursor

When extending this app, protect the core promise:
This tool should help Dave move from vague aspiration to visible, evidence-based career progress in AI governance.

## Important UI corrections requested later

- The sidebar must list all 52 weeks, and all week cards should look visually consistent.
- Weeks 13–52 should not suddenly change style or naming shape in a jarring way.
- Months 4–12 belong in the Roadmap tab, not mixed into the sidebar navigation.
- The app must include a Tasks tab where Dave can create a custom task, assign it to a specific week, and have it persist there.
- User-created tasks should affect that week’s task count in the sidebar and persist in local storage.
