# Moggoff MVP Implementation Plan

## 1. Plan Source

This plan implements the specification in:

```txt
_spec/moggoff_implementation_spec.md
```

The goal is a complete MVP where a user uploads two selfies, the backend analyzes both through Azure Face API, computes a deterministic entertainment result, cleans up uploaded files, and the frontend displays the winner with polished loading, error, empty, and success states.

## 2. Implementation Principles

- Keep the MVP small and complete before adding future features.
- Prefer memory-based uploads to avoid persistent image files and simplify cleanup.
- Keep backend provider logic behind `azureFaceService` so tests can mock Azure.
- Keep frontend API calls out of components.
- Use TanStack Query only for the analyze mutation; do not duplicate server data in Redux.
- Use local React state for upload previews and transient form state.
- Do not hard-code API URLs in frontend code.
- Do not expose raw Azure responses to the frontend.
- Use playful but non-cruel copy; results must be framed as photo analysis and entertainment.
- Follow the project structure rules for new files.
- Apply Tailwind consistently after installing/configuring it; do not mix styling systems for the new UI.

## 3. Current Repo Baseline

Observed baseline before implementation:

- Root `package.json` has `client`, `server`, and `dev` scripts.
- `client/` is a Vite React app with starter UI and no Tailwind, TanStack Query, or Axios yet.
- `server/app.js` is empty.
- `server/server.js` only logs `server started`.
- `_spec/moggoff_implementation_spec.md` exists.
- The working directory is not currently a Git repository, so implementation tracking should rely on file checks and command output unless Git is initialized later.

## 4. Recommended Implementation Order

Implement backend contract and tests first, then wire the frontend to that contract. This reduces UI churn because the frontend can target a stable response shape.

High-level order:

1. Foundation and dependencies.
2. Backend configuration, routing, upload, scoring, Azure abstraction, and tests.
3. Frontend Tailwind setup, API client, mutation hook, UI, and tests.
4. End-to-end local verification and cleanup pass.

## 5. Phase 0: Dependency and Tooling Audit

### Tasks

1. Inspect root and client package files.
2. Confirm module format decisions for backend.
3. Decide whether to convert backend to CommonJS or ESM.
4. Confirm Vite and Tailwind-compatible install path.
5. Record exact package additions before implementation.

### Decisions

- Use CommonJS for the backend unless `package.json` is changed to support ESM. Current root package does not declare `"type": "module"`.
- Use native `fetch` on the backend if the active Node version supports it reliably; otherwise install Axios server-side.
- Use Multer memory storage for MVP uploads.
- Install Tailwind with the Vite-compatible setup for the installed Vite version.

### Expected Package Additions

Root/server:

```bash
npm install express cors helmet dotenv multer express-rate-limit
npm install -D nodemon jest supertest
```

Client:

```bash
npm install --prefix client @tanstack/react-query axios
npm install -D --prefix client tailwindcss @tailwindcss/vite vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

Adjust Tailwind packages if the installed Vite/Tailwind versions require a different official setup.

### Acceptance Checks

- `package.json` scripts clearly support backend test execution.
- `client/package.json` scripts clearly support frontend test execution.
- No package is imported before it is installed.

## 6. Phase 1: Environment and Project Foundation

### Backend Tasks

1. Create `server/config/env.js`.
2. Load root `.env` with `dotenv`.
3. Validate required env vars:
   - `AZURE_FACE_API_KEY`
   - `AZURE_FACE_API_ENDPOINT`
4. Normalize config values:
   - `PORT`, default `5000`
   - `NODE_ENV`, default `development`
   - `CLIENT_ORIGIN`, default `http://localhost:5173`
   - `UPLOAD_MAX_MB`, default `5`
5. Ensure env validation can be bypassed or controlled in tests without weakening production startup. Prefer explicit test env values over silent bypasses.
6. Create root `.env.example`.

### Frontend Tasks

1. Create `client/.env.example`.
2. Create `client/src/lib/api.js`.
3. Read base URL from `import.meta.env.VITE_API_URL`.
4. Configure request timeout.
5. Normalize API errors into a predictable shape.

### Shared Tasks

