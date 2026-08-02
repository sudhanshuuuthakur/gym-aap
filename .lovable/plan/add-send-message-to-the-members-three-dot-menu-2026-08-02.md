# Add "Send Message" to the Members three-dot menu

## Context
The Members screen (`src/components/AdmissionsList.tsx`) shows each member row with a three-dot dropdown containing **View profile**, **Edit**, and **Delete**. The owner wants a professional "Send Message" option there so they can reach any member via WhatsApp or SMS straight from the members list.

A message composer already exists (`src/components/AIReminderDialog.tsx`) but it's tied to payment-reminder context and requires expiry/amount data. The member rows in `AdmissionsList` only carry `name`, `phone`, `email`, etc. — not payment/expiry info — so we need a lightweight, general-purpose message dialog.

## Plan

### 1. Create a general "Send Message" dialog
New file: `src/components/SendMessageDialog.tsx`

- Reuses the existing premium light theme (white card, `#0F172A` text, rounded-3xl) matching `AIReminderDialog` styling.
- An editable `Textarea` pre-filled with a clean, professional default greeting template:
  ```
  Hi {name},

  Hope you're doing great! This is {gymName}. Just wanted to check in and see how your training is going.

  Let us know if you need anything.

  Team {gymName}
  ```
- Two send buttons (consistent with the rest of the app):
  - **WhatsApp** → `https://wa.me/{number}?text={encoded}` (green, `MessageCircle` icon)
  - **SMS** → `sms:{number}?body={encoded}` (blue, `MessageSquare` icon)
- Toast error if the member has no phone number ("No phone number on file"), same pattern as existing notify code.
- Props: `open`, `onOpenChange`, `memberName`, `memberPhone`, `gymName`.

### 2. Wire it into the three-dot menu in `AdmissionsList.tsx`
- Add a `messaging` state (`Admission | null`).
- Add a new `DropdownMenuItem` "Send Message" with a `Send`/`MessageCircle` icon, placed between "View profile" and "Edit".
- Fetch the gym owner's `display_name` from `profiles` (already pattern used elsewhere) to populate `gymName` in the template. Reuse the existing profile fetch or add a small one.
- Render `<SendMessageDialog>` at the bottom alongside the other dialogs.

### 3. Polishing
- Keep the dropdown item styling consistent with the existing items (neutral text, `focus:bg-[#F1F5F9]`).
- Ensure the menu order reads naturally: View profile → Send Message → Edit → Delete (red).

## Files
- **New:** `src/components/SendMessageDialog.tsx`
- **Edit:** `src/components/AdmissionsList.tsx` (add menu item + dialog state + render)

No backend or database changes — messaging uses existing WhatsApp/SMS deep links.
