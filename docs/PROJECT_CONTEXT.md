# Project Context

This file captures durable repository facts discovered during workflow runs. Keep it concise and update it when repo conventions become clear.

## Project Summary

- Project name: Moggoff
- Purpose: Selfie battle analysis app.
- Current maturity: MVP/prototype.

## Stack

- Frontend: React with Vite
- Backend: Express
- Database: No database is currently wired in code; battle history uses a backend JSON file service as a temporary persistence layer.
- Runtime: Node.js
- Languages: JavaScript
- Styling: Tailwind CSS v4 through `@tailwindcss/vite`
- Deployment: Frontend Namecheap and backend Heroku per project rules.

## Package Manager

- Detected package manager: npm
- Lockfiles: `package-lock.json`, `client/package-lock.json`
- Install command: `npm install` at root and `npm install --prefix client` for client-only dependencies.

## Common Commands

```bash
# Test
npm test

# Lint
cd client && npm run lint

# Build
cd client && npm run build

# Typecheck
# No typecheck script is currently configured.
```

## Testing Tools

- Unit tests: Jest for backend service/route tests; Vitest for frontend tests.
- Integration tests: Supertest for backend API routes.
- End-to-end tests: None currently configured.
- Manual verification notes: Use frontend build plus targeted tests for UI work.

## Repo Conventions

- Folder conventions: Frontend code is under `client/src`; backend code is flat under `server/`.
- Naming conventions: Components use PascalCase; hooks use `use...` names.
- API conventions: Backend routes live under `/api`; battle endpoints live under `/api/battles`.
- State management conventions: TanStack Query is used for server state; upload workflow uses local component state.
- Error handling conventions: Backend errors return `{ error: { code, message } }`; frontend normalizes API errors in `client/src/lib/api.js`.

## Architecture Rules

- Frontend API calls go through `client/src/lib/api.js` and service functions.
- Backend route handlers delegate persistence and scoring to services.

## Known Constraints

- Do not hard-code frontend API origins; use `VITE_API_URL`.
- The current backend history JSON-file persistence is not production-durable on Heroku.

## Open Questions

- When production durability matters, migrate battle history persistence to MongoDB/Mongoose.
