import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      memberName,
      tone = "friendly",
      length = "short",
      gymName = "your gym",
      ownerContact = "",
      expiryDate = "",
      amount = 0,
    } = body ?? {};

    if (!memberName || typeof memberName !== "string") {
      return new Response(JSON.stringify({ error: "memberName is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const toneMap: Record<string, string> = {
      friendly: "warm, friendly, casual",
      firm: "polite but firm and direct",
      motivational: "energetic, motivational, fitness-focused",
    };
    const lengthMap: Record<string, string> = {
      short: "under 220 characters (SMS-friendly)",
      medium: "between 300 and 500 characters",
    };

    const system = `You are a gym owner writing a payment reminder message to a member. Write in a ${toneMap[tone] ?? toneMap.friendly} tone. Keep the message ${lengthMap[length] ?? lengthMap.short}. Plain text only — no markdown, no emojis unless the tone is motivational (then use 1-2 max). End with a short call to action. Do not include a subject line. Do not use placeholders like [Name].`;

    const userPrompt = `Write a membership renewal reminder for:
- Member name: ${memberName}
- Gym name: ${gymName}
- Membership expired on: ${expiryDate || "recently"}
- Renewal fee: ${amount ? `₹${amount}` : "monthly fee"}
- Owner contact: ${ownerContact || "the gym"}

Write only the message body, ready to send.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gateway error", response.status, errText);
      const status = response.status;
      const userMsg =
        status === 429
          ? "AI is busy right now. Please try again in a moment."
          : status === 402
            ? "AI credits exhausted. Please add credits to continue."
            : "Failed to generate message.";
      return new Response(JSON.stringify({ error: userMsg, details: errText }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const message: string = data?.choices?.[0]?.message?.content?.trim() ?? "";

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("compose-reminder error", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});