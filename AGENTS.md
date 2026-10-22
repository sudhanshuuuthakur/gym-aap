# Architecture
- Member photos use owner-prefixed paths in the existing private avatars bucket and signed URLs; this keeps photos private and reuses existing storage permissions.
- Members filters distinguish current-month payments from currently running 30-day memberships; future advance payments do not activate membership early.
- Gym-owned records carry a gym ID and all screens, queries, and caller-facing integrations scope records to the selected gym; this prevents cross-gym mixing for owners with multiple locations.