import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "mark_attendance",
  title: "Mark member attendance",
  description: "Check a member in for a given day (defaults to today) for the signed-in gym owner.",
  inputSchema: {
    member_id: z.string().describe("The member's admission id (UUID) from list_members."),
    check_in_date: z.string().optional().describe("Check-in date as YYYY-MM-DD. Defaults to today."),
    notes: z.string().optional().describe("Optional note for this check-in."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("attendance")
      .insert({
        user_id: ctx.getUserId(),
        admission_id: input.member_id,
        check_in_date: input.check_in_date ?? new Date().toISOString().slice(0, 10),
        notes: input.notes ?? null,
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Checked in on ${data.check_in_date}.` }],
      structuredContent: { attendance: data },
    };
  },
});