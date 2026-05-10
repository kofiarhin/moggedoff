# Battle Empty State Message Task Plan

## Spec File Used

`_spec/2026-05-13-battle-empty-state-message.md`

## Planning Date

2026-05-13

## Progress And Summary Files Read

- `_progress/progress.md`
- `_summary/README.md`
- `_handoff/current.md`

## Task List

### TASK-001: Show requested no-result message on Battle page

Status: Done

Objective:
Update the existing Battle result empty state so users see the requested no-result message before a battle result exists and after reset.

Files likely affected:

- `client/src/components/BattleResult.jsx`
- `client/test/BattleUploader.test.jsx`

Checklist:

- Confirm the current Battle page renders `BattleResult` for no-result state.
- Replace or combine the existing empty-state copy with the exact requested sentence.
- Update focused test assertions to check the exact requested message.
- Run the focused frontend test for the Battle page.
- Review the UI change against the design pre-flight matrix.

Acceptance criteria:

- The UI contains `No battle result yet. Upload two selfies to start a matchup.` when no result exists.
- Pending, error, and success states remain unchanged.
- Reset returns to the requested empty-state message.
- Focused Battle page tests pass.

Verification commands:

```bash
cd client && npm test -- BattleUploader.test.jsx
```

Stop condition:

- Stop if focused verification cannot run, or if changing the message requires broader Battle page behavior changes.

Out-of-scope items:

- Backend changes.
- API client changes.
- Upload validation changes.
- Full Battle page redesign.
