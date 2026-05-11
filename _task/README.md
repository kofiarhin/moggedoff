# Task Memory

Store vertical task plans in this folder.

Agents must create a saved task plan here before implementation. Use filenames that match the related spec when practical, for example:

```txt
_task/2026-05-10-add-dark-theme.md
```

Default execution mode is `complete-workflow`: after the task plan is created, execute all generated tasks sequentially until the request/spec is complete or a stop condition is reached.

Execution modes:

- `plan-only`: ask questions, write spec, write task plan, then stop.
- `single-task`: execute only the next ready task, verify and review it, update artifacts, then stop.
- `complete-workflow`: execute all generated tasks sequentially until the request/spec is complete or a stop condition is reached.

Use `single-task` only when the user explicitly asks for controlled one-task execution.

Each task must include:

- Task ID.
- Status.
- Objective.
- Files likely affected.
- Checklist.
- Acceptance criteria.
- Verification commands.
- Stop condition.
- Out-of-scope items.

## Task Status Transitions

Every task must move through:

```txt
Planned -> Ready -> In Progress -> Verified -> Reviewed -> Done
```

Allowed terminal states:

- `Done`
- `Blocked`
- `Needs Human Review`

Rules:

- A task cannot be `Done` unless verification was attempted and the task was reviewed.
- A task cannot move to `Reviewed` unless verification was attempted.
- If verification cannot run, the task can be `Needs Human Review`, not `Done`.

Tasks should be Ralph Wiggum-style: small, literal, sequential, and easy to verify.

Continue to the next task automatically only when the current task is `Done`. Stop if a task is `Blocked`, `Needs Human Review`, fails verification, becomes risky or unclear, or requires external access.
