# Moggoff MVP Implementation Spec

## 1. Source Brief

This spec expands `moggoff_project_brief.md` into an implementation plan for the first production-ready MVP of Moggoff.

Moggoff is a React and Express web app where a user uploads two selfies, the backend analyzes both faces with Azure Face API, computes a comparison result, deletes uploaded files, and returns an instant winner to the frontend.

Core flow:

```txt
Upload -> Analyze -> Compare -> Show Winner
```

## 2. MVP Scope

### In Scope

- Single-page public web app with no authentication.
- Two-image selfie upload.
- Client-side image validation before upload.
- Backend multipart upload endpoint.
- Azure Face API integration.
- Deterministic scoring and winner selection from Azure face attributes.
- Tie and invalid-image handling.
- Temporary file cleanup after every request path.
- Clear frontend loading, success, empty, validation, and error states.
- Basic rate limiting and security middleware.
- Frontend Vitest tests under `client/test/`.
- Backend Jest and Supertest tests under `server/tests/`.
- Environment examples for root backend `.env` and `client/.env`.

### Out of Scope for MVP

- User accounts.
- Battle history persistence.
- Public leaderboard.
- Sharing pages.
- Payments.
- Moderation dashboard.
- Mobile native apps.
- Long-term image storage.
- Face recognition or identity verification.

Future features must not be scaffolded as incomplete UI unless they are harmless placeholders in the spec only.

## 3. Product Requirements

### Primary User Story

As a visitor, I want to upload two selfies and immediately see which image wins, so I can run a quick visual comparison without creating an account.

### Functional Requirements

1. The user can choose or drag two image files.
2. Each upload slot shows a local image preview after file selection.
3. The analyze action is disabled until both slots contain valid files.
4. The frontend sends both files in a single `multipart/form-data` request.
5. The backend validates both files before calling Azure.
6. The backend calls Azure Face API once per image.
7. If exactly one detectable face is found in each image, the backend computes scores.
8. The backend returns the winner, both scores, key analysis attributes, and a short explanation.
9. The frontend displays the winner clearly and shows both side-by-side results.
10. The user can reset the battle and upload another pair without refreshing.
11. Temporary upload files are deleted whether analysis succeeds or fails.

### Non-Functional Requirements

- Typical analyze response should complete within 8 seconds under normal Azure latency.
- Uploaded files must never be persisted beyond request processing.
- Backend must fail fast when required Azure environment variables are missing.
- API errors must not expose secrets, stack traces, Azure keys, internal paths, or raw provider responses.
- The app must be usable at 360px mobile width and on desktop.
- The interface must use accessible labels, keyboard-operable controls, and visible focus states.

## 4. Architecture

### Frontend

Stack:

- React with Vite.
- Tailwind CSS as the default styling system.
- TanStack Query for server-state mutation.
- Axios through shared API client in `client/src/lib/api.js`.
- Redux Toolkit only if global UI/app state becomes necessary. The MVP can use local state for transient upload state.
- Vitest and React Testing Library.

Target structure:

```txt
client/
  src/
    components/
      BattleUploader.jsx
      ImageDropzone.jsx
      BattleResult.jsx
      AnalysisMeter.jsx
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
    styles/
      index.css
    App.jsx
    main.jsx
  test/
    BattleUploader.test.jsx
    battleService.test.js
```

### Backend

Stack:

- Node.js.
- Express.
- Multer for multipart upload handling.
- Axios or native `fetch` for Azure Face API requests.
- Jest and Supertest.

Target structure:

```txt
server/
  config/
    env.js
  controllers/
    battleController.js
  middleware/
    errorHandler.js
    rateLimit.js
    upload.js
    validateUpload.js
  routes/
    battleRoutes.js
  services/
    azureFaceService.js
    battleScoringService.js
    fileCleanupService.js
  utils/
    asyncHandler.js
    httpErrors.js
  constants/
    faceAttributes.js
  tests/
    battleRoutes.test.js
    battleScoringService.test.js
  app.js
  server.js
```

## 5. Environment Configuration

### Root Backend `.env`

```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
AZURE_FACE_API_KEY=your_key
AZURE_FACE_API_ENDPOINT=https://your-resource.cognitiveservices.azure.com
UPLOAD_MAX_MB=5
```

