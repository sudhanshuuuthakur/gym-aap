import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Search, Users, CheckCircle2, Clock, MessageCircle, MessageSquare, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SurfaceCard } from "@/components/premium/SurfaceCard";
import { motion } from "framer-motion";
import { AIReminderDialog } from "@/components/AIReminderDialog";

export type MemberFilter = "all" | "paid" | "notpaid";

interface Member {
  id: string;
  name: string;
  status: string;
  phone: string | null;
}

interface Payment {
  admission_id: string;
  amount: number;
  payment_date: string;
}

interface Profile {
  display_name: string | null;
  phone: string | null;
}

interface MemberListScreenProps {
  userId: string;
  filter: MemberFilter;
  onBack: () => void;
}

const filterConfig = {
  all: { title: "Total Members", icon: Users },
  paid: { title: "Paid Members", icon: CheckCircle2 },
  notpaid: { title: "Unpaid Members", icon: Clock },
};

export function MemberListScreen({ userId, filter, onBack }: MemberListScreenProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [aiTarget, setAiTarget] = useState<null | {
    name: string;
    phone: string | null;
    expiryDate: string;
    amount: number;
    gymName: string;
    ownerContact: string;
  }>(null);

  useEffect(() => {
    Promise.all([
      supabase
        .from("admissions")
        .select("id, name, status, phone")
        .eq("user_id", userId)
        .order("name"),
      (supabase as any)
        .from("payments")
        .select("admission_id, amount, payment_date")
        .eq("user_id", userId)
        .order("payment_date", { ascending: false }),
      supabase
        .from("profiles")
        .select("display_name, phone")
        .eq("id", userId)
        .single(),
    ]).then(([memberRes, paymentRes, profileRes]) => {
      if (memberRes.data) setMembers(memberRes.data);
      if (paymentRes.data) setPayments(paymentRes.data as Payment[]);
      if (profileRes.data) setProfile(profileRes.data as Profile);
      setLoading(false);
    });
  }, [userId]);

  const getLatestPayment = (memberId: string) => 
    payments.find((p) => p.admission_id === memberId);

  const isPaymentValid = (payment: Payment | undefined) => {
    if (!payment) return false;
    const paymentDate = new Date(payment.payment_date);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30;
  };

  const getDaysRemaining = (payment: Payment | undefined) => {
    if (!payment) return 0;
    const paymentDate = new Date(payment.payment_date);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - daysDiff);
  };

  const getExpiryDate = (payment: Payment | undefined) => {
    if (!payment) return "N/A";
    const paymentDate = new Date(payment.payment_date);
    paymentDate.setDate(paymentDate.getDate() + 30);
    return paymentDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  };

  const filteredByStatus = filter === "paid"
    ? members.filter((m) => {
        const lastPayment = getLatestPayment(m.id);
        return isPaymentValid(lastPayment);
      })
    : filter === "notpaid"
      ? members.filter((m) => {
          const lastPayment = getLatestPayment(m.id);
          return !isPaymentValid(lastPayment);
        })
      : members;

  const filtered = filteredByStatus.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const config = filterConfig[filter];
  const Icon = config.icon;

  const buildReminder = ({
    name,
    expiryDate,
    amount,
    gymName,
    contactNumber,
  }: {
    name: string;
    expiryDate: string;
    amount: number;
    gymName: string;
    contactNumber: string;
  }) =>
    `🏋️ Membership Renewal Reminder\n\nHi ${name},\n\nThis is a friendly reminder that your gym membership has expired on ${expiryDate}.\n\nTo continue enjoying uninterrupted access to our gym facilities and services, please renew your membership by paying the monthly fee at your earliest convenience.\n\nFee Amount: ₹${amount}\n\nFor any assistance regarding payment or membership renewal, feel free to contact us.\n\nThank you for being a valued member of ${gymName}. We look forward to helping you achieve your fitness goals.\n\nTeam ${gymName}\n📞 ${contactNumber}`;

  const sanitizePhone = (phone: string) => phone.replace(/[^0-9+]/g, "").replace(/^\+/, "");

  const notifyWhatsApp = ({
    name,
    phone,
    expiryDate,
    amount,
    gymName,
    contactNumber,
  }: {
    name: string;
    phone: string | null;
    expiryDate: string;
    amount: number;
    gymName: string;
    contactNumber: string;
  }) => {
    if (!phone) {
      toast.error("No phone number on file");
      return;
    }
    const number = sanitizePhone(phone);
    const text = encodeURIComponent(
      buildReminder({ name, expiryDate, amount, gymName, contactNumber })
    );
    window.open(`https://wa.me/${number}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const notifySms = ({
    name,
    phone,
    expiryDate,
    amount,
    gymName,
    contactNumber,
  }: {
    name: string;
    phone: string | null;
    expiryDate: string;
    amount: number;
    gymName: string;
    contactNumber: string;
  }) => {
    if (!phone) {
      toast.error("No phone number on file");
      return;
    }
    const number = phone.replace(/[^0-9+]/g, "");
    const text = encodeURIComponent(
      buildReminder({ name, expiryDate, amount, gymName, contactNumber })
    );
    window.location.href = `sms:${number}?body=${text}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#FFFFFF] text-[#94A3B8] transition-colors hover:text-[#0F172A] active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-[22px] font-bold tracking-tight text-[#0F172A]">{config.title}</h1>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-1 text-[12px] font-medium text-[#94A3B8]">
          <Icon className="h-3.5 w-3.5 text-[#22C55E]" />
          {filteredByStatus.length}
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
        <Input
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 rounded-2xl border-[#E2E8F0] bg-[#FFFFFF] pl-9 text-[14px] text-[#0F172A] placeholder:text-[#64748B] focus-visible:ring-[#22C55E]/40"
        />
      </div>

      {/* Member List */}
      {loading ? (
        <div className="py-12 text-center text-[13px] text-[#64748B]">Loading members…</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <Icon className="mx-auto h-10 w-10 text-[#CBD5E1]" />
          <p className="mt-3 text-[13px] text-[#64748B]">
            {search ? "No members match your search" : "No members in this category"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((member, idx) => {
            const lastPayment = getLatestPayment(member.id);
            const isPaid = isPaymentValid(lastPayment);
            const daysRemaining = getDaysRemaining(lastPayment);
            const expiryDate = getExpiryDate(lastPayment);
            const amount = lastPayment?.amount ?? 0;
            const gymName = profile?.display_name || "Your Gym";
            const contactNumber = profile?.phone || "";
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.2), duration: 0.25 }}
                className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-3.5 transition-colors hover:bg-[#F1F5F9]"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-[#0F172A]">
                      {member.name}
                    </p>
                    {member.phone && (
                      <p className="mt-0.5 text-[12px] text-[#94A3B8]">{member.phone}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pl-3">
                    <span className="text-[10px] font-medium text-[#94A3B8]">
                      {isPaid ? `Paid (${daysRemaining}d)` : "Unpaid"}
                    </span>
                    <span
                      className={`h-3 w-3 shrink-0 rounded-full ${
                        isPaid ? "bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                      }`}
                    />
                  </div>
                </div>
                {!isPaid && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() =>
                        setAiTarget({
                          name: member.name,
                          phone: member.phone,
                          expiryDate,
                          amount,
                          gymName,
                          ownerContact: contactNumber,
                        })
                      }
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-[#0F172A]/15 bg-[#0F172A] px-3 py-2 text-[12px] font-semibold text-white transition-all hover:bg-[#0F172A]/90 active:scale-95"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      AI
                    </button>
                    <button
                      onClick={() =>
                        notifyWhatsApp({
                          name: member.name,
                          phone: member.phone,
                          expiryDate,
                          amount,
                          gymName,
                          contactNumber,
                        })
                      }
                      disabled={!member.phone}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/8 px-3 py-2 text-[12px] font-semibold text-[#22C55E] transition-all hover:bg-[#22C55E]/15 active:scale-95 disabled:opacity-40"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </button>
                    <button
                      onClick={() =>
                        notifySms({
                          name: member.name,
                          phone: member.phone,
                          expiryDate,
                          amount,
                          gymName,
                          contactNumber,
                        })
                      }
                      disabled={!member.phone}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#3B82F6]/20 bg-[#3B82F6]/8 px-3 py-2 text-[12px] font-semibold text-[#3B82F6] transition-all hover:bg-[#3B82F6]/15 active:scale-95 disabled:opacity-40"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      SMS
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
      {aiTarget && (
        <AIReminderDialog
          open={!!aiTarget}
          onOpenChange={(o) => !o && setAiTarget(null)}
          memberName={aiTarget.name}
          memberPhone={aiTarget.phone}
          gymName={aiTarget.gymName}
          ownerContact={aiTarget.ownerContact}
          expiryDate={aiTarget.expiryDate}
          amount={aiTarget.amount}
        />
      )}
    </div>
  );
}
