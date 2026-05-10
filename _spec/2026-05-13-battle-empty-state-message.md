# Battle Empty State Message Spec

## Request Summary

Add or update the Battle page empty state shown when there is no battle result yet.

## Date

2026-05-13

## Source Prompt

User request: `add empty state message to battle page`

Clarification: Show the empty state when there is no battle result yet. Use this message: `"No battle result yet. Upload two selfies to start a matchup."` Proceed with the default single-task workflow.

## Questions Asked And Answers Received

- Question: What should the Battle page show as empty, and what message should it use?
- Answer: Show the empty state when there is no battle result yet. Use `"No battle result yet. Upload two selfies to start a matchup."`

## Assumptions

- The empty state applies when the analyze mutation has no successful result and is not pending or errored.
- Existing pending, error, and success result states should remain unchanged.
- The requested sentence should be visible as one exact user-facing message.
- No backend, API, or data model changes are needed.

## Goal

Ensure the Battle page displays the requested empty-state message before any battle result exists and after reset clears the current result.

## Non-Goals

- Redesign the Battle page.
- Change upload, analysis, error, or result behavior.
- Add new dependencies.
- Change deployment or API configuration.

## Users

- People using the Battle page before they have run an analysis.
- People who reset a completed battle and return to the initial no-result state.

## Functional Requirements

- When there is no battle result yet, the Battle page must display: `No battle result yet. Upload two selfies to start a matchup.`
- The empty state must not replace pending, error, or successful battle result UI.
- Existing reset behavior must return the page to the no-result empty state.

## UI Expectations

- Preserve the existing dark Battle page visual language.
- Keep the empty state readable and accessible within the existing result area.
- Use the requested exact copy.
- Follow the mandatory frontend design pre-flight: responsive layout remains intact, no emojis, no unnecessary cards or dependencies, and empty/loading/error states remain represented.

## API Expectations

- None.

## Data Model Expectations

- None.

## Edge Cases

- Initial page load before any upload or analysis.
- After selecting/removing files before analysis.
- After using New battle to reset a completed result.
- Pending, error, and successful result states should continue to take precedence over empty state.

## Constraints

- React/Vite frontend.
- Tailwind CSS v4 is present.
- Existing tests use Vitest and React Testing Library.
- Keep changes scoped to Battle page empty-state UI and related tests.
- Do not touch unrelated dirty worktree changes.

## Success Criteria

- The requested sentence is rendered when there is no battle result yet.
- Existing Battle page tests pass or the relevant test failure is documented.
- No unrelated behavior changes are introduced.

## Out-Of-Scope Items

- Backend changes.
- Upload validation changes.
- Full page redesign.
- New empty states elsewhere.

## Open Questions

- None.
