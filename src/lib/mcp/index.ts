import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listMembersTool from "./tools/list-members";
import addMemberTool from "./tools/add-member";
import recordPaymentTool from "./tools/record-payment";
import markAttendanceTool from "./tools/mark-attendance";
import gymSummaryTool from "./tools/gym-summary";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "gym-aap",
  title: "gym aap",
  version: "0.1.0",
  instructions:
    "Tools for a gym owner's management app. Use `gym_summary` for an overview of members, revenue and check-ins; `list_members` to find members and their paid/unpaid status; `add_member` to register a new member; `record_payment` to collect a membership payment; `mark_attendance` to check a member in. All tools act as the signed-in gym owner and only see that owner's data.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    gymSummaryTool,
    listMembersTool,
    addMemberTool,
    recordPaymentTool,
    markAttendanceTool,
  ],
});