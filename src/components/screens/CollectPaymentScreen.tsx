import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, History, Search, Wallet, CheckCircle2, IndianRupee, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PaymentHistoryScreen } from "@/components/screens/PaymentHistoryScreen";
import { SurfaceCard } from "@/components/premium/SurfaceCard";
import { motion } from "framer-motion";

interface Member {
  id: string;
  name: string;
  phone: string | null;
  status: string;
}

interface Payment {
  admission_id: string;
  amount: number;
  payment_date: string;
}

interface Props {
  userId: string;
  onBack: () => void;
}

export function CollectPaymentScreen({ userId, onBack }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [paymentDates, setPaymentDates] = useState<Record<string, Date | undefined>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [defaultFee, setDefaultFee] = useState<number>(500);
  const [showHistory, setShowHistory] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [m, p] = await Promise.all([
      supabase.from("admissions").select("id, name, phone, status").eq("user_id", userId).order("name"),
      (supabase as any).from("payments").select("admission_id, amount, payment_date").eq("user_id", userId).order("payment_date", { ascending: false }),
    ]);
    if (m.data) setMembers(m.data);
    if (p.data) setPayments(p.data as Payment[]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const latestPayment = (id: string) => payments.find((p) => p.admission_id === id);
  const totalCollected = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

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

  const filtered = members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const handleCollect = async (member: Member) => {
    const raw = amounts[member.id];
    const amount = Number(raw);
    if (!raw || isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const selectedDate = paymentDates[member.id];
    const isoDate = selectedDate
      ? format(selectedDate, "yyyy-MM-dd")
      : new Date().toISOString().slice(0, 10);
    setSavingId(member.id);
    const { error } = await (supabase as any).from("payments").insert({
      user_id: userId,
      admission_id: member.id,
      amount,
      payment_date: isoDate,
      method: "cash",
    });
    if (error) {
      toast.error(error.message);
      setSavingId(null);
      return;
    }
    if (member.status !== "approved") {
      await supabase.from("admissions").update({ status: "approved" }).eq("id", member.id);
    }
    const dateLabel = selectedDate ? ` on ${format(selectedDate, "d/M/yyyy")}` : "";
    toast.success(`₹${amount} collected from ${member.name}${dateLabel}`);
    setAmounts((a) => ({ ...a, [member.id]: "" }));
    setPaymentDates((d) => ({ ...d, [member.id]: undefined }));
    setSavingId(null);
    loadData();
  };

  if (showHistory) {
    return <PaymentHistoryScreen userId={userId} onBack={() => setShowHistory(false)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Back"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#FFFFFF] text-[#94A3B8] transition-colors hover:text-[#0F172A] active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-[22px] font-bold tracking-tight text-[#0F172A]">Collect Payment</h1>
          <p className="mt-0.5 text-[12px] text-[#94A3B8]">Record member fee payments</p>
        </div>
        <button
          onClick={() => setShowHistory(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#FFFFFF] text-[#F59E0B] transition-colors hover:text-[#0F172A] active:scale-95"
          aria-label="Payment history"
        >
          <History className="h-4 w-4" />
        </button>
      </div>

      {/* Summary */}
      <SurfaceCard className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium text-[#94A3B8]">Total Collected</p>
            <p className="mt-1 flex items-center text-[24px] font-bold text-[#0F172A]">
              <IndianRupee className="h-5 w-5" />
              {totalCollected.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-[11px] text-[#64748B]">{payments.length} payment{payments.length === 1 ? "" : "s"} recorded</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F59E0B]/12 text-[#F59E0B]">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
      </SurfaceCard>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
        <Input
          placeholder="Search member..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 rounded-2xl border-[#E2E8F0] bg-[#FFFFFF] pl-9 text-[14px] text-[#0F172A] placeholder:text-[#64748B] focus-visible:ring-[#22C55E]/40"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#22C55E]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <Wallet className="mx-auto h-10 w-10 text-[#CBD5E1]" />
          <p className="mt-3 text-[13px] text-[#64748B]">No members found</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((m, idx) => {
            const last = latestPayment(m.id);
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.2), duration: 0.25 }}
                className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-[#0F172A]">{m.name}</p>
                    {m.phone && <p className="mt-0.5 text-[12px] text-[#94A3B8]">{m.phone}</p>}
                    {last && (
                      <div className="mt-1 space-y-1">
                        <p className="flex items-center gap-1 text-[11px]">
                          {isPaymentValid(last) ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-[#22C55E]" />
                              <span className="font-medium text-[#22C55E]">PAID · {getDaysRemaining(last)} days left</span>
                            </>
                          ) : (
                            <>
                              <div className="h-3 w-3 rounded-full border border-[#EF4444]" />
                              <span className="font-medium text-[#EF4444]">UNPAID · expired</span>
                            </>
                          )}
                        </p>
                        <p className="text-[10px] text-[#64748B]">
                          Last paid: ₹{Number(last.amount).toLocaleString("en-IN")} on {new Date(last.payment_date).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    )}
                    {!last && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-[#64748B]">
                        <span className="h-3 w-3 rounded-full border border-[#334155]" />
                        No payment yet
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <IndianRupee className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
                    <Input
                      inputMode="numeric"
                      placeholder={`Amount (Default: ₹${defaultFee})`}
                      value={amounts[m.id] || ""}
                      onFocus={() => {
                        if (!amounts[m.id]) setAmounts((a) => ({ ...a, [m.id]: defaultFee.toString() }));
                      }}
                      onChange={(e) => setAmounts((a) => ({ ...a, [m.id]: e.target.value.replace(/[^0-9.]/g, "") }))}
                      className="h-10 rounded-xl border-[#E2E8F0] bg-[#FFFFFF] pl-7 text-[13px] text-[#0F172A] placeholder:text-[#64748B] focus-visible:ring-[#22C55E]/40"
                    />
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={cn(
                          "h-10 w-10 shrink-0 rounded-xl border-[#E2E8F0] bg-[#FFFFFF] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]",
                          paymentDates[m.id] && "border-[#22C55E]/50 bg-[#22C55E]/5 text-[#22C55E]"
                        )}
                        title={paymentDates[m.id] ? `Date: ${format(paymentDates[m.id]!, "PPP")}` : "Select payment date"}
                      >
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto rounded-2xl border-[#E2E8F0] p-0 z-[9999]" align="end">
                      <Calendar
                        mode="single"
                        selected={paymentDates[m.id]}
                        onSelect={(date) =>
                          setPaymentDates((d) => ({ ...d, [m.id]: date }))
                        }
                        initialFocus
                        disabled={(date) => date > new Date()}
                        className="p-3 pointer-events-auto"
                        classNames={{
                          caption_label: "text-sm font-medium text-[#0F172A]",
                          nav_button: cn(
                            "h-7 w-7 rounded-md border border-[#E2E8F0] p-0 opacity-70 hover:opacity-100 hover:bg-[#F1F5F9] inline-flex items-center justify-center text-[#0F172A]"
                          ),
                          head_cell: "text-[#94A3B8] rounded-md w-9 font-normal text-[0.8rem]",
                          day: "h-9 w-9 p-0 font-normal text-[#334155] hover:bg-[#F1F5F9] rounded-md inline-flex items-center justify-center",
                          day_selected: "bg-[#22C55E] text-[#FFFFFF] hover:bg-[#22C55E]/90 focus:bg-[#22C55E]",
                          day_today: "bg-[#F1F5F9] text-[#0F172A]",
                          day_outside: "text-[#CBD5E1] opacity-50",
                          day_disabled: "text-[#CBD5E1] opacity-50",
                        }}
                      />
                      {paymentDates[m.id] && (
                        <div className="border-t border-[#E2E8F0] p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setPaymentDates((d) => ({ ...d, [m.id]: undefined }))
                            }
                            className="w-full h-8 text-[11px] text-[#94A3B8] hover:text-[#EF4444]"
                          >
                            Clear date (use today)
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  <button
                    onClick={() => handleCollect(m)}
                    disabled={savingId === m.id}
                    className="flex h-10 items-center gap-1.5 rounded-xl bg-[#22C55E] px-4 text-[12px] font-semibold text-[#FFFFFF] transition-all hover:bg-[#22C55E]/90 active:scale-95 disabled:opacity-60"
                  >
                    {savingId === m.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Wallet className="h-3.5 w-3.5" />
                    )}
                    Collect
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}