### Root Backend `.env.example`

```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
AZURE_FACE_API_KEY=
AZURE_FACE_API_ENDPOINT=
UPLOAD_MAX_MB=5
```

### Frontend `client/.env`

```env
VITE_API_URL=http://localhost:5000
```

### Frontend `client/.env.example`

```env
VITE_API_URL=http://localhost:5000
```

Backend startup must validate:

- `AZURE_FACE_API_KEY`
- `AZURE_FACE_API_ENDPOINT`

If either is absent, throw a clear startup error before listening on the port.

## 6. API Contract

### `POST /api/battles/analyze`

Content type:

```txt
multipart/form-data
```

Request fields:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `selfieA` | file | yes | First image to compare. |
| `selfieB` | file | yes | Second image to compare. |

Accepted MIME types:

- `image/jpeg`
- `image/png`
- `image/webp`

Maximum file size:

- Default 5 MB per image, configurable through `UPLOAD_MAX_MB`.

Success response:

```json
{
  "battleId": "battle_8dh2kq9",
  "winner": "A",
  "verdict": "Selfie A wins by a narrow margin.",
  "confidence": 0.71,
  "images": {
    "A": {
      "score": 82.4,
      "faceDetected": true,
      "attributes": {
        "smile": 0.68,
        "glasses": "NoGlasses",
        "headPose": {
          "pitch": 2.1,
          "roll": -0.8,
          "yaw": 4.6
        },
        "qualityForRecognition": "high",
        "occlusion": {
          "foreheadOccluded": false,
          "eyeOccluded": false,
          "mouthOccluded": false
        }
      }
    },
    "B": {
      "score": 76.9,
      "faceDetected": true,
      "attributes": {
        "smile": 0.41,
        "glasses": "NoGlasses",
        "headPose": {
          "pitch": 1.4,
          "roll": 1.2,
          "yaw": -6.8
        },
        "qualityForRecognition": "medium",
        "occlusion": {
          "foreheadOccluded": false,
          "eyeOccluded": false,
          "mouthOccluded": false
        }
      }
    }
  }
}
```

Tie response:

```json
{
  "battleId": "battle_8dh2kq9",
  "winner": "tie",
  "verdict": "This one is too close to call.",
  "confidence": 0.5,
  "images": {
    "A": { "score": 79.2, "faceDetected": true },
    "B": { "score": 79.0, "faceDetected": true }
  }
}
```

Error response:

```json
{
  "error": {
    "code": "NO_FACE_DETECTED",
    "message": "One of the images does not contain a detectable face."
  }
}
```

### Error Codes

| HTTP | Code | Scenario |
| --- | --- | --- |
| 400 | `MISSING_FILES` | One or both upload fields are absent. |
| 400 | `INVALID_FILE_TYPE` | File is not JPEG, PNG, or WEBP. |
| 400 | `FILE_TOO_LARGE` | File exceeds size limit. |
| 400 | `NO_FACE_DETECTED` | Azure found no face in one or both images. |
| 400 | `MULTIPLE_FACES_DETECTED` | Azure found more than one face in one or both images. |
| 422 | `UNSUPPORTED_IMAGE` | Azure cannot process the image. |
| 429 | `RATE_LIMITED` | Request limit exceeded. |
| 502 | `AI_PROVIDER_ERROR` | Azure request failed or returned an unusable response. |
| 500 | `INTERNAL_ERROR` | Unexpected server error. |

## 7. Azure Face API Integration

### Endpoint

Use the configured Azure endpoint with the Face Detect API.

Implementation should centralize provider logic in:

```txt
server/services/azureFaceService.js
```

### Requested Attributes

Prefer attributes that support image quality and pose comparison without making claims about identity or protected characteristics.

Required:

- `headPose`
- `glasses`
- `occlusion`
- `qualityForRecognition`

Optional, if available in the configured Azure Face API version:

- `smile`
- `blur`
- `exposure`
- `noise`

Do not request or use sensitive demographic attributes for scoring.

### Provider Handling

