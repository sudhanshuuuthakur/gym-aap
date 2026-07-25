import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, MessageCircle, MessageSquare, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Tone = "friendly" | "firm" | "motivational";
type Length = "short" | "medium";

interface AIReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  memberPhone: string | null;
  gymName: string;
  ownerContact: string;
  expiryDate: string;
  amount: number;
}

export function AIReminderDialog({
  open,
  onOpenChange,
  memberName,
  memberPhone,
  gymName,
  ownerContact,
  expiryDate,
  amount,
}: AIReminderDialogProps) {
  const [tone, setTone] = useState<Tone>("friendly");
  const [length, setLength] = useState<Length>("short");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("compose-reminder", {
        body: { memberName, tone, length, gymName, ownerContact, expiryDate, amount },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessage(data?.message ?? "");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate message");
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsApp = () => {
    if (!memberPhone) return toast.error("No phone number on file");
    if (!message.trim()) return toast.error("Generate a message first");
    const number = memberPhone.replace(/[^0-9+]/g, "").replace(/^\+/, "");
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  const sendSms = () => {
    if (!memberPhone) return toast.error("No phone number on file");
    if (!message.trim()) return toast.error("Generate a message first");
    const number = memberPhone.replace(/[^0-9+]/g, "");
    window.location.href = `sms:${number}?body=${encodeURIComponent(message)}`;
  };

  const tones: { value: Tone; label: string }[] = [
    { value: "friendly", label: "Friendly" },
    { value: "firm", label: "Firm" },
    { value: "motivational", label: "Motivational" },
  ];
  const lengths: { value: Length; label: string }[] = [
    { value: "short", label: "Short" },
    { value: "medium", label: "Medium" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-[#E2E8F0] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[16px] font-semibold text-[#0F172A]">
            <Sparkles className="h-4 w-4 text-[#22C55E]" />
            AI Reminder for {memberName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[#64748B]">Tone</p>
            <div className="flex gap-2">
              {tones.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-[12px] font-medium transition-all ${
                    tone === t.value
                      ? "border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E]"
                      : "border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F1F5F9]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[#64748B]">Length</p>
            <div className="flex gap-2">
              {lengths.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLength(l.value)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-[12px] font-medium transition-all ${
                    length === l.value
                      ? "border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E]"
                      : "border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F1F5F9]"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {!message && !loading && (
            <button
              onClick={generate}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-4 py-3 text-[13px] font-semibold text-white transition-all hover:bg-[#0F172A]/90 active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" />
              Generate Message
            </button>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-[#F1F5F9] py-6 text-[13px] text-[#64748B]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Writing your reminder…
            </div>
          )}

          {message && !loading && (
            <>
              <div>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[#64748B]">
                  Message (editable)
                </p>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={7}
                  className="resize-none rounded-xl border-[#E2E8F0] bg-white text-[13px] text-[#0F172A]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={generate}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5 text-[12px] font-semibold text-[#64748B] transition-all hover:bg-[#F1F5F9] active:scale-95"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate
                </button>
                <button
                  onClick={sendWhatsApp}
                  disabled={!memberPhone}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#22C55E] px-3 py-2.5 text-[12px] font-semibold text-white transition-all hover:bg-[#22C55E]/90 active:scale-95 disabled:opacity-40"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </button>
                <button
                  onClick={sendSms}
                  disabled={!memberPhone}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#3B82F6] px-3 py-2.5 text-[12px] font-semibold text-white transition-all hover:bg-[#3B82F6]/90 active:scale-95 disabled:opacity-40"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  SMS
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}