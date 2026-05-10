# Battle Analysis Loading State Task Plan

## Spec File Used

`_spec/2026-05-13-battle-analysis-loading-state.md`

## Planning Date

2026-05-13

## Progress And Summary Files Read

- `_progress/progress.md`
- `_summary/2026-05-13-battle-empty-state-message.md`
- `_handoff/current.md`

## Task List

### TASK-001: Show explicit loading copy while battle analysis runs

Status: Done

Objective:
Update the pending Battle result panel so users see clear analysis-loading text while the mutation is running.

Files likely affected:

- `client/src/components/SkeletonResult.jsx`
- `client/test/BattleUploader.test.jsx`

Checklist:

- Confirm the pending Battle result branch renders `SkeletonResult`.
- Add visible loading copy to the pending result panel.
- Preserve the existing skeleton shimmer layout and dark styling.
- Update the focused pending-state test to assert the visible loading copy.
- Run the focused frontend test for the Battle page.
- Review the change against the frontend design pre-flight matrix.

Acceptance criteria:

- Pending Battle analysis displays `Analyzing battle... This can take a moment.`
- Existing overlay phase text may remain visible while analysis runs.
- Existing empty, success, and error tests continue to pass.
- Focused Battle page tests pass.

Verification commands:

```bash
cd client && npm test -- BattleUploader.test.jsx
```

Stop condition:

- Stop if the pending state cannot be verified or if adding loading copy requires changing mutation/API behavior.

Out-of-scope items:

- Backend changes.
- API client changes.
- Upload validation changes.
- Full Battle page redesign.
