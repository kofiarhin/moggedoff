# Battle History Storage Decision

## Date

2026-05-13

## Decision

Use a backend-owned JSON file history service for the first battle history API task, and keep MongoDB migration as a follow-up decision before production-grade deployment durability is required.

## Context

The request requires battle history to persist through the backend/API and survive browser sessions. The current repository has Express routes and services but no wired MongoDB connection, Mongoose dependency, models folder, or database environment variable. Execution preference is `single-task`, so the first slice needs to be narrow and verifiable.

## Options Considered

- Add MongoDB/Mongoose immediately.
- Use in-memory storage.
- Use backend-owned JSON file storage.

## Selected Option

Use backend-owned JSON file storage through `server/services/battleHistoryService.js`.

## Consequences

- The API can save, list, fetch, and delete result-only history records now.
- The storage survives browser sessions and local server restarts when the data file remains present.
- This is not a final production persistence strategy for Heroku because dyno filesystems are ephemeral.
- A future MongoDB/Mongoose task should replace the storage service without changing the frontend API contract.

## Affected Files

- `server/services/battleHistoryService.js`
- `server/controllers/battleController.js`
- `server/routes/battleRoutes.js`
- `server/tests/battleRoutes.test.js`
- `.gitignore`

## Follow-Up Tasks

- Add MongoDB/Mongoose persistence for battle history before relying on durable production history on Heroku.
