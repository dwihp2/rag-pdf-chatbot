# 16 — Create Documents Page (Task 4.4)

Status: resolved
Type: task
Milestone: 4 — Frontend — Chat

## Task

Create the document management page: drag-and-drop upload zone + document list with status badges.

## Files

- Create: `src/components/documents/upload-zone.tsx` — `react-dropzone` DnD, PDF-only, 50MB cap, upload spinner
- Create: `src/components/documents/document-list.tsx` — fetches `/api/documents`, status icons (completed/processing/failed), delete
- Create: `src/app/(dashboard)/documents/page.tsx` — header + upload zone + list with refresh key

## Acceptance

- Upload a PDF → appears with "completed" status and chunk count; delete removes it.

## Comments

- Complete. Commit `0aaf518`; review clean.
