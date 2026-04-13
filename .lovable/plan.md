

## Plan: Medium-sized quick action buttons

The current buttons use `aspect-square` making them too tall. I'll remove `aspect-square` and use a fixed height (`h-28`) with horizontal layout to create a comfortable, medium-sized rectangular button — not too big, not too small.

### Changes to `src/components/screens/HomeScreen.tsx`:
- Remove `aspect-square` from button classes
- Add `h-28` for a moderate fixed height
- Keep `rounded-2xl`, gradient backgrounds, and the 2-column grid layout
- Keep icon size at `h-8 w-8` (slightly smaller than current `h-10 w-10`)
- "Collect Payment" still spans full width but with the same moderate height