1. Confirm no frontend file contains `http://localhost:5000` outside `.env.example`.
2. Update scripts if needed:
   - root `test`
   - root `test:server`
   - root `test:client`
   - client `test`

### Acceptance Checks

- Starting backend with missing Azure env vars fails with a clear message.
- Test environment can import backend app without requiring real Azure credentials.
- Frontend API client has no hard-coded production or local API URL.

## 7. Phase 2: Backend Core API

### File Targets

```txt
server/
  app.js
  server.js
  config/env.js
  constants/faceAttributes.js
  controllers/battleController.js
  middleware/errorHandler.js
  middleware/rateLimit.js
  middleware/upload.js
  middleware/validateUpload.js
  routes/battleRoutes.js
  services/azureFaceService.js
  services/battleScoringService.js
  services/fileCleanupService.js
  utils/asyncHandler.js
  utils/httpErrors.js
```

### Express App Tasks

1. Build `server/app.js` as the app factory/export.
2. Add `helmet`.
3. Add CORS configured by `CLIENT_ORIGIN`.
4. Add JSON body parser with conservative limit.
5. Add health endpoint:

```txt
GET /api/health
```

6. Mount battle routes:

```txt
/api/battles
```

7. Add not-found handling for API paths.
8. Add final error handler.

### Server Startup Tasks

1. Update `server/server.js` to import config and app.
2. Start listening on configured `PORT`.
3. Log sanitized startup message only.
4. Keep Azure env validation on the startup path.

### Upload Middleware Tasks

1. Use Multer memory storage.
2. Accept two named fields:
   - `selfieA`
   - `selfieB`
3. Enforce max size from `UPLOAD_MAX_MB`.
4. Enforce accepted MIME types:
   - `image/jpeg`
   - `image/png`
   - `image/webp`
5. Convert Multer errors into normalized project errors.

### Upload Validation Tasks

1. Validate both fields are present.
2. Reject extra file fields if practical.
3. Confirm each field has exactly one file.
4. Add simple magic-byte validation if feasible:
   - JPEG starts with `FF D8 FF`
   - PNG starts with `89 50 4E 47`
   - WEBP has `RIFF....WEBP`
5. Return project error codes:
   - `MISSING_FILES`
   - `INVALID_FILE_TYPE`
   - `FILE_TOO_LARGE`

### Azure Service Tasks

1. Implement `analyzeFace(imageBuffer)` in `server/services/azureFaceService.js`.
2. Build Face Detect URL from `AZURE_FACE_API_ENDPOINT`.
3. Request required attributes:
   - `headPose`
   - `glasses`
   - `occlusion`
   - `qualityForRecognition`
4. Include optional attributes only if supported by the API version selected during implementation:
   - `smile`
   - `blur`
   - `exposure`
   - `noise`
5. Send image bytes as `application/octet-stream`.
6. Set `Ocp-Apim-Subscription-Key`.
7. Add request timeout.
8. Normalize Azure output into internal face objects.
9. Map provider failures to `AI_PROVIDER_ERROR` or `UNSUPPORTED_IMAGE`.
10. Do not log raw Azure payloads.

### Scoring Service Tasks

1. Implement `scoreFace(face)` and `compareFaces(faceA, faceB)`.
2. Use deterministic scoring:
   - base score `50`
   - quality bonus/penalty
   - smile bonus when available
   - head pose alignment bonus
   - occlusion penalties
   - blur/exposure/noise penalties when available
   - clamp `0..100`
3. Return:
   - score A
   - score B
   - winner `A`, `B`, or `tie`
   - confidence
   - verdict
4. Keep verdict copy focused on photo factors, not appearance.

### Controller Tasks

1. Read `selfieA` and `selfieB` from `req.files`.
2. Analyze both images through `azureFaceService`.
3. Validate exactly one face in each image.
4. Return:
   - `battleId`
   - `winner`
   - `verdict`
   - `confidence`
   - normalized `images.A`
   - normalized `images.B`
5. Ensure all errors use project error codes.
6. Call cleanup service in a `finally` path even though memory storage is expected. This keeps the code ready if disk storage is later introduced.

### Error Handling Tasks

1. Implement `createHttpError(status, code, message, details?)`.
2. Error handler response format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