- Send image bytes to Azure as `application/octet-stream`.
- Set `Ocp-Apim-Subscription-Key` from env.
- Normalize Azure responses into an internal shape before scoring.
- Keep raw Azure responses out of frontend responses.
- Implement request timeouts.
- Map Azure errors into project error codes.

## 8. Battle Scoring

Scoring must be deterministic and testable in:

```txt
server/services/battleScoringService.js
```

The MVP score is not a real attractiveness score. It is an entertainment score based on image suitability and face presentation. User-facing copy must avoid scientific or biometric certainty.

Suggested scoring model:

```txt
base score: 50
qualityForRecognition high: +20
qualityForRecognition medium: +10
qualityForRecognition low: -10
smile: +0 to +10 from Azure smile confidence if available
head pose alignment: +0 to +12 based on low absolute pitch, roll, and yaw
occlusion: -8 per occluded major region
glasses: neutral by default
blur/exposure/noise penalties: -0 to -10 each if available
clamp final score to 0..100
```

Winner rules:

- If absolute score delta is less than `1.5`, return `tie`.
- Otherwise higher score wins.
- Confidence should be derived from score delta and clamped to `0.5..0.95`.

Verdict copy:

- Must be playful but not cruel.
- Must not insult appearance, age, gender, ethnicity, disability, or protected characteristics.
- Must explain the result through photo factors such as lighting, face angle, sharpness, occlusion, and expression.

Example verdicts:

- `Selfie A wins on sharper framing and a cleaner face angle.`
- `Selfie B takes it with better image quality and less occlusion.`
- `This one is too close to call. Both shots landed in the same range.`

## 9. File Upload and Cleanup

Use Multer middleware in:

```txt
server/middleware/upload.js
```

MVP storage options:

1. Preferred: memory storage, to avoid filesystem cleanup where feasible.
2. Acceptable: disk storage under a root ignored temp directory such as `tmp/uploads`.

If disk storage is used:

- Create upload directory at startup if missing.
- Delete both temp files in a `finally` path after controller execution.
- Delete partially uploaded files on validation failure.
- Add temp upload directory to `.gitignore`.

The success criterion "Files cleaned" means no request path leaves user-uploaded images on disk.

## 10. Frontend UX Specification

The first screen must be the working battle interface, not a marketing landing page.

### Visual Direction

- Use a playful but restrained interface.
- Avoid purple and blue AI-gradient styling.
- Recommended palette: zinc or stone neutral base with one deep rose or emerald accent.
- Use a high-end sans-serif stack such as `Geist`, `Satoshi`, or `Outfit`; avoid serif fonts for this software UI.
- Keep layout asymmetric on desktop, collapsed to a strict single column on mobile.
- Use cards only for upload/result surfaces where framing helps.
- Buttons must have hover, focus, disabled, and active states.
- Do not use emoji in UI text, alt text, or code.

### Page Layout

Desktop:

- Left side: product name, short concrete description, upload controls.
- Right side: analysis/result panel with empty, loading, error, or success state.
- Use `min-h-[100dvh]`, not `h-screen`.
- Keep max content width around `max-w-7xl`.

Mobile:

- Single-column flow.
- Upload slot A, upload slot B, analyze button, result panel.
- No horizontal scrolling.

### Upload Slot Requirements

Each image slot must include:

- Visible label: `Selfie A` or `Selfie B`.
- Drop target and browse button.
- Accepted file type copy.
- Preview after selection.
- Remove/replace action.
- Inline validation error.
- Keyboard accessible file input.

### Analyze Button

States:

- Disabled until both files pass validation.
- Loading while the mutation is pending.
- Error leaves selected files intact so the user can retry.
- Success allows reset/new battle.

### Result Panel States

Empty:

- Show a calm placeholder that explains that results appear after both images are analyzed.

Loading:

- Use skeleton blocks that match final result geometry.
- Include progress language for `Uploading`, `Analyzing`, and `Comparing` if practical.

Error:

- Inline alert with friendly message.
- Show retry action when the selected files are still valid.

Success:

- Winner headline.
- Both scores.
- A visual comparison meter.
- Short verdict.
- Small disclaimer: `For entertainment only. Results reflect photo analysis, not personal worth.`

## 11. Frontend Data Flow

