import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "record_payment",
  title: "Record membership payment",
  description:
    "Record a membership payment for one of the signed-in gym owner's members and mark that member as paid.",
  inputSchema: {
    member_id: z.string().describe("The member's admission id (UUID) from list_members."),
    amount: z.number().describe("Payment amount collected."),
    method: z.string().optional().describe("Payment method, e.g. cash or upi. Defaults to cash."),
    payment_date: z.string().optional().describe("Payment date as YYYY-MM-DD. Defaults to today."),
    notes: z.string().optional().describe("Optional note about this payment."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    if (!(input.amount > 0))
      return { content: [{ type: "text", text: "Amount must be greater than 0" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data: member, error: memberError } = await supabase
      .from("admissions")
      .select("id, name")
      .eq("id", input.member_id)
      .maybeSingle();
    if (memberError)
      return { content: [{ type: "text", text: memberError.message }], isError: true };
    if (!member)
      return { content: [{ type: "text", text: "Member not found" }], isError: true };

    const { data, error } = await supabase
      .from("payments")
      .insert({
        user_id: ctx.getUserId(),
        admission_id: member.id,
        amount: input.amount,
        method: input.method ?? "cash",
        payment_date: input.payment_date ?? new Date().toISOString().slice(0, 10),
        notes: input.notes ?? null,
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    await supabase.from("admissions").update({ status: "paid" }).eq("id", member.id);

    return {
      content: [
        { type: "text", text: `Recorded ${input.amount} for ${member.name} and marked as paid.` },
      ],
      structuredContent: { payment: data },
    };
  },
});