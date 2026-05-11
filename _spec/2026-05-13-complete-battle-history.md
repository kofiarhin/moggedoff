# Complete Battle History Spec

## Request Summary

Add backend-persisted battle history with automatically saved results, a dedicated history route, a detail route, and a confirmed single delete action.

## Date

2026-05-13

## Source Prompt

`workflow add battle history with saved results, detail view, and delete action`

Follow-up answers:

- Store battle history on the backend so it persists across sessions. No auth/user scoping for now.
- Save `id`, `winner`, `loser`, `score`, `createdAt`, `selfieAName`, `selfieBName`, `analysisSummary`, and `battleType`.
- Add `/battle-history`.
- Add `/battles/:battleId`.
- Require a confirmation prompt/modal before deleting. Single delete only. No undo.
- Save completed battles automatically when results are produced.
- Execution preference: `complete-workflow`.

## Questions Asked And Answers Received

- Persistence: Use backend storage, not browser-only storage.
- User scoping: No auth or user scoping for now.
- Stored fields: `id`, `winner`, `loser`, `score`, `createdAt`, `selfieAName`, `selfieBName`, `analysisSummary`, and `battleType`.
- History access: Dedicated frontend route `/battle-history`.
- Detail access: Dedicated frontend route `/battles/:battleId`.
- Delete behavior: Require confirmation before one-result delete. No undo.
- Save trigger: Save automatically after a battle result is produced.
- Execution mode: Complete the whole workflow unless blocked.

## Assumptions

- The current backend JSON-file history service remains acceptable for this workflow because MongoDB/Mongoose is not wired in this repository yet.
- `score` is the headline winner score. For a tie, it is the stronger of the two image scores.
- `analysisSummary` maps to the existing battle verdict.
- `battleType` can default to `selfie` because the current product compares two selfies and no alternate battle type input exists yet.
- `winner` and `loser` can use `A`, `B`, or `tie`. For ties, `loser` is also `tie`.
- The existing analyze response should stay backward-compatible while adding fields.
- React Router is required by the requested routes and project rules, but it is not currently installed. Adding `react-router-dom` is in scope if needed and will be documented.

## Goal

Users can complete a battle, have its result saved automatically on the backend, view saved battles at `/battle-history`, open a result at `/battles/:battleId`, and delete a saved result only after confirming.

## Non-Goals

- Do not add authentication or ownership.
- Do not store image previews or uploaded images.
- Do not add bulk delete or undo.
- Do not change scoring rules.
- Do not change deployment targets.
- Do not migrate persistence to MongoDB in this workflow.

## Users

- Public app users who run selfie battles.
- Operators or testers verifying saved battle history through the API and UI.

## Functional Requirements

- Successful `POST /api/battles/analyze` saves one history record automatically.
- Failed analysis does not save a history record.
- Saved records include `id`, `winner`, `loser`, `score`, `createdAt`, `selfieAName`, `selfieBName`, `analysisSummary`, and `battleType`.
- API lists saved battles.
- API fetches one saved battle by `battleId`.
- API deletes one saved battle by `battleId`.
- Missing detail/delete returns `BATTLE_NOT_FOUND`.
- Frontend data access uses `client/src/lib/api.js`, service functions, and TanStack Query hooks.
- Frontend route `/battle-history` renders saved battle list states.
- Frontend route `/battles/:battleId` renders detail states and confirmed delete.
- Users can navigate from a successful battle result to its detail page.

## UI Expectations

- Use the existing dark battle-workspace visual language.
- Keep mobile layout single-column and stable.
- Provide loading, empty, and error states for history and detail.
- Show names, winner, loser, score, date, summary, and battle type.
- Delete action must be explicit, accessible, and confirmed in a modal/dialog-like prompt before mutation.
- Do not use image previews for saved results.
- Apply the `design-taste-frontend` final pre-flight before final output.

## API Expectations

- Existing endpoint remains: `POST /api/battles/analyze`.
- Existing history endpoints remain:
  - `GET /api/battles`
  - `GET /api/battles/:battleId`
  - `DELETE /api/battles/:battleId`
- Error responses keep the existing `{ error: { code, message } }` shape.
- Frontend never hard-codes the API origin.

## Data Model Expectations

```json
{
  "id": "battle_abc123",
  "winner": "A",
  "loser": "B",
  "score": 82.4,
  "createdAt": "2026-05-13T20:00:00.000Z",
  "selfieAName": "a.png",
  "selfieBName": "b.png",
  "analysisSummary": "Selfie A wins on sharper framing.",
  "battleType": "selfie"
}
```

## Edge Cases

- Empty history renders a useful empty state.
- Failed history fetch renders an inline error state.
- Missing detail id renders a not-found/error state without crashing.
- Delete confirmation can be canceled without calling the API.
- Failed delete keeps the user on the detail page and shows an inline error.
- Deleting a result removes it from cached history/detail data.

## Constraints

- Follow existing Express controller/service/route patterns.
- Keep backend flat under `server/`.
- Use Tailwind CSS for UI changes.
- Use TanStack Query for server state.
- Keep API logic out of components except through hooks/services.
- Do not overwrite unrelated modified workflow files.
- Do not introduce unrelated dependencies.

## Success Criteria

- Backend tests pass for saved fields and history endpoints.
- Frontend service tests cover list/detail/delete service functions.
- Frontend tests cover history/detail/delete UI behavior.
- Client build passes.
- Workflow progress, handoff, review, and summary artifacts are updated.

## Out-Of-Scope Items

- MongoDB migration.
- User accounts.
- Stored uploaded images.
- Bulk delete.
- Undo after delete.
- Deployment changes.

## Open Questions

- None blocking implementation.
