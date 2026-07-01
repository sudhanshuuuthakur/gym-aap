## Goal
Add a premium, dark, CSS-only ambient background to the **Home tab of the Dashboard** (not the login page), matching the reference image: near-black canvas with soft emerald (top-left), blue (top-right), amber (bottom-right) glows, a faint dumbbell outline (bottom-left), thin rounded-square outlines in the corners, and subtle dotted grid clusters.

## Scope
- Applies only when logged in and viewing the Dashboard.
- Login page (`src/pages/Index.tsx`) stays untouched.
- Pure CSS — no images, SVG files, canvas, or external assets.

## Files

**New: `src/components/PremiumBackground.tsx`**
- Fixed layer: `position: fixed; inset: 0; pointer-events: none; z-index: 0;` behind content (content wrapper gets `relative z-10`).
- Base fill: `#0A0A0A`.
- Four corner glows via layered `radial-gradient`s (soft falloff, no heavy `filter: blur`):
  - Top-left emerald `#10D08A` ~12% opacity
  - Top-right blue `#4F8CFF` ~10%
  - Bottom-right amber `#F5B933` ~10%
  - Bottom-left neutral gray wash ~6%
- Four thin rounded-square outlines (absolutely positioned divs with `border`, `border-radius: 28px`, rotated slightly) in each corner, tinted to match its glow at ~15–20% opacity — mirrors the reference's outlined shapes.
- Two small dotted-grid clusters (top-left and top-right, plus one small bottom-center) built with a repeating `radial-gradient` tile, ~6% opacity, masked with a radial `mask-image` so dots fade out at the edges — matches the reference's dot halftone.
- One faint inline SVG dumbbell **outline** in the bottom-left at ~4% opacity (kept inline as JSX, not an external asset — allowed since it's markup, not a file).
- Vignette overlay: `radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)`.
- All sizes/positions use `vw`, `vh`, `%`, and `clamp()` for responsiveness from phone → ultrawide.

**Edit: `src/components/Dashboard.tsx`**
- Replace root gradient with `bg-[#0A0A0A] relative min-h-[100dvh]`.
- Mount `<PremiumBackground />` as first child.
- Wrap header + main + bottom nav content in `relative z-10` so they sit above the background.
- Header becomes `bg-[#0A0A0A]/50 backdrop-blur-md` so glows bleed subtly through.

## Non-changes
- No edits to `src/index.css` design tokens (protects shadcn + login page).
- No changes to login screen, PhoneLoginForm, or any other screen.
- No animations — static, performance-friendly on mid-range Android.

## Technical notes
- Everything scoped inside `PremiumBackground.tsx` (Tailwind arbitrary values + one small `<style>` block for the dot-grid tile and mask).
- `position: fixed` guarantees the background stays put across scroll and adapts to any viewport without repeat/stretch.
- Total blur cost stays low because glows come from gradient falloff, not `filter: blur()` on large layers.
