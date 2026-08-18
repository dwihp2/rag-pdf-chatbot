# 08 — Build Members card UI on collection detail page (Task 8)

Status: ready-for-agent
Type: task
Blocked by: 02, 03

## Task

Add a **Members** card to the collection detail page:

- List members with Owner/Member badges.
- Owner sees: "Copy invite link" (`navigator.clipboard` + toast) and Remove buttons.
- Member sees: "Leave collection".

## Files

- Modify: `src/app/(dashboard)/collections/[id]/page.tsx`
- (Optional) extract a `MembersCard` component under `src/components/collections/`

## Acceptance

- Members render with correct badges; owner can copy the invite link and remove members; a member can leave.

## Comments

- Depends on the members routes (02, 03) and the detail response shape (05).
