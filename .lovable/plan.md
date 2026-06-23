## Problem
New users cannot sign up. The login form turns the phone number into an email like `1234567890@phone.local` and uses the 6-digit PIN as the password, then calls `supabase.auth.signUp`. Sign-up is failing silently for everyone (the form shows the generic "Unable to create account" toast).

## Likely Causes (in order of probability)

1. **Leaked-password / weak-password rejection.** Supabase Auth blocks common PINs like `123456`, `000000`, etc. when the HIBP check or the default password strength rules are on. Every 6-digit numeric PIN is in the HIBP breach list, so *every* signup gets rejected with `weak_password` / `password_pwned`. This matches the symptom "no user can sign up".
2. **Signups disabled** on the project (`disable_signup = true`).
3. **Email-domain validation** rejecting `@phone.local` (less likely — Supabase normally accepts it, but worth confirming).
4. **Generic error toast hides the real reason.** The form currently swallows `error.message`, so we can't see which of the above is firing.

## Investigation & Fix Plan

### Step 1 — Surface the real error
Update `PhoneLoginForm.tsx` so the signup branch shows `error.message` (and logs `error` to the console) instead of the generic message. This makes the actual Supabase reason visible immediately.

### Step 2 — Turn off HIBP / leaked-password check for PIN auth
A 6-digit numeric PIN can never pass HIBP. Call `supabase--configure_auth` with `password_hibp_enabled: false` (keeping `disable_signup: false`, `auto_confirm_email: true` so phone-style signups don't need email verification, `external_anonymous_users_enabled: false`).

### Step 3 — Confirm signups are enabled and email auth is on
Same `configure_auth` call ensures `disable_signup: false`. If email provider is off at the project level, note that the user must toggle it in the backend UI (the tool can't enable it).

### Step 4 — Re-test
After the fix, try creating a new account with a non-trivial PIN (e.g. `728193`). The form's own client-side check already blocks obvious PINs like `123456`, so this should now succeed.

### Step 5 — If signup still fails
Read the now-visible error message and address it directly (e.g. email-domain block → switch the synthetic domain to `@phone.app` or similar; rate-limit → wait; trigger error → fix `handle_new_user`).

## Files Touched
- `src/components/PhoneLoginForm.tsx` — show real error on signup failure.
- Auth config — disable HIBP check, ensure signups enabled, auto-confirm on.

## Out of Scope
- No schema changes.
- No change to phone/PIN length rules already in place.