3. In production, do not include stack traces.
4. In development, keep stack traces out of API responses unless explicitly needed.

### Acceptance Checks

- `GET /api/health` returns success.
- `POST /api/battles/analyze` rejects missing files.
- `POST /api/battles/analyze` rejects invalid MIME types.
- Mocked Azure success produces the response shape in the spec.
- Mocked Azure zero-face and multiple-face responses return correct error codes.
- No uploaded image is written to disk under the memory-storage MVP path.

## 8. Phase 3: Backend Tests

### Test Setup Tasks

1. Configure Jest for the backend.
2. Ensure tests can import `server/app.js` without starting a network listener.
3. Mock `azureFaceService` in route tests.
4. Use generated in-memory buffers for fake image uploads.

### `server/tests/battleScoringService.test.js`

Test cases:

1. High quality face scores above low quality face.
2. Occlusion decreases score.
3. Bad head pose decreases score.
4. Near-equal score delta returns `tie`.
5. Confidence is clamped to `0.5..0.95`.
6. Score is clamped to `0..100`.
7. Verdict does not include insulting or protected-characteristic language.

### `server/tests/battleRoutes.test.js`

Test cases:

1. Missing files returns `400 MISSING_FILES`.
2. Only one file returns `400 MISSING_FILES`.
3. Invalid file type returns `400 INVALID_FILE_TYPE`.
4. File too large returns `400 FILE_TOO_LARGE`.
5. Azure no-face result returns `400 NO_FACE_DETECTED`.
6. Azure multiple-faces result returns `400 MULTIPLE_FACES_DETECTED`.
7. Azure provider failure returns `502 AI_PROVIDER_ERROR`.
8. Successful analysis returns `battleId`, `winner`, `confidence`, `verdict`, and both image scores.
9. The response does not include raw Azure fields beyond the normalized attributes.

### Acceptance Checks

Run:

```bash
npm run test:server
```

Expected:

- All backend tests pass.
- No real Azure request is made during tests.

## 9. Phase 4: Frontend Foundation

### File Targets

```txt
client/
  src/
    App.jsx
    main.jsx
    index.css
    components/
      AnalysisMeter.jsx
      BattleResult.jsx
      BattleUploader.jsx
      ImageDropzone.jsx
      InlineAlert.jsx
      SkeletonResult.jsx
    hooks/
      mutations/
        useAnalyzeBattle.js
    lib/
      api.js
    pages/
      BattlePage.jsx
    services/
      battleService.js
    utils/
      fileValidation.js
    constants/
      constants.js
  test/
    BattleUploader.test.jsx
    battleService.test.js
    setup.js
```

### Tailwind Tasks

1. Install Tailwind using the compatible Vite setup.
2. Replace starter CSS with Tailwind base/import configuration.
3. Define global body defaults:
   - off-white or zinc background
   - zinc text
   - high-quality sans-serif stack
   - antialiased text
4. Avoid purple/blue gradient styling.
5. Keep one accent color, preferably deep rose or emerald.

### React Query Tasks

1. Wrap app with `QueryClientProvider` in `client/src/main.jsx`.
2. Configure sensible defaults:
   - no automatic retry for upload mutation unless explicitly triggered
   - reasonable stale time is not important for mutation-only MVP

### API and Service Tasks

1. Implement `client/src/lib/api.js` using Axios.
2. Implement `client/src/services/battleService.js`.
3. Implement `client/src/hooks/mutations/useAnalyzeBattle.js`.
4. Ensure `FormData` keys exactly match:
   - `selfieA`
   - `selfieB`
5. Normalize error objects for UI consumption.

### File Validation Tasks

1. Implement `validateImageFile(file)` in `client/src/utils/fileValidation.js`.
2. Enforce:
   - required file
   - accepted MIME types
   - max size matching the backend default
3. Return display-ready error messages and stable error codes.

### Acceptance Checks

- Client imports resolve.
- App renders without starter Vite content.
- `VITE_API_URL` is the only source for API base URL.

## 10. Phase 5: Frontend UI Implementation

### Design Constraints

Follow the applied `design-taste-frontend` guidance:

