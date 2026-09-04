import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SurfaceCard } from "@/components/premium/SurfaceCard";
import { StatisticCard } from "@/components/premium/StatisticCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle2, Users, Clock, ChevronDown, TrendingUp, Check } from "lucide-react";

type PeriodKey = "this" | "last" | "all";

const PERIOD_LABELS: Record<PeriodKey, string> = {
  this: "This Month",
  last: "Last Month",
  all: "All Time",
};

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
  const [period, setPeriod] = useState<PeriodKey>("this");
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

  const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const now = new Date();
  const thisKey = monthKey(now);
  const lastKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const isPaidInPeriod = (memberId: string) => {
    const memberPayments = payments.filter((p) => p.admission_id === memberId);
    if (period === "all") {
      const latest = memberPayments[0];
      if (!latest) return false;
      const daysDiff = Math.floor(
        (now.getTime() - new Date(latest.payment_date).getTime()) / (1000 * 60 * 60 * 24),
      );
      return daysDiff <= 30;
    }
    const key = period === "this" ? thisKey : lastKey;
    return memberPayments.some((p) => p.payment_date.slice(0, 7) === key);
  };

  const total = members.length;
  const paid = members.filter((m) => isPaidInPeriod(m.id)).length;
  const pending = total - paid;
  const paidPercent = total > 0 ? Math.round((paid / total) * 100) : 0;
  const collectionLabel = paidPercent >= 90 ? "Excellent" : paidPercent >= 60 ? "On track" : paidPercent >= 30 ? "Needs attention" : "Critical";

  if (loading) {
    return (
      <SurfaceCard className="py-10 text-center text-sm text-[#64748B]">
        Loading stats…
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold tracking-tight text-[#0F172A]">Membership Overview</h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F1F5F9] px-3 py-1.5 text-[12px] font-medium text-[#94A3B8] transition-colors hover:text-[#0F172A]"
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
      <div className="mt-5 rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#22C55E]/12 text-[#22C55E]">
              <TrendingUp className="h-4 w-4" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#0F172A]">Payment Collection</p>
              <p className="text-[11px] text-[#94A3B8]">{paid} of {total} members</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[18px] font-bold leading-none text-[#0F172A]">{paidPercent}%</p>
            <p className="mt-1 text-[11px] font-medium text-[#22C55E]">{collectionLabel}</p>
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#F1F5F9]" role="progressbar" aria-valuenow={paidPercent} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full rounded-full bg-[#22C55E] transition-[width] duration-500"
            style={{ width: `${paidPercent}%` }}
          />
        </div>
      </div>
    </SurfaceCard>
  );
}
