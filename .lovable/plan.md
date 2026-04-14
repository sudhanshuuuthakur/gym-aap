

## Plan: Total Members screen with professional design

Clicking the "Total Members" card in Membership Overview navigates to a dedicated full-screen member list. Each member row shows a green or red dot on the right based on payment status.

### Changes

**1. Add `"member-list"` to Screen type in `src/components/BottomNav.tsx`**
- Add to the type union (not to the visible nav tabs)

**2. Create `src/components/screens/MemberListScreen.tsx`**
- Props: `userId`, `onBack`
- Fetches all admissions for the user
- Professional header with back arrow, title "Total Members", and member count badge
- Search bar to filter by name
- Clean list with subtle card styling per row: member name on left, green dot (paid/approved) or red dot (pending) on right
- Empty state if no members

**3. Update `src/components/MembershipStats.tsx`**
- Accept new `onViewAllMembers` callback prop
- Wire the "Total Members" card click to call `onViewAllMembers()` instead of toggling inline list
- Keep Paid and Not Paid inline expansion as-is (only Total Members navigates)

**4. Update `src/components/screens/HomeScreen.tsx`**
- Accept and pass `onViewAllMembers` prop down to `MembershipStats`

**5. Update `src/components/Dashboard.tsx`**
- Add `member-list` screen rendering with `MemberListScreen`
- Pass `onViewAllMembers` callback to `HomeScreen` that sets screen to `"member-list"`

