## Goal
Ensure the login page restricts phone number input to exactly 10 digits and the PIN to exactly 6 digits.

## Changes

### 1. Phone number input (`src/components/PhoneLoginForm.tsx`)
- Add `maxLength={10}` to the `<Input type="tel">`.
- Add `inputMode="numeric"` for mobile numeric keyboards.
- Update the `onChange` handler to strip non-digit characters and cap the value at 10 digits.
- Update `handleSubmit` validation to require exactly 10 digits instead of the current `< 7` check.

### 2. PIN input (`src/components/PhoneLoginForm.tsx`)
- The existing `<InputOTP maxLength={6}>` already limits input to 6 characters via the underlying `input-otp` library.
- Keep the `pin.length < 6` validation in `handleSubmit` to enforce that all 6 slots are filled.

## Outcome
- Users can only type up to 10 numeric digits in the phone field.
- Users can only type up to 6 digits in the PIN field.
- Submit validation rejects anything other than exactly 10-digit phone numbers and 6-digit PINs.