# Battle History Saved Results Spec

## Request Summary

Add battle history with automatically saved successful results, a detail view, and a delete action.

## Date

2026-05-13

## Source Prompt

`workflow add battle history with saved results, detail view, and delete action`

## Questions Asked And Answers Received

- Persistence: Persist battle history through the backend/API so it survives across sessions.
- Save trigger: Save a successful battle automatically after analysis completes.
- Stored data: Store result data only for now: `id`, `winner`, `score`, `createdAt`, `selfieA label/name`, `selfieB label/name`, and `analysis summary`. Do not store image previews yet.
- Detail view: Use a separate route: `/battles/:battleId`.
- Delete behavior: Ask for confirmation before deleting. Single-result delete is enough for now.
- Execution preference: Keep default `single-task`.

## Assumptions

- The existing analyze response can remain backward-compatible while adding history fields.
- The saved battle `id` should match the `battleId` used by the route.
- `score` means the winner score. For a tie, use the stronger of the two image scores as the headline score.
- `analysis summary` maps to the current backend verdict text.
- Because the current repo has no database connection or Mongoose dependency wired yet, the first backend task may use a backend-owned persistent history service without images. A later architecture task can migrate storage to MongoDB if project deployment requires durable persistence across server restarts/dyno replacement.
- The frontend detail route can be implemented after the backend API exists.

## Goal

Users can run a battle, have successful results saved automatically, revisit saved battle results from a history experience, open a detail page at `/battles/:battleId`, and delete a saved result after confirmation.

## Non-Goals

- Do not store image previews or uploaded image files in history.
- Do not add authentication or per-user ownership.
- Do not add bulk delete.
- Do not change the face scoring algorithm.
- Do not change deployment targets.

## Users

- Public app users comparing two uploaded selfies.
- Operators or testers verifying battle history through the API and UI.

## Functional Requirements

- A successful `POST /api/battles/analyze` saves a history record automatically.
- A history record contains:
  - `id`
  - `winner`
  - `score`
  - `createdAt`
  - `selfieAName`
  - `selfieBName`
  - `analysisSummary`
- Failed analyses must not save a history record.
- API supports listing saved battles.
- API supports fetching one saved battle by id.
- API supports deleting one saved battle by id.
- Deleting a missing battle returns a consistent not-found error.
- Frontend exposes a history list or entry point from the battle workspace.
- Frontend detail view lives at `/battles/:battleId`.
- Frontend delete action asks for confirmation before deleting.

## UI Expectations

- Use existing dark battle-workspace visual language and Tailwind styling.
- Use a real route for detail view: `/battles/:battleId`.
- Show loading, empty, and error states for history/detail data.
- Show a concise saved result summary with names, winner, score, date, and summary.
- Confirmation for delete should be explicit and accessible.
- Do not show stored image previews because they are out of scope.
- Apply `design-taste-frontend` final pre-flight before frontend output.

## API Expectations

- Keep all frontend calls through `client/src/lib/api.js` and service functions.
- Proposed endpoints:
  - `POST /api/battles/analyze`
  - `GET /api/battles`
  - `GET /api/battles/:battleId`
  - `DELETE /api/battles/:battleId`
- Error responses should keep the existing `{ error: { code, message } }` shape.
- Do not expose sensitive data.

## Data Model Expectations

Battle history record:

```json
{
  "id": "battle_abc123",
  "winner": "A",
  "score": 82.4,
  "createdAt": "2026-05-13T20:00:00.000Z",
  "selfieAName": "a.png",
  "selfieBName": "b.png",
  "analysisSummary": "Selfie A wins on sharper framing."
}
```

## Edge Cases

- Analyze succeeds but save fails: return an API error rather than pretending the result was saved.
- Missing history id returns `BATTLE_NOT_FOUND`.
- Deleting the same id twice returns not found on the second delete.
- Empty history returns an empty array and renders an empty UI state.
- Invalid route id should not crash the frontend.

## Constraints

- Follow existing Express route/controller/service patterns.
- Keep backend flat under `server/`; do not add `server/src/`.
- Do not hard-code frontend API URLs.
- Do not store image previews yet.
- Do not introduce unrelated refactors.
- Keep the first execution to one task because execution preference is `single-task`.

## Success Criteria

- Backend tests prove successful analyses are saved automatically.
- Backend tests prove list/detail/delete behavior.
- Existing battle analysis behavior remains compatible.
- Later frontend tasks can consume the API through service/query hooks.
- Workflow artifacts are created and updated.

## Out-Of-Scope Items

- Image persistence.
- User accounts.
- Cross-user privacy controls.
- Bulk management.
- Production database migration unless explicitly approved.
- Deployment changes.

## Open Questions

- Should backend persistence eventually use MongoDB/Mongoose to align with the declared project stack and Heroku deployment?
- Should history records be scoped per anonymous browser in the future?
