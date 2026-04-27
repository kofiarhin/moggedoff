# Repository Guidelines

## Project Structure & Module Organization

This repository is a split React/Vite frontend and Express backend.

- `client/src/` contains the frontend app: `components/`, `pages/`, `hooks/`, `services/`, `lib/`, `utils/`, `constants/`, `styles/`, and `assets/`.
- `client/test/` contains Vitest and React Testing Library tests, with shared setup in `client/test/setup.js`.
- `server/` contains the backend without a `src/` wrapper: `app.js`, `server.js`, plus `config/`, `controllers/`, `middleware/`, `routes/`, `services/`, `utils/`, `constants/`, and `tests/`.
- Root files include backend configuration such as `.env`, `.env.example`, and `package.json`.

## Build, Test, and Development Commands

- `npm run dev` starts backend and frontend together via `concurrently`.
- `npm run server` starts the Express server with `nodemon server/server.js`.
- `npm run client` starts the Vite dev server in `client/`.
- `npm test` runs backend Jest tests, then frontend Vitest tests.
- `npm run test:server` runs Jest tests matching `server/tests/**/*.test.js`.
- `npm run test:client` runs `npm run test --prefix client`.
- `npm run build --prefix client` creates the frontend production build.
- `npm run lint --prefix client` runs ESLint for frontend code.

## Coding Style & Naming Conventions

Use JavaScript and JSX with ES modules in the client. Keep components focused on UI and put API calls in `client/src/services/` through `client/src/lib/api.js`. Use Tailwind CSS unless working in an existing SCSS/SASS area. Use descriptive file names such as `BattleUploader.jsx`, `battleService.js`, and `battleService.test.js`.

Use Redux Toolkit for global client state under `client/src/redux/`. Use TanStack Query for server state, wrapped in hooks under `client/src/hooks/queries/` or `client/src/hooks/mutations/`.

## Testing Guidelines

Frontend tests use Vitest and React Testing Library in `client/test/`. Backend tests use Jest and Supertest in `server/tests/`. Name tests by the unit or feature, for example `BattleUploader.test.jsx` or `battleRoutes.test.js`. Add focused tests for new behavior and bug fixes.

## Commit & Pull Request Guidelines

This checkout does not include Git history, so no commit convention can be inferred. Use short imperative messages, for example `Add battle upload validation`. Pull requests should include a summary, test results, linked issues when applicable, and screenshots for UI changes.

## Security & Configuration Tips

Backend environment variables belong in the root `.env`; frontend variables belong in `client/.env` and must use the `VITE_` prefix. Never hard-code secrets or frontend API URLs. Do not expose `passwordHash` or sensitive user data from backend responses.
