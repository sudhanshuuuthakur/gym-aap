## Plan: Add 3-dot actions menu to each member in the Members page

Add a three-dot icon button on the right side of every member row in `AdmissionsList.tsx` (Members page only). Tapping it opens a dropdown menu with: Edit, Delete, View profile.

### Changes

**1. `src/components/AdmissionsList.tsx`**
- Add a `MoreVertical` icon button next to the status badge for each member.
- Wrap it with shadcn `DropdownMenu` containing three items: Edit, View profile, Delete.
- Track `editingMember`, `viewingMember`, `deletingMember` state.
- On Delete: open an `AlertDialog` confirmation; on confirm, delete the row from `admissions` and refresh the list (toast on success/failure).

**2. New `src/components/EditMemberDialog.tsx`**
- Dialog with form fields: name, phone, email, age, weight, height.
- Pre-filled from the selected member; on save, updates the row in `admissions` and calls `onUpdated()` to refetch.

**3. New `src/components/MemberProfileDialog.tsx`**
- Read-only dialog showing all member info: name, phone, email, age, weight, height, join date, status, created date.
- Also fetches and lists the last few payments and attendance check-ins for that member.

### Scope guard
- Three-dot menu is added only to `AdmissionsList` (Members page). The `MemberListScreen` (Membership Overview drilldowns) is untouched.
- No database schema changes; uses existing RLS policies on `admissions` (update/delete already allowed for the owner).