### Shared API Client

Path:

```txt
client/src/lib/api.js
```

Responsibilities:

- Create an Axios instance.
- Use `import.meta.env.VITE_API_URL` as base URL.
- Configure reasonable timeout.
- Normalize error responses for service consumers.

No component or service may hard-code `http://localhost:5000`.

### Service Layer

Path:

```txt
client/src/services/battleService.js
```

Responsibilities:

- Build `FormData`.
- Append files using `selfieA` and `selfieB`.
- Call `POST /api/battles/analyze` through `api`.
- Return normalized response data.

### Mutation Hook

Path:

```txt
client/src/hooks/mutations/useAnalyzeBattle.js
```

Responsibilities:

- Wrap battle analysis in TanStack Query `useMutation`.
- Expose mutation state to UI.
- Do not store server response in Redux.

## 12. Backend Request Flow

1. `server.js` loads env and starts the Express app.
2. `app.js` configures JSON parsing, CORS, security middleware, routes, and error handling.
3. `battleRoutes.js` registers `POST /api/battles/analyze`.
4. Upload middleware receives `selfieA` and `selfieB`.
5. Validation middleware checks presence, MIME type, size, and file count.
6. Controller calls Azure service for both files.
7. Controller validates exactly one face per image.
8. Scoring service computes result.
9. Controller returns normalized response.
10. Cleanup service removes temp files in all disk-storage paths.
11. Error handler returns normalized error JSON.

## 13. Security and Privacy

- Do not log uploaded image content, file paths, Azure keys, or raw provider payloads.
- Use `helmet`.
- Use CORS configured by `CLIENT_ORIGIN`.
- Use API rate limiting on analyze endpoint.
- Limit request body and upload sizes.
- Validate MIME type and ideally magic bytes.
- Never expose stack traces in production responses.
- Do not retain images or face analysis data after response in MVP.
- Keep Azure credentials only in root `.env`.

## 14. Dependencies

Install only what is needed.

Root/server likely needs:

```bash
npm install express cors helmet dotenv multer express-rate-limit
npm install -D nodemon jest supertest
```

If using Axios on backend:

```bash
npm install axios
```

Client likely needs:

