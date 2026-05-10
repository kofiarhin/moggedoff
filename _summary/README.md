# Summary Memory

Store completed workflow summaries in this folder.

`_summary/` is completed workflow history. `_progress/progress.md` is append-only task history. `_handoff/current.md` is the live resume state for the active workflow.

After implementation and before the final summary, agents must create a review file in `_review/`.

After the review is complete, agents must create or append a summary here. Use timestamped or slugged filenames, for example:

```txt
_summary/2026-05-10-add-dark-theme.md
```

Each summary should include:

- Request.
- Spec file used.
- Task plan used.
- Review file used.
- Tasks completed.
- Files changed.
- Verification run.
- Workflow health status.
- Final artifact checklist.
- Unresolved issues.
- Next recommended work.

After writing a summary, agents must update `_handoff/current.md` with the summary path, final or current workflow health status, unresolved issues, and suggested next prompt.
