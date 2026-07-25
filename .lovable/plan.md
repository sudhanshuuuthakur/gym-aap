# AI Reminder Composer

Add an AI-powered message composer that generates personalized payment reminders for unpaid members, replacing the current static template used by the WhatsApp/SMS notify buttons.

## User flow

1. On the **Members** screen, in the **Not Paid** filter, each unpaid member has WhatsApp and SMS buttons (already exist).
2. Add a new **✨ AI Compose** button next to them.
3. Tapping it opens a dialog showing:
   - Tone selector: **Friendly**, **Firm**, **Motivational**
   - Length: **Short** / **Medium**
   - Generate button → streams an AI-written reminder using member's name, join date, days overdue, and gym context.
   - Editable textarea with the generated message.
   - **Send via WhatsApp** and **Send via SMS** buttons that open the deep link with the composed text.
   - **Regenerate** button to try again.

## Technical implementation

- **Edge function** `supabase/functions/compose-reminder/index.ts`
  - Uses Lovable AI Gateway (`LOVABLE_API_KEY`) with `google/gemini-3.6-flash` (fast, cheap, ideal for short generation).
  - Streams response via `streamText` → `toUIMessageStreamResponse`.
  - Input: `{ memberName, phone, joinDate, tone, length, gymName? }`.
  - System prompt: gym owner sending a payment reminder in the given tone/length; keep under ~300 chars for SMS-friendliness; no markdown; end with a polite call to action.
  - Handles 429/402 errors and returns clear messages.

- **New component** `src/components/AIReminderDialog.tsx`
  - Tone/length controls, streaming display via `useChat` or direct fetch + reader.
  - Editable message textarea after generation.
  - "Send WhatsApp" / "Send SMS" buttons use the same deep-link pattern as today with the AI-generated text.

- **Wire into** `src/components/screens/MemberListScreen.tsx`
  - Add ✨ button per unpaid member row that opens `AIReminderDialog`.
  - Keep existing WhatsApp/SMS buttons untouched as a static fallback.

## Files

- Create: `supabase/functions/compose-reminder/index.ts`
- Create: `src/components/AIReminderDialog.tsx`
- Edit: `src/components/screens/MemberListScreen.tsx` (add button + dialog wiring)

## Notes

- No new dependencies — uses existing `ai` SDK patterns and shadcn dialog/select/textarea.
- No database changes.
- Owner-only (already gated behind auth).
