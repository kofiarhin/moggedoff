# Work Request

This file is auto-managed by the workflow. It stores the latest active work request, usually copied from the user's direct Codex prompt.

Users do not need to edit this file manually. You may edit it when you want to stage a request before asking the agent to run the workflow.

The workflow will ask clarifying questions, generate a saved spec in `_spec/`, create a vertical task plan in `_task/`, execute tasks one by one until the request is complete or stopped, update `_progress/progress.md` and `_handoff/current.md` after each task, write a workflow review in `_review/`, and write a final summary in `_summary/`.

## Request

Add battle history with saved results, detail view, and delete action.

## Question Preference

Choose one:

- `ask questions`: default. Ask focused questions until about 90% understanding before writing the spec.
- `skip questions`: do not ask questions; generate a best-effort spec and record assumptions.

Default: `ask questions`

## Optional Execution Preference

Choose one:

- `plan-only`: ask questions, write spec, write task plan, then stop.
- `single-task`: ask questions, write spec, write task plan, execute only the next ready task, verify and review it, update artifacts, then stop.
- `complete-workflow`: ask questions, write spec, write task plan, then execute all generated tasks sequentially until the request/spec is complete or a stop condition is reached.

Default: `complete-workflow`

## Optional Context

- User or business goal: Preserve completed battle outcomes so users can revisit results later.
- Target users: Application users who complete battles.
- Expected behavior: Automatically save completed battle results, show a battle history list at `/battle-history`, open a detailed result view at `/battles/:battleId`, and allow deleting one saved result after confirmation.
- UI expectations: Dedicated history route, detail route, delete confirmation prompt/modal, empty/loading/error states, accessible controls, responsive behavior.
- API expectations: Backend persistence with list/detail/delete endpoints; no auth or user scoping for now.
- Data model expectations: Save `id`, `winner`, `loser`, `score`, `createdAt`, `selfieAName`, `selfieBName`, `analysisSummary`, and `battleType`.
- Edge cases: Empty history, failed save/load/delete, missing/deleted result detail, unauthorized access if auth is present.
- Constraints: Follow existing repo conventions and workflow artifacts.
- Success criteria: Users can save, view, inspect, and delete battle results; verification is run or documented.
- Preferred verification: Use repo test/build commands discovered during workflow intake.

## Out Of Scope

- `<File, feature, API, behavior, or area that should stay untouched>`
