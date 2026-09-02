import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SurfaceCard } from "@/components/premium/SurfaceCard";
import { StatisticCard } from "@/components/premium/StatisticCard";
import { CheckCircle2, Users, Clock, ChevronDown, TrendingUp } from "lucide-react";

interface Member {
  id: string;
  name: string;
  status: string;
}

interface Payment {
  admission_id: string;
  amount: number;
  payment_date: string;
}

interface MembershipStatsProps {
  userId: string;
  onViewMembers?: (filter: "all" | "paid" | "notpaid") => void;
}

export function MembershipStats({ userId, onViewMembers }: MembershipStatsProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  // reserved for future expand state

  useEffect(() => {
    async function fetchStats() {
      const [memberRes, paymentRes] = await Promise.all([
        supabase
          .from("admissions")
          .select("id, name, status")
          .eq("user_id", userId)
          .order("name"),
        (supabase as any)
          .from("payments")
          .select("admission_id, amount, payment_date")
          .eq("user_id", userId)
          .order("payment_date", { ascending: false }),
      ]);

      if (memberRes.data) setMembers(memberRes.data);
      if (paymentRes.data) setPayments(paymentRes.data as Payment[]);
      setLoading(false);
    }
    fetchStats();
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

  const total = members.length;
  const paidMembers = members.filter((m) => isPaymentValid(getLatestPayment(m.id)));
  const pendingMembers = members.filter((m) => !isPaymentValid(getLatestPayment(m.id)));
  const paid = paidMembers.length;
  const pending = pendingMembers.length;
  const paidPercent = total > 0 ? Math.round((paid / total) * 100) : 0;
  const collectionLabel = paidPercent >= 90 ? "Excellent" : paidPercent >= 60 ? "On track" : paidPercent >= 30 ? "Needs attention" : "Critical";

  if (loading) {
    return (
        <SurfaceCard className="py-10 text-center text-sm text-muted-foreground">
        Loading stats…
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">04 / Live dashboard</p>
          <h2 className="mt-1 text-[15px] font-semibold tracking-tight text-foreground">Membership Overview</h2>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          This Month
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <StatisticCard label="Total Members" value={total} icon={Users} tone="neutral" onClick={() => onViewMembers?.("all")} />
        <StatisticCard label="Paid" value={paid} icon={CheckCircle2} tone="primary" onClick={() => onViewMembers?.("paid")} />
        <StatisticCard label="Pending" value={pending} icon={Clock} tone="warning" onClick={() => onViewMembers?.("notpaid")} />
      </div>

      {/* Payment collection */}
      <div className="mt-5 rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" strokeWidth={2} />
            </div>
            <div>
               <p className="text-[13px] font-medium text-foreground">Payment Collection</p>
               <p className="text-[11px] text-muted-foreground">{paid} of {total} members</p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[18px] font-bold leading-none text-foreground">{paidPercent}%</p>
             <p className="mt-1 text-[11px] font-medium text-primary">{collectionLabel}</p>
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={paidPercent} aria-valuemin={0} aria-valuemax={100}>
          <div
             className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${paidPercent}%` }}
          />
        </div>
      </div>
    </SurfaceCard>
  );
}
