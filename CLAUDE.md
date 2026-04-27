# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Moggoff is a "photo battle" web app where users upload two selfies and receive an AI-driven score comparison. The backend calls the Azure Face API to analyze each image, a deterministic scoring algorithm produces a 0–100 score per face, and the result is displayed in the React frontend.

## Commands

### Development

```bash
npm run dev          # Start both client (port 5173) and server (port 5000) concurrently
npm run server       # Server only (nodemon)
npm run client       # Client only (Vite)
```

### Testing

```bash
npm test             # Run all tests (server + client)
npm run test:server  # Jest (Node env, runs in band)
npm run test:client  # Vitest
```

Run a single backend test file:
```bash
npx jest server/tests/battleRoutes.test.js --runInBand
```

Run a single frontend test file (from `client/`):
```bash
npx vitest run test/BattleUploader.test.jsx
```

### Build & Lint

```bash
npm run build --prefix client   # Vite production build
npm run lint --prefix client    # ESLint
```

## Environment

Root `.env` (for the server):
```
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
AZURE_FACE_API_KEY=
AZURE_FACE_API_ENDPOINT=
UPLOAD_MAX_MB=5
```

Client `.env` (`client/.env`):
```
VITE_API_URL=http://localhost:5000
```

Server startup validates required env vars and will throw on missing Azure credentials.

## Architecture

### Request Flow

```
Browser → POST /api/battles/analyze (multipart: selfieA, selfieB)
  → rateLimit middleware (20 req/60s)
  → multer upload (memory storage)
  → validateUpload (MIME + magic bytes)
  → battleController
      → azureFaceService.analyzeFace() × 2 (parallel)
      → battleScoringService.scoreFace() × 2
      → battleScoringService.compareFaces()
  → JSON response { faceA, faceB, winner, confidence, verdict }
```

### Backend (`server/`)

- **`app.js`** – Express factory (helmet, CORS, routes, error handler)
- **`server.js`** – Entry point; validates env, starts listening
- **`routes/battleRoutes.js`** – Single route: `POST /api/battles/analyze`
- **`controllers/battleController.js`** – Calls Azure in parallel, scores, returns result, always cleans up files in `finally`
- **`services/azureFaceService.js`** – Wraps Azure Face Detect API; 8s timeout; normalizes response; never exposes raw Azure payload
- **`services/battleScoringService.js`** – Deterministic 0–100 scoring: base 50, quality bonus/penalty, smile, head pose alignment, occlusion, blur/exposure/noise; tie threshold 1.5 pts; confidence clamped 0.5–0.95
- **`middleware/upload.js`** – Multer memory storage; accepts `selfieA`/`selfieB` fields; enforces MIME + size
- **`middleware/validateUpload.js`** – Secondary validation; checks magic bytes (JPEG `FF D8 FF`, PNG `89 50 4E 47`, WEBP `RIFF…WEBP`)
- **`middleware/rateLimit.js`** – Returns `RATE_LIMITED` JSON error code on 429
- **`middleware/errorHandler.js`** – Normalizes Multer errors and all uncaught exceptions into `{ error: { code, message } }`
- **`utils/httpErrors.js`** – `createHttpError(status, code, message, details)` factory
- **`utils/asyncHandler.js`** – Wraps async route handlers

### Frontend (`client/src/`)

- **`main.jsx`** – React 19 entry; wraps app in `QueryClientProvider` (no retry on mutation failures)
- **`App.jsx`** – Renders `BattlePage`
- **`pages/BattlePage.jsx`** – Owns file state and preview URLs; revokes object URLs on cleanup
- **`components/BattleUploader.jsx`** – Two `ImageDropzone`s + analyze/new-battle buttons
- **`components/ImageDropzone.jsx`** – Drag-drop, keyboard-accessible file input with inline validation
- **`components/BattleResult.jsx`** – Handles empty / loading / error / success states; `aria-live` region
- **`components/AnalysisMeter.jsx`** – Score display with visual progress bars
- **`lib/api.js`** – Axios instance (`VITE_API_URL`, 12s timeout, normalized errors)
- **`services/battleService.js`** – Builds `FormData` and calls `/api/battles/analyze`
- **`hooks/mutations/useAnalyzeBattle.js`** – TanStack Query `useMutation` wrapping `battleService`
- **`utils/fileValidation.js`** – Client-side MIME + size check (returns `{ code, message }`)

### Tests

- **`server/tests/battleRoutes.test.js`** – Supertest integration: health route, upload validation, Azure mock, success/error paths
- **`server/tests/battleScoringService.test.js`** – Unit tests for scoring determinism, penalties, ties, confidence bounds
- **`client/test/battleService.test.js`** – FormData construction, error normalization
- **`client/test/BattleUploader.test.jsx`** – File selection, validation, analyze button state, loading/error states
- **`client/test/setup.js`** – Mocks `URL.createObjectURL`/`revokeObjectURL`

## Key Constraints

- **File storage is in-memory (Multer)**. Files are never written to disk in the MVP; `fileCleanupService` is a stub.
- **Single API endpoint**: the entire app revolves around `POST /api/battles/analyze`.
- **Azure attributes** used: `headPose`, `glasses`, `occlusion`, `qualityForRecognition`, `smile`, `blur`, `exposure`, `noise`. Any change to the Azure attribute list must be reflected in `server/constants/faceAttributes.js` and the scoring service.
- **Scoring is entertainment-only**, not an objective beauty metric. Verdicts are intentionally playful.
- **No Redux**: global state is not needed; all server state goes through React Query; UI state is local.
- **No React Router**: the app is a single page; routing is not implemented.
