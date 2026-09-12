# Profile Window and Theme Controls

## What will change
- Show only the user’s circular profile photo/icon in place of the app logo; remove the profile label, name, and arrow from the header.
- Open a polished profile window when the icon is tapped.
- Let the owner add or replace a profile photo, edit their name and 10-digit phone number, and save both.
- Add one-tap Light and Dark appearance options and remember the selected appearance on the device.
- Display the saved profile photo in the header and profile window.

## Technical details
- Reuse the existing owner profile record and its photo/name/phone fields.
- Store profile images privately with owner-only access.
- Apply the existing light/dark design tokens throughout the signed-in interface without changing gym-management logic.
- Validate photo type/size and phone format, then verify saving, appearance switching, and mobile layout.