- First screen is the usable battle app, not a landing page.
- Use `min-h-[100dvh]`, not `h-screen`.
- Desktop layout should be asymmetric.
- Mobile layout must collapse to one column.
- Cards only frame upload and result surfaces.
- Include empty, loading, error, and success states.
- Avoid emoji.
- Avoid pure black and saturated purple/blue AI styling.
- Use labels above form inputs.
- Include tactile active states and visible focus rings.

### `BattlePage.jsx`

Responsibilities:

1. Render page shell.
2. Hold selected file state for `selfieA` and `selfieB`.
3. Hold preview object URLs.
4. Revoke object URLs on replacement, reset, and unmount.
5. Pass state and handlers into `BattleUploader`.
6. Pass mutation state into `BattleResult`.

Layout:

- `main` with `min-h-[100dvh]`.
- Inner container `max-w-7xl mx-auto`.
- Grid:
  - one column on mobile
  - asymmetric two-column layout on desktop

### `ImageDropzone.jsx`

Responsibilities:

1. Render accessible label.
2. Render hidden file input and visible drop target.
3. Support browse, drag enter, drag leave, drop.
4. Show preview when selected.
5. Show remove/replace action.
6. Show inline validation error.
7. Ensure keyboard activation works.

States:

- Empty.
- Dragging.
- Preview selected.
- Invalid file.
- Disabled during analyze.

### `BattleUploader.jsx`

Responsibilities:

1. Render both dropzones.
2. Render analyze button.
3. Disable analyze until both files are valid.
4. Call mutation with both files.
5. Keep files selected after server error for retry.
6. Render reset/new battle action after success.

### `BattleResult.jsx`

Responsibilities:

1. Render empty state before analysis.
2. Render `SkeletonResult` during pending mutation.
3. Render `InlineAlert` on error.
4. Render winner state on success.
5. Include `aria-live="polite"` around result changes.
6. Include entertainment disclaimer.

### `AnalysisMeter.jsx`

Responsibilities:

1. Compare score A and B visually.
2. Avoid using color as the only state indicator.
3. Show numeric scores.
4. Handle ties.
5. Keep dimensions stable to avoid layout shift.

### `InlineAlert.jsx`

Responsibilities:

1. Render normalized error messages.
2. Provide accessible alert semantics.
3. Keep styling consistent with the single accent palette.

### `SkeletonResult.jsx`

Responsibilities:

1. Render skeleton blocks matching the success layout.
2. Use CSS shimmer or subtle opacity animation only.
3. Animate transform/opacity/background-position, not layout dimensions.

### Acceptance Checks

- User can select two valid images.
- Analyze button enables only when both files are valid.
- Invalid files show inline errors.
- Empty, loading, error, success, and reset states are reachable.
- Result update is announced through `aria-live`.
- Mobile width around 360px has no horizontal scrolling.

## 11. Phase 6: Frontend Tests

### Test Setup Tasks

1. Configure Vitest.
2. Add `client/test/setup.js` with `@testing-library/jest-dom`.
3. Mock API/service calls where appropriate.
4. Mock `URL.createObjectURL` and `URL.revokeObjectURL`.

### `client/test/BattleUploader.test.jsx`

Test cases:

1. Analyze button is disabled initially.
2. Selecting valid images enables analyze.
3. Invalid MIME type shows inline validation error.
4. Pending mutation shows skeleton loading state.
5. Successful mutation displays winner, scores, verdict, and disclaimer.
6. Error mutation displays inline error and leaves retry possible.
7. Reset clears selected images and result state.

### `client/test/battleService.test.js`

Test cases:

1. Builds `FormData` with `selfieA` and `selfieB`.
2. Posts to `/api/battles/analyze`.
3. Uses shared API client.
4. Returns response data.
5. Normalizes backend error shape.

### Acceptance Checks

Run:

```bash
npm run test:client
```

Expected:

- All frontend tests pass.
- No real backend request is made during tests.

## 12. Phase 7: Integration and Local QA

### Local Backend Verification

1. Create local `.env` with Azure values.
2. Start backend.
3. Confirm health route.
4. Test analyze route with two real image files.
5. Test missing file and invalid file paths.
6. Confirm response format matches spec.

Useful commands:

```bash
npm run server
```

