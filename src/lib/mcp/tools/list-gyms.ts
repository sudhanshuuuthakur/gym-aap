import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_gyms",
  title: "List gyms",
  description: "List the signed-in gym owner's locations so a specific gym can be selected for other tools.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("gyms")
      .select("id, name")
      .order("created_at", { ascending: true })
      .limit(100);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const gyms = (data ?? []).map(({ id, name }) => ({ id, name }));
    return {
      content: [{ type: "text", text: JSON.stringify(gyms, null, 2) }],
      structuredContent: { gyms, count: gyms.length },
    };
  },
});