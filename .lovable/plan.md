# Add Multiple Gyms per Account

## What will change
- Replace the empty left side of the header with a gym selector showing the active gym name.
- Create the owner's first gym as “GYM NAME”; preserve existing members, payments, and attendance in that gym.
- Let the owner create additional gyms by entering a name. New gyms begin with no members or activity.
- Scope home totals, members, payments, attendance, and related member messaging to the selected gym.
- Keep the selected gym active while navigating the app and restore it on later visits.

## Technical details
- Add an owner-scoped `gyms` table with RLS and explicit grants; add a `gym_id` to existing member, payment, and attendance records and backfill them to each owner's initial gym.
- Enforce gym ownership in database policies and keep existing owner-level access checks.
- Pass the active gym ID through screens and CRUD flows, including existing MCP tools where applicable.
- Add a gym creation dialog and selector in the header, using the existing UI patterns.
- Verify migration safety, gym switching/creation, record separation, and the mobile header; run existing membership tests.