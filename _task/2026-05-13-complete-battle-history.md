# Complete Battle History Task Plan

## Spec File Used

`_spec/2026-05-13-complete-battle-history.md`

## Planning Date

2026-05-13

## Progress And Summary Files Read

- `_progress/progress.md`
- `_handoff/current.md`
- `_summary/2026-05-13-battle-history-saved-results.md`

## Repo Context Read

- `RUN_WORKFLOW.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/ARCHITECTURE.md`
- `docs/VERIFY.md`
- `package.json`
- `client/package.json`
- `server/controllers/battleController.js`
- `server/routes/battleRoutes.js`
- `server/services/battleHistoryService.js`
- `server/tests/battleRoutes.test.js`
- `client/src/App.jsx`
- `client/src/main.jsx`
- `client/src/pages/BattlePage.jsx`
- `client/src/services/battleService.js`
- `client/test/battleService.test.js`
- `client/test/BattleUploader.test.jsx`

## Execution Preference

`complete-workflow`: execute every task in order until the request is complete or blocked.

## Task List

### TASK-001: Complete saved battle fields on the backend

Status: `Done`

Objective:
Store and return `loser` and `battleType` alongside the existing saved battle fields.

Files likely affected:

- `server/services/battleHistoryService.js`
- `server/controllers/battleController.js`
- `server/tests/battleRoutes.test.js`
- `_progress/progress.md`
- `_handoff/current.md`

Checklist:

- Preserve existing history endpoints.
- Add `loser` to normalized history records.
- Add `battleType` to normalized history records.
- Save both fields automatically after successful analysis.
- Return both fields from analyze, list, and detail responses.
- Update backend route tests.

Acceptance criteria:

- Successful analysis response includes `loser` and `battleType`.
- History list/detail records include `loser` and `battleType`.
- Existing backend tests still pass.

Verification commands:

```bash
npm run test:server -- server/tests/battleRoutes.test.js
npm run test:server
```

Stop condition:

- Stop if backend persistence behavior changes beyond adding the requested fields.

Out-of-scope items:

- Frontend UI.
- MongoDB migration.

### TASK-002: Add frontend battle history services and query hooks

Status: `Done`

Objective:
Add frontend service functions and TanStack Query hooks for listing, fetching, and deleting saved battle history.

Files likely affected:

- `client/src/services/battleService.js`
- `client/src/hooks/queries/useBattleHistory.js`
- `client/src/hooks/queries/useBattleDetail.js`
- `client/src/hooks/mutations/useDeleteBattle.js`
- `client/test/battleService.test.js`
- `_progress/progress.md`
- `_handoff/current.md`

Checklist:

- Add `listBattles`, `getBattle`, and `deleteBattle` service functions through the shared API client.
- Add query hook for history list.
- Add query hook for detail.
- Add delete mutation hook with cache invalidation.
- Add focused service tests.

Acceptance criteria:

- Frontend data layer can call history endpoints without hard-coded URLs.
- Delete invalidates affected history queries.
- Service errors are normalized.

Verification commands:

```bash
cd client && npm test -- battleService.test.js
```

Stop condition:

- Stop if API contract differs from the backend implementation.

Out-of-scope items:

- Visual UI.
- Routing.

### TASK-003: Add history and detail routes

Status: `Done`

Objective:
Add `/battle-history` and `/battles/:battleId` frontend routes with history list and detail UI.

Files likely affected:

- `client/package.json`
- `client/package-lock.json`
- `client/src/App.jsx`
- `client/src/pages/BattlePage.jsx`
- `client/src/pages/BattleHistoryPage.jsx`
- `client/src/pages/BattleDetailPage.jsx`
- `client/test/BattleHistory.test.jsx`
- `_progress/progress.md`
- `_handoff/current.md`

Checklist:

- Install `react-router-dom` if needed.
- Wire routes for `/`, `/battle-history`, and `/battles/:battleId`.
- Add a history entry point from the battle workspace.
- Render history list loading, empty, error, and data states.
- Render detail loading, error/not-found, and data states.
- Keep layout responsive and accessible.
- Apply `design-taste-frontend` guidance.

Acceptance criteria:

- Users can open `/battle-history`.
- Users can open a battle detail from history.
- Users can open a successful battle result's detail page.
- Loading, empty, and error states are visible and tested where practical.

Verification commands:

```bash
cd client && npm test
cd client && npm run build
```

Stop condition:

- Stop if adding React Router fails or breaks app bootstrapping.

Out-of-scope items:

- Delete action.
- Image previews.

### TASK-004: Add confirmed delete action

Status: `Done`

Objective:
Allow users to delete one saved battle from the detail page after confirmation.

Files likely affected:

- `client/src/pages/BattleDetailPage.jsx`
- `client/test/BattleHistory.test.jsx`
- `_progress/progress.md`
- `_handoff/current.md`

Checklist:

- Add explicit confirmation modal/prompt before delete.
- Call delete mutation only after confirmation.
- Show pending and error states.
- Navigate back to `/battle-history` after successful delete.
- Keep cached history/detail data consistent.
- Apply `design-taste-frontend` final pre-flight.

Acceptance criteria:

- Canceling confirmation does not call delete.
- Confirming delete calls the delete endpoint.
- Successful delete returns users to history.
- Failed delete shows an inline error.

Verification commands:

```bash
cd client && npm test
cd client && npm run build
```

Stop condition:

- Stop if routing/navigation behavior needs new product approval.

Out-of-scope items:

- Bulk delete.
- Undo.
