import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Search, Users, CheckCircle2, Clock, MessageCircle, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
  all: { title: "Total Members", icon: Users, accent: "text-neutral-300" },
  paid: { title: "Paid Members", icon: CheckCircle2, accent: "text-emerald-400" },
  notpaid: { title: "Unpaid Members", icon: Clock, accent: "text-red-400" },
};

export function MemberListScreen({ userId, filter, onBack }: MemberListScreenProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800/60 text-neutral-300 transition-colors hover:bg-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className={`text-xl font-bold ${config.accent}`}>{config.title}</h1>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-neutral-800/60 px-3 py-1 text-xs font-medium text-neutral-300">
          <Icon className="h-3.5 w-3.5" />
          {filteredByStatus.length}
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <Input
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-neutral-800 bg-neutral-900/60 pl-9 text-neutral-200 placeholder:text-neutral-600"
        />
      </div>

      {/* Member List */}
      {loading ? (
        <div className="py-12 text-center text-sm text-neutral-500">Loading members...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <Icon className="mx-auto h-10 w-10 text-neutral-700" />
          <p className="mt-3 text-sm text-neutral-500">
            {search ? "No members match your search" : "No members in this category"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((member) => {
            const lastPayment = getLatestPayment(member.id);
            const isPaid = isPaymentValid(lastPayment);
            const daysRemaining = getDaysRemaining(lastPayment);
            const expiryDate = getExpiryDate(lastPayment);
            const amount = lastPayment?.amount ?? 0;
            const gymName = profile?.display_name || "Your Gym";
            const contactNumber = profile?.phone || "";
            return (
              <div
                key={member.id}
                className="rounded-xl border border-neutral-800/60 bg-neutral-900/40 px-4 py-3.5 transition-colors hover:bg-neutral-800/40"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-100">
                      {member.name}
                    </p>
                    {member.phone && (
                      <p className="mt-0.5 text-xs text-neutral-500">{member.phone}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pl-3">
                    <span className="text-[10px] font-medium text-neutral-500">
                      {isPaid ? `Paid (${daysRemaining}d)` : "Unpaid"}
                    </span>
                    <span
                      className={`h-3 w-3 shrink-0 rounded-full ${
                        isPaid ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" : "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]"
                      }`}
                    />
                  </div>
                </div>
                {!isPaid && (
                  <div className="mt-3 flex gap-2">
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
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-40"
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
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-400 transition-colors hover:bg-sky-500/20 disabled:opacity-40"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      SMS
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
