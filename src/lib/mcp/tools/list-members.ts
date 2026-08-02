import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_members",
  title: "List gym members",
  description:
    "List the signed-in gym owner's members (admissions), optionally filtered by payment status or a name/phone search.",
  inputSchema: {
    status: z
      .enum(["all", "paid", "unpaid"])
      .optional()
      .describe("Filter by membership payment status. Defaults to all."),
    search: z.string().optional().describe("Match against member name or phone."),
    limit: z.number().int().optional().describe("Max members to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, search, limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("admissions")
      .select("id, name, phone, status, join_date, age, height, weight, created_at")
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit ?? 50, 1), 200));
    if (status && status !== "all") query = query.eq("status", status);
    if (search?.trim())
      query = query.or(`name.ilike.%${search.trim()}%,phone.ilike.%${search.trim()}%`);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { members: data ?? [], count: data?.length ?? 0 },
    };
  },
});