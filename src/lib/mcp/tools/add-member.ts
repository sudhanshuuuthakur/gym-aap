import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "add_member",
  title: "Add gym member",
  description:
    "Register a new gym member (admission) for the signed-in gym owner. Name and phone are required.",
  inputSchema: {
    name: z.string().describe("Member full name."),
    phone: z.string().describe("10-digit phone number."),
    join_date: z.string().optional().describe("Date of joining as YYYY-MM-DD."),
    age: z.number().int().optional().describe("Member age in years."),
    height: z.number().optional().describe("Height in cm."),
    weight: z.number().optional().describe("Weight in kg."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const name = input.name.trim();
    const phone = input.phone.replace(/\D/g, "");
    if (!name) return { content: [{ type: "text", text: "Name is required" }], isError: true };
    if (phone.length !== 10)
      return {
        content: [{ type: "text", text: "Phone must be exactly 10 digits" }],
        isError: true,
      };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("admissions")
      .insert({
        user_id: ctx.getUserId(),
        name,
        phone,
        join_date: input.join_date ?? new Date().toISOString().slice(0, 10),
        age: input.age ?? null,
        height: input.height ?? null,
        weight: input.weight ?? null,
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Added member ${data.name} (${data.phone}).` }],
      structuredContent: { member: data },
    };
  },
});