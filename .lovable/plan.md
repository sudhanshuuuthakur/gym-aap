# Recreate the phone-first MyGymPal home UI

## Goal

Rebuild the app’s visual experience to match the uploaded MyGymPal references: near-black obsidian surfaces, cyan/teal accents, thin borders, compact mobile-first spacing, and a clear numbered content sequence. Keep the current authentication and gym-management logic unchanged.

## Resolved flow

The login screen remains the first screen, as selected. The existing phone-number + 6-digit PIN sign-in/sign-up behavior, validation, session handling, navigation, member data, payments, attendance, and install behavior will not be changed.

After authentication, the Home tab will be the redesigned app home. The reference `07_login` visual language will be applied to the existing login surface without changing its logic; the other numbered references will guide the post-login Home composition rather than becoming a new pre-login route.

## UI sequence

The authenticated Home screen will be rebuilt in this order:

1. **Hero / welcome** — compact brand header, owner greeting, and “Manage. Motivate. Grow.”-style hierarchy adapted to live gym-owner content.
2. **Feature actions** — large, touch-friendly action tiles for Add Member, Attendance, and Collect Payment, retaining their current handlers.
3. **How it works** — a lightweight three-step visual rail explaining the existing workflow: add members, track attendance, collect payments.
4. **Live dashboard** — Membership Overview remains the top data priority, showing the existing total, paid, pending, percentage, and member-list click-through behavior in the darker reference styling.
5. **Action/CTA area** — functional shortcuts for the existing member and payment workflows only; no dead marketing buttons.
6. **Supporting footer treatment** — restrained app/contact/help presentation where it fits the existing Home experience, without changing the Info tab’s behavior.

## Visual direction

- Use the supplied references as visual references only; do not embed screenshots in the app.
- Use semantic HSL design tokens in `src/index.css` for void background, obsidian surfaces, teal primary, cyan glow, hairline borders, primary text, and muted text.
- Replace the current white dashboard styling with the reference’s dark obsidian/cyan system while keeping the existing component hierarchy and data states usable.
- Use the existing Lucide icon set and shadcn `Button`/input primitives for accessible controls.
- Keep cards mostly rectangular with restrained corner radii, subtle borders, and no nested decorative cards.
- Preserve responsive behavior with a phone-first single-column layout, then expand spacing and grids for larger screens.
- Add only purposeful entrance/hover transitions and honor `prefers-reduced-motion`.

## Files and implementation boundaries

- Refactor `HomeScreen.tsx` to own the new ordered Home composition and continue passing all existing callbacks through.
- Restyle `Dashboard.tsx`, `MembershipStats.tsx`, `SurfaceCard.tsx`, `ActionCard.tsx`, `StatisticCard.tsx`, and `BottomNav.tsx` so the authenticated shell is visually consistent.
- Restyle `PhoneLoginForm.tsx` and the signed-out surface in `Index.tsx` to match `07_login`, without changing auth state, validation, or API calls.
- Update shared tokens in `src/index.css`; avoid hardcoded component color values and keep all styling themeable.
- Leave backend schema, queries, auth configuration, member/payment/attendance logic, and install functionality untouched.

## Verification

- Check the new Home and login surfaces at phone and desktop widths.
- Confirm Membership Overview remains visible near the top of Home.
- Click through Add Member, Attendance, Collect Payment, and membership filters to confirm existing handlers still work.
- Confirm signed-out login and sign-up continue to use the same phone/PIN flow.
- Review the newest build/runtime diagnostics and fix any presentation regressions before completion.