```bash
npm install --prefix client @tanstack/react-query axios
npm install -D --prefix client vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

Tailwind setup must be verified against the installed Vite version before configuration. If Tailwind is not installed, add the compatible Vite/Tailwind setup for the current project rather than mixing CSS systems.

## 15. Testing Requirements

### Backend Tests

`server/tests/battleScoringService.test.js`

- High quality face beats low quality face.
- Occlusion reduces score.
- Large head pose angles reduce score.
- Near-equal scores produce tie.
- Confidence stays within expected bounds.

`server/tests/battleRoutes.test.js`

- Missing files returns `400 MISSING_FILES`.
- Invalid MIME type returns `400 INVALID_FILE_TYPE`.
- Azure no-face result returns `400 NO_FACE_DETECTED`.
- Azure multiple-faces result returns `400 MULTIPLE_FACES_DETECTED`.
- Successful analysis returns winner payload.
- Azure failure returns `502 AI_PROVIDER_ERROR`.
- Cleanup is called on success and failure when disk storage is used.

Mock Azure service. Do not call real Azure in automated tests.

### Frontend Tests

`client/test/BattleUploader.test.jsx`

- Analyze button disabled initially.
- Valid image selections enable analyze button.
- Invalid file type shows inline error.
- Loading state displays skeleton.
- Success response displays winner and scores.
- Error response displays inline error and retry option.

`client/test/battleService.test.js`

- Sends `selfieA` and `selfieB` form fields.
- Uses shared API client.
- Normalizes backend errors.

## 16. Implementation Milestones

### Milestone 1: Project Foundation

- Replace Vite starter UI with project app shell.
- Add required folder structure gradually.
- Add `.env.example` files.
- Add backend env validation.
- Add shared frontend API client.

Acceptance criteria:

- `npm run dev` starts frontend and backend.
- Missing backend env vars produce a clear startup failure.

### Milestone 2: Backend Analyze API

- Add Express app configuration.
- Add upload middleware.
- Add battle route and controller.
- Add Azure service abstraction.
- Add scoring service.
- Add cleanup handling.
- Add normalized error handling.

Acceptance criteria:

- `POST /api/battles/analyze` accepts two valid files.
- Mocked Azure result produces deterministic winner response.
- Invalid uploads fail before Azure call.

### Milestone 3: Frontend Battle UI

- Build upload slots.
- Build analysis mutation hook.
- Build result panel states.
- Build reset flow.
- Apply responsive Tailwind styling.

Acceptance criteria:

- User can select two images and receive displayed result.
- Loading, empty, error, and success states are visible.
- Layout works on mobile and desktop.

### Milestone 4: Tests and Hardening

- Add backend Jest/Supertest tests.
- Add frontend Vitest/RTL tests.
- Add file cleanup tests or explicit cleanup unit coverage.
- Run lint/build/test commands.

Acceptance criteria:

- Backend tests pass.
- Frontend tests pass.
- Client build passes.
- No hard-coded frontend API URL exists.

## 17. Deployment Notes

Project-specific deployment:

- Frontend deploys to Namecheap via FTP through GitHub Actions.
- Backend deploys to Heroku.

Do not switch to Vercel, Netlify, Render, or another platform unless explicitly requested.

Deployment requirements:

- Heroku config vars include `AZURE_FACE_API_KEY`, `AZURE_FACE_API_ENDPOINT`, `CLIENT_ORIGIN`, and `NODE_ENV=production`.
- Namecheap-hosted frontend must set `VITE_API_URL` at build time to the Heroku backend URL.
- Backend CORS must allow the production frontend origin.

## 18. Observability

MVP logging should capture:

- Request method and path.
- Analyze request started/completed.
- Sanitized error code.
- Azure provider latency, without raw payloads.

Do not log:

- Image bytes.
- Image filenames if they include local user data.
- Azure credentials.
- Raw face analysis payloads.

## 19. Accessibility Requirements

- Every file input must have an accessible label.
- Dropzones must also support keyboard selection.
- Buttons must have visible focus rings.
- Result changes should be announced with an `aria-live="polite"` region.
- Error messages should be associated with their related input where applicable.
- Color cannot be the only way winner/error state is communicated.

## 20. Content Guidelines

Use short, concrete UI copy:

- `Moggoff`
- `Pick two selfies. The app compares photo quality, face angle, and expression, then calls the winner.`
- `Selfie A`
- `Selfie B`
- `Analyze battle`
- `New battle`
- `For entertainment only. Results reflect photo analysis, not personal worth.`

Avoid:

- Appearance insults.
- Claims of objective beauty.
- Protected-characteristic references.
- Emoji.
- Generic AI hype terms.

## 21. Open Decisions

These can be decided during implementation without blocking the MVP:

- Whether to use Multer memory storage or disk storage. Memory storage is preferred unless Azure upload implementation needs file paths.
- Whether to use Axios or native `fetch` on the backend.
- Exact Tailwind installation path after checking current client setup.
- Exact final scoring weights after confirming which Azure attributes are available on the configured Face API version.

## 22. Definition of Done

The MVP is complete when:

- A user can upload two selfies from the browser.
- The backend validates both files.
- Azure Face API is called for each image.
- The backend returns a normalized winner result.
- The frontend displays winner, scores, verdict, and reset action.
- All temporary files are cleaned.
- Missing env vars fail fast.
- No frontend API URL is hard-coded.
- Backend tests pass.
- Frontend tests pass.
- Client build passes.

## 23. Frontend Pre-Flight Matrix

Applied from the mandatory `design-taste-frontend` skill for this UI-facing spec:

- Global state is not required for the MVP upload flow; local component state plus TanStack Query mutation state is appropriate.
- Mobile layout must collapse to a single column with full-width controls and no horizontal scroll.
- Full-height page sections must use `min-h-[100dvh]`, not `h-screen`.
- Any future `useEffect` animation must include cleanup; MVP can avoid heavy JS animation.
- Empty, loading, error, and success states are explicitly required.
- Cards are limited to upload/result surfaces where framing helps the task.
- CPU-heavy perpetual animations are not required for the MVP; if added later, isolate them in leaf components.
