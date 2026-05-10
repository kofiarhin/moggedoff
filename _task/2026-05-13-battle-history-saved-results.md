# Battle History Saved Results Task Plan

## Spec File Used

`_spec/2026-05-13-battle-history-saved-results.md`

## Planning Date

2026-05-13

## Progress And Summary Files Read

- `_progress/progress.md`
- `_handoff/current.md`
- `_summary/2026-05-13-battle-analysis-loading-state.md`

## Repo Context Read

- `RUN_WORKFLOW.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/ARCHITECTURE.md`
- `docs/VERIFY.md`
- `package.json`
- `client/package.json`
- `server/controllers/battleController.js`
- `server/routes/battleRoutes.js`
- `server/tests/battleRoutes.test.js`
- `client/src/pages/BattlePage.jsx`
- `client/src/services/battleService.js`
- `client/test/BattleUploader.test.jsx`

## Execution Preference

`single-task`: execute only `TASK-001`, then review, summarize, and stop.

## Task List

### TASK-001: Save successful battles and expose history API

Status: `Done`

Objective:
Automatically save successful battle analysis records on the backend and expose list, detail, and single-delete API endpoints for saved battle results.

Files likely affected:

- `server/controllers/battleController.js`
- `server/routes/battleRoutes.js`
- `server/services/battleHistoryService.js`
- `server/tests/battleRoutes.test.js`
- `_progress/progress.md`
- `_handoff/current.md`

Checklist:

- Add a backend history service that stores result-only records.
- Save one history record after successful analysis.
- Include `id`, `score`, `createdAt`, selfie names, and `analysisSummary` in the response without breaking existing fields.
- Add `GET /api/battles` for history list.
- Add `GET /api/battles/:battleId` for detail.
- Add `DELETE /api/battles/:battleId` for single delete.
- Add backend tests for save, list, detail, delete, and not-found behavior.

Acceptance criteria:

- Successful analysis returns existing result fields plus saved-history fields.
- Failed analysis does not save a record.
- History list returns saved records.
- Detail endpoint returns one saved record by id.
- Delete endpoint removes one saved record.
- Missing detail/delete returns `BATTLE_NOT_FOUND`.

Verification commands:

```bash
npm run test:server -- server/tests/battleRoutes.test.js
npm run test:server
```

Stop condition:

- Stop after this task is verified, reviewed, documented, and summarized because execution preference is `single-task`.

Out-of-scope items:

- Frontend history UI.
- `/battles/:battleId` frontend route.
- Delete confirmation UI.
- Image persistence.
- Authentication.
- MongoDB migration.

### TASK-002: Add frontend battle history data hooks and services

Status: `Planned`

Objective:
Add frontend service functions and TanStack Query hooks for listing, fetching, and deleting saved battle history.

Files likely affected:

- `client/src/services/battleService.js`
- `client/src/hooks/queries/useBattleHistory.js`
- `client/src/hooks/queries/useBattleDetail.js`
- `client/src/hooks/mutations/useDeleteBattle.js`
- `client/test/battleService.test.js`

Checklist:

- Add service functions through shared API client.
- Add query hooks for list/detail.
- Add delete mutation hook with cache invalidation.
- Add focused service tests.

Acceptance criteria:

- Frontend data layer can call history endpoints without hard-coded URLs.
- Delete invalidates affected history queries.

Verification commands:

```bash
cd client && npm test -- battleService.test.js
```

Stop condition:

- Stop if endpoint contract differs from `TASK-001`.

Out-of-scope items:

- Visual UI.
- Routing.

### TASK-003: Add history list and detail route UI

Status: `Planned`

Objective:
Add a battle history entry point, list UI, and detail route at `/battles/:battleId`.

Files likely affected:

- `client/src/App.jsx`
- `client/src/pages/BattlePage.jsx`
- `client/src/pages/BattleDetailPage.jsx`
- `client/src/components/BattleHistoryList.jsx`
- `client/test/BattleUploader.test.jsx`

Checklist:

- Wire routing for `/` and `/battles/:battleId`.
- Render history list with loading, empty, and error states.
- Render detail page with saved result data.
- Keep styling consistent with existing dark workspace.
- Apply `design-taste-frontend` final pre-flight.

Acceptance criteria:

- Users can open a saved battle detail page from history.
- Detail page handles loading, missing, and error states.
- UI remains responsive and accessible.

Verification commands:

```bash
cd client && npm test
cd client && npm run build
```

Stop condition:

- Stop if routing dependency is missing and adding it is not approved in that workflow run.

Out-of-scope items:

- Delete action.
- Image previews.

### TASK-004: Add confirmed delete action in detail view

Status: `Planned`

Objective:
Allow users to delete one saved battle from the detail page after confirmation.

Files likely affected:

- `client/src/pages/BattleDetailPage.jsx`
- `client/src/hooks/mutations/useDeleteBattle.js`
- `client/test/BattleUploader.test.jsx`

Checklist:

- Add explicit confirmation before delete.
- Call delete mutation.
- Navigate or return users to the battle workspace/history after success.
- Show loading and error states for delete.
- Apply `design-taste-frontend` final pre-flight.

Acceptance criteria:

- Users cannot delete without confirming.
- Successful delete removes the result from history data.
- Failed delete shows an inline error.

Verification commands:

```bash
cd client && npm test
cd client && npm run build
```

Stop condition:

- Stop if navigation behavior needs product confirmation.

Out-of-scope items:

- Bulk delete.
- Undo.
