import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, History, Search, Wallet, CheckCircle2, IndianRupee, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PaymentHistoryScreen } from "@/components/screens/PaymentHistoryScreen";

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
    setSavingId(member.id);
    const { error } = await (supabase as any).from("payments").insert({
      user_id: userId,
      admission_id: member.id,
      amount,
      payment_date: new Date().toISOString().slice(0, 10),
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
    toast.success(`₹${amount} collected from ${member.name}`);
    setAmounts((a) => ({ ...a, [member.id]: "" }));
    setSavingId(null);
    loadData();
  };

  if (showHistory) {
    return <PaymentHistoryScreen userId={userId} onBack={() => setShowHistory(false)} />;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-800/60 text-neutral-300 transition-colors hover:bg-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-amber-400">Collect Payment</h1>
          <p className="text-xs text-neutral-500">Record member fee payments</p>
        </div>
        <button
          onClick={() => setShowHistory(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 transition-colors hover:bg-amber-500/20"
          aria-label="Payment history"
        >
          <History className="h-4 w-4" />
        </button>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-amber-600/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-300/80">Total Collected</p>
            <p className="mt-1 flex items-center text-2xl font-bold text-amber-300">
              <IndianRupee className="h-5 w-5" />
              {totalCollected.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
            <Wallet className="h-6 w-6 text-amber-300" />
          </div>
        </div>
        <p className="mt-2 text-xs text-neutral-400">{payments.length} payment{payments.length === 1 ? "" : "s"} recorded</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <Input
          placeholder="Search member..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-neutral-800 bg-neutral-900/60 pl-9 text-neutral-200 placeholder:text-neutral-600"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <Wallet className="mx-auto h-10 w-10 text-neutral-700" />
          <p className="mt-3 text-sm text-neutral-500">No members found</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((m) => {
            const last = latestPayment(m.id);
            return (
              <div
                key={m.id}
                className="rounded-xl border border-neutral-800/60 bg-neutral-900/40 p-3.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neutral-100">{m.name}</p>
                    {m.phone && <p className="mt-0.5 text-xs text-neutral-500">{m.phone}</p>}
                    {last && (
                      <div className="mt-1 space-y-1">
                        <p className="flex items-center gap-1 text-[11px]">
                          {isPaymentValid(last) ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400/90">PAID - {getDaysRemaining(last)} days left</span>
                            </>
                          ) : (
                            <>
                              <div className="h-3 w-3 rounded-full border border-red-400 bg-transparent" />
                              <span className="text-red-400/90">UNPAID - Payment expired</span>
                            </>
                          )}
                        </p>
                        <p className="text-[10px] text-neutral-500">
                          Last paid: ₹{Number(last.amount).toLocaleString("en-IN")} on {new Date(last.payment_date).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    )}
                    {!last && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500">
                        <div className="h-3 w-3 rounded-full border border-neutral-600 bg-transparent" />
                        No payment yet
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <IndianRupee className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
                    <Input
                      inputMode="numeric"
                      placeholder={`Amount (Default: ₹${defaultFee})`}
                      value={amounts[m.id] || ""}
                      onFocus={() => {
                        if (!amounts[m.id]) setAmounts((a) => ({ ...a, [m.id]: defaultFee.toString() }));
                      }}
                      onChange={(e) => setAmounts((a) => ({ ...a, [m.id]: e.target.value.replace(/[^0-9.]/g, "") }))}
                      className="h-9 border-neutral-800 bg-neutral-950/60 pl-7 text-sm text-neutral-100 placeholder:text-neutral-600"
                    />
                  </div>
                  <button
                    onClick={() => handleCollect(m)}
                    disabled={savingId === m.id}
                    className="flex h-9 items-center gap-1.5 rounded-lg bg-amber-500/90 px-3.5 text-xs font-semibold text-neutral-950 transition-colors hover:bg-amber-400 disabled:opacity-60"
                  >
                    {savingId === m.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Wallet className="h-3.5 w-3.5" />
                    )}
                    Collect
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}