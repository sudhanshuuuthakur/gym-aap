import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  memberPhone: string | null;
  gymName: string;
}

export function SendMessageDialog({
  open,
  onOpenChange,
  memberName,
  memberPhone,
  gymName,
}: SendMessageDialogProps) {
  const defaultMsg = `Hi ${memberName},\n\nHope you're doing great! This is ${gymName}. Just wanted to check in and see how your training is going.\n\nLet us know if you need anything.\n\nTeam ${gymName}`;

  const [message, setMessage] = useState(defaultMsg);

  // Re-fill the template whenever a different member is opened
  useEffect(() => {
    if (open) {
      setMessage(
        `Hi ${memberName},\n\nHope you're doing great! This is ${gymName}. Just wanted to check in and see how your training is going.\n\nLet us know if you need anything.\n\nTeam ${gymName}`
      );
    }
  }, [open, memberName, gymName]);

  const sanitizePhone = (phone: string) => phone.replace(/[^0-9+]/g, "").replace(/^\+/, "");

  const sendWhatsApp = () => {
    if (!memberPhone) {
      toast.error("No phone number on file");
      return;
    }
    if (!message.trim()) {
      toast.error("Message is empty");
      return;
    }
    const number = sanitizePhone(memberPhone);
    window.open(
      `https://wa.me/${number}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const sendSms = () => {
    if (!memberPhone) {
      toast.error("No phone number on file");
      return;
    }
    if (!message.trim()) {
      toast.error("Message is empty");
      return;
    }
    const number = memberPhone.replace(/[^0-9+]/g, "");
    window.location.href = `sms:${number}?body=${encodeURIComponent(message)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-[#E2E8F0] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[16px] font-semibold text-[#0F172A]">
            <Send className="h-4 w-4 text-[#22C55E]" />
            Message {memberName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[#64748B]">
              Message (editable)
            </p>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={7}
              className="resize-none rounded-xl border-[#E2E8F0] bg-white text-[13px] leading-relaxed text-[#0F172A] focus-visible:ring-[#22C55E]/40"
            />
          </div>

          <div className="flex gap-2">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
