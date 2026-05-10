# Work Request

This file is auto-managed by the workflow. It stores the latest active work request, usually copied from the user's direct Codex prompt.

Users do not need to edit this file manually. You may edit it when you want to stage a request before asking the agent to run the workflow.

The workflow will ask clarifying questions, generate a saved spec in `_spec/`, create a vertical task plan in `_task/`, execute tasks one by one, update `_progress/progress.md`, and write a final summary in `_summary/`.

## Request

`workflow add loading state to battle analysis`

## Question Preference

Choose one:

- `ask questions`: default. Ask focused questions until about 90% understanding before writing the spec.
- `skip questions`: do not ask questions; generate a best-effort spec and record assumptions.

Default: `ask questions`

## Optional Execution Preference

Choose one:

- `plan-only`: ask questions, write spec, write task plan, then stop.
- `single-task`: ask questions, write spec, write task plan, execute only the first ready task, verify, update progress, write summary, then stop.
- `full-auto`: ask questions, write spec, write task plan, execute tasks sequentially until complete, blocked, risky, unclear, or unverified.

Default: `single-task`

## Optional Context

- User or business goal: `<Why this matters>`
- Target users: `<Who uses this>`
- Expected behavior: `<What should happen>`
- UI expectations: `<Screens, components, states, accessibility, responsive behavior>`
- API expectations: `<Endpoints, payloads, errors, auth, permissions>`
- Data model expectations: `<Fields, relationships, migrations, defaults>`
- Edge cases: `<Failure states, empty states, permissions, limits>`
- Constraints: `<Do not change X / must use Y / no new dependencies>`
- Success criteria: `<How we know this is done>`
- Preferred verification: `<Test command, manual check, build command>`

## Out Of Scope

- `<File, feature, API, behavior, or area that should stay untouched>`
