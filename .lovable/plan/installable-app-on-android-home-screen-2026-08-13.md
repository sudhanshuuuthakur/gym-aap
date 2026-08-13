# Installable app on Android home screen

## Current state (verified)
Installable support is already wired up:
- `public/manifest.webmanifest` exists with name, standalone display, theme/background colors and 192/512 icons (including a maskable entry).
- `index.html` links the manifest, theme color and Apple touch icon.
- The Info screen has an "Install App" button that uses the browser's native install prompt, with iPhone/Android fallback steps.

So nothing fundamental is missing. What's left is polish so Android reliably offers "Install app" and users actually notice it.

## What I'll do
1. Dedicated maskable icon: generate a 512x512 icon with safe padding so the Android launcher icon isn't cropped, and point the `maskable` manifest entry at it (today it reuses the normal icon).
2. Manifest completeness for Android install quality: add `id`, `lang`, `dir`, and `categories`; keep `start_url`, `scope` and `display` unchanged so already-installed users aren't broken.
3. Install banner on Home: a small dismissible "Add Gym Manager to your home screen" card at the top of the Home screen, shown only when the browser reports the app is installable and it isn't installed yet. Dismissal is remembered locally.
4. Clearer Android steps in the existing Install dialog (Chrome menu > Add to Home screen) for when the native prompt isn't offered.

## Not included
No offline mode / service worker — you didn't ask for offline, and adding one risks stale screens. Install-to-home-screen works fine without it.

## Notes
Installing can't be triggered inside the Lovable editor preview frame; it works on the published URL opened directly in Chrome on Android. Play Store listing still needs the separate native (Capacitor) path.

## Technical details
- New asset `public/app-icon-maskable-512.png`; update the maskable icon entry in `public/manifest.webmanifest`.
- New `src/components/InstallBanner.tsx` using the existing `useInstallApp` hook (`canInstall`, `installed`, `inPreviewFrame`), rendered at the top of `src/components/screens/HomeScreen.tsx` with existing surface/card tokens.
- Minor copy edits in `src/components/InstallAppDialog.tsx`.
- No service worker, no `vite-plugin-pwa`, no changes to `start_url`/`scope`/`display`.