```bash
curl http://localhost:5000/api/health
```

For multipart route testing on Windows, use PowerShell `Invoke-WebRequest` or a REST client if curl multipart behavior is inconvenient.

### Local Frontend Verification

1. Create `client/.env` with `VITE_API_URL=http://localhost:5000`.
2. Start the full stack.
3. Upload two images.
4. Verify loading state appears.
5. Verify winner result appears.
6. Verify reset works.
7. Verify server errors display friendly messages.

Useful command:

```bash
npm run dev
```

### Responsive QA

Check:

- 360px mobile width.
- 768px tablet width.
- 1280px desktop width.

Required:

- No horizontal scroll.
- Buttons and dropzones remain usable.
- Preview images do not distort layout.
- Text does not overflow buttons or panels.

### Accessibility QA

Check:

- Tab order is logical.
- Focus rings are visible.
- File inputs have labels.
- Dropzones are keyboard usable.
- Error messages are readable by assistive tech.
- Result changes are announced.

## 13. Phase 8: Build, Lint, and Final Verification

### Commands

Run:

```bash
npm run test:server
npm run test:client
npm run build --prefix client
npm run lint --prefix client
```

If root scripts are added for these, prefer:

```bash
npm test
```

### Static Checks

Search for hard-coded API URLs:

```bash
rg "http://localhost:5000|127\\.0\\.0\\.1:5000|VITE_API_URL" client/src
```

Expected:

- Only `import.meta.env.VITE_API_URL` appears in source.

Search for forbidden sensitive fields:

```bash
rg "passwordHash|AZURE_FACE_API_KEY|Ocp-Apim-Subscription-Key" client server
```

Expected:

- Azure key references only appear in backend env/provider code.
- No sensitive values are in frontend code.

Search for starter content:

```bash
rg "Vite|React logo|Count is|Get started" client/src
```

Expected:

- No starter UI remains unless in deleted/irrelevant assets.

### Final Acceptance

The implementation is done when:

- Two-image upload works in browser.
- Backend calls Azure for both images.
- Winner response is normalized and displayed.
- All upload failure paths produce friendly errors.
- No images are retained on disk.
- Missing backend env vars fail fast.
- Tests pass.
- Client build passes.
- Frontend has no hard-coded backend URL.

## 14. Risk Register

### Azure Face API Attribute Availability

Risk:

- Some attributes may be unavailable depending on API version, region, or Azure resource configuration.

Mitigation:

- Keep optional attributes optional.
- Normalize missing values.
- Base scoring on required attributes first.

### Upload Validation Differences

Risk:

- Browser MIME type can differ from file content.

Mitigation:

- Validate MIME type in frontend for UX.
- Validate MIME type and magic bytes in backend for enforcement.

### Backend Env Validation vs Tests

Risk:

- Strict env validation can make test imports fail.

Mitigation:

- Keep app creation separate from server startup.
- Provide explicit test env vars in Jest setup or only validate Azure env on startup/provider usage.

### UI Scope Creep

Risk:

- The playful concept can lead to unnecessary animations and future-feature surfaces.

Mitigation:

- Build the working upload/analyze/result experience first.
- Add only lightweight CSS transitions and skeleton loading.

### Provider Latency

Risk:

- Azure latency can exceed the target response time.

Mitigation:

- Use clear loading states.
- Add provider timeout.
- Return a friendly provider error when timeout occurs.

## 15. Frontend Design Pre-Flight Matrix

This plan applies the mandatory `design-taste-frontend` skill for UI implementation planning:

- Global state: MVP should use local state and TanStack Query mutation state, not Redux, unless global UI state becomes necessary.
- Mobile collapse: the planned layout uses one column on mobile and asymmetric columns only at desktop breakpoints.
- Full-height sections: the page shell must use `min-h-[100dvh]`, not `h-screen`.
- Animation cleanup: object URL lifecycle cleanup is required; any future `useEffect` animation must clean up timers/listeners.
- States: empty, loading, error, validation, success, disabled, active, and reset states are included.
- Cards: cards are reserved for upload/result surfaces only.
- Heavy animation isolation: no CPU-heavy perpetual animation is planned; if added later, it must be isolated in leaf components.
