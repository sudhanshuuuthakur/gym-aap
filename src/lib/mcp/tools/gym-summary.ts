import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "gym_summary",
  title: "Gym overview summary",
  description:
    "Summarize the signed-in gym owner's gym: total members, paid vs unpaid counts, revenue collected, and check-ins over a recent window.",
  inputSchema: {
    days: z
      .number()
      .int()
      .optional()
      .describe("Window in days for revenue and attendance totals (default 30)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ days }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const window = Math.min(Math.max(days ?? 30, 1), 365);
    const since = new Date(Date.now() - window * 86400000).toISOString().slice(0, 10);
    const supabase = supabaseForUser(ctx);

    const [members, payments, checkIns] = await Promise.all([
      supabase.from("admissions").select("id, status"),
      supabase.from("payments").select("amount, payment_date").gte("payment_date", since),
      supabase.from("attendance").select("id, check_in_date").gte("check_in_date", since),
    ]);

    const firstError = members.error ?? payments.error ?? checkIns.error;
    if (firstError)
      return { content: [{ type: "text", text: firstError.message }], isError: true };

    const all = members.data ?? [];
    const paid = all.filter((m) => m.status === "paid").length;
    const summary = {
      window_days: window,
      total_members: all.length,
      paid_members: paid,
      unpaid_members: all.length - paid,
      revenue_in_window: (payments.data ?? []).reduce((sum, p) => sum + Number(p.amount ?? 0), 0),
      payments_in_window: payments.data?.length ?? 0,
      check_ins_in_window: checkIns.data?.length ?? 0,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});