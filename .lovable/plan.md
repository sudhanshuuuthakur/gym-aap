# Login page: Obsidian + Teal palette

Adopt the palette from your reference image on the login screen only. No auth logic changes — phone + 6-digit PIN flow, validation, and sign-up/sign-in behaviour stay exactly as they are.

## The palette

| Role | Value | Use |
| --- | --- | --- |
| Void black | `#04070A` | Page background |
| Obsidian panel | `#0B1014` | Card surface |
| Teal primary | `#14E0C8` | Buttons, brand accent, focus rings |
| Teal glow | `#2DD4BF` | Ambient orbs, gradients |
| Hairline | `#1C262C` | Borders, PIN box outlines |
| Text primary | `#F4F7F8` | Headings, input text |
| Text muted | `#8A9AA3` | Labels, helper copy |

## What changes

- Login background: near-black field with soft teal glow arcs (top-right and bottom-left), replacing the current photo/parallax orbs; existing reduced-motion and intensity handling kept.
- Login card: dark obsidian panel, hairline border, rounded corners, subtle teal ring around the logo badge.
- Brand block above the card: "mygympal" with the middle word in teal, plus the tagline "Manage. Motivate. Grow." (phone-first stacked layout, not split-screen).
- Inputs and PIN boxes: dark fills, hairline borders, teal focus state, light text.
- Primary button: solid teal with dark text, matching the reference.
- Small lock line under the button: "Your data is secure with enterprise-grade encryption".

## Technical notes

- Add the palette as HSL tokens in `src/index.css` (a scoped auth-surface set) and reference them via Tailwind rather than hardcoding hex in components.
- Edits limited to `src/pages/Index.tsx` (background + brand block) and `src/components/PhoneLoginForm.tsx` (card styling only).
- Dashboard and all other screens keep the current light theme untouched.
