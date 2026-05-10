# Battle Analysis Loading State Spec

## Request Summary

Add a clear loading state to the Battle analysis flow while the battle request is running.

## Date

2026-05-13

## Source Prompt

User request: `workflow add loading state to battle analysis`

Clarification: User replied `proceed` to the proposed default: while analysis is running, replace the result panel with a skeleton/progress state and disable analyze controls, with copy like `Analyzing battle... This can take a moment.`

## Questions Asked And Answers Received

- Question: What loading state should be added for battle analysis?
- Answer: `proceed`, accepting the default behavior and copy direction.

## Assumptions

- The existing TanStack mutation pending state is the source of truth for when battle analysis is loading.
- The existing upload overlay can remain in place.
- The existing `SkeletonResult` pending branch should be enhanced with visible loading copy rather than adding a new dependency or changing data flow.
- Existing disabled analyze controls during pending should remain unchanged.
- No backend, API, or data model changes are needed.

## Goal

Make the Battle page clearly communicate that analysis is in progress while users wait for results.

## Non-Goals

- Redesign the full Battle page.
- Change mutation behavior, retry behavior, or result rendering.
- Add new animation libraries or dependencies.
- Change backend analysis logic.

## Users

- People who have uploaded two selfies and clicked Analyze battle.

## Functional Requirements

- When battle analysis is pending, the result area must show explicit loading text.
- The loading text should communicate that analysis is running and may take a moment.
- The pending UI must not replace the error or success result states.
- Existing upload controls should remain disabled during pending where they already are.

## UI Expectations

- Preserve the existing dark Battle page styling and skeleton shimmer pattern.
- Avoid a generic spinner-only loading state.
- Keep text accessible and visible in the result panel.
- Keep mobile layout responsive.
- Follow the mandatory frontend design pre-flight: no new global state, no new dependencies, no emojis, no unsafe `h-screen`, effects must have cleanup, and empty/loading/error states must remain represented.

## API Expectations

- None.

## Data Model Expectations

- None.

## Edge Cases

- Initial load should still show the empty state, not loading.
- Pending analysis should show the loading state until the mutation resolves or rejects.
- Error state should replace loading after a rejected mutation.
- Success state should replace loading after a resolved mutation.

## Constraints

- React/Vite frontend.
- Tailwind CSS v4.
- Tests use Vitest and React Testing Library.
- Keep changes scoped to Battle analysis loading UI and focused tests.
- Do not touch unrelated dirty worktree changes.

## Success Criteria

- Pending battle analysis displays loading copy such as `Analyzing battle... This can take a moment.`
- Focused Battle page tests pass.
- Existing empty, error, and success states still pass their current tests.

## Out-Of-Scope Items

- Backend changes.
- API client changes.
- Full page redesign.
- New dependencies.

## Open Questions

- None.
