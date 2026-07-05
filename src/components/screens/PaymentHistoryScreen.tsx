import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Loader2,
  Receipt,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Input } from "@/components/ui/input";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { SurfaceCard } from "@/components/premium/SurfaceCard";

interface PaymentRecord {
  id: string;
  admission_id: string;
  amount: number;
  payment_date: string;
  method: string;
}

interface Member {
  id: string;
  name: string;
}

interface Props {
  userId: string;
  onBack: () => void;
}

function monthBounds(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const next = new Date(year, month + 1, 1);
  const end = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`;
  return { start, end };
}

function previousMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

function nextMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function isCurrentOrFutureMonth(date: Date) {
  const now = new Date();
  return date.getFullYear() > now.getFullYear() ||
    (date.getFullYear() === now.getFullYear() && date.getMonth() >= now.getMonth());
}

export function PaymentHistoryScreen({ userId, onBack }: Props) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  });
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [prevPayments, setPrevPayments] = useState<PaymentRecord[]>([]);
  const [members, setMembers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    const bounds = monthBounds(selectedMonth);
    const prevBounds = monthBounds(previousMonth(selectedMonth));

    const [paymentRes, prevRes, memberRes] = await Promise.all([
      supabase
        .from("payments")
        .select("id, admission_id, amount, payment_date, method")
        .eq("user_id", userId)
        .gte("payment_date", bounds.start)
        .lt("payment_date", bounds.end)
        .order("payment_date", { ascending: false }),
      supabase
        .from("payments")
        .select("id, amount")
        .eq("user_id", userId)
        .gte("payment_date", prevBounds.start)
        .lt("payment_date", prevBounds.end),
      supabase.from("admissions").select("id, name").eq("user_id", userId),
    ]);

    setPayments((paymentRes.data as PaymentRecord[]) ?? []);
    setPrevPayments((prevRes.data as PaymentRecord[]) ?? []);
    const memberMap: Record<string, string> = {};
    memberRes.data?.forEach((m) => {
      memberMap[m.id] = m.name;
    });
    setMembers(memberMap);
    setLoading(false);
  }, [userId, selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const total = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
    const count = payments.length;
    const uniqueMembers = new Set(payments.map((p) => p.admission_id)).size;
    const average = count > 0 ? Math.round(total / count) : 0;
    return { total, count, uniqueMembers, average };
  }, [payments]);

  const prevTotal = useMemo(
    () => prevPayments.reduce((s, p) => s + Number(p.amount || 0), 0),
    [prevPayments],
  );

  const comparison = useMemo(() => {
    if (prevTotal === 0) {
      return stats.total > 0 ? { pct: 100, up: true } : null;
    }
    const pct = Math.round(((stats.total - prevTotal) / prevTotal) * 100);
    return { pct: Math.abs(pct), up: pct >= 0 };
  }, [stats.total, prevTotal]);

  const dailyChartData = useMemo(() => {
    const daysInMonth = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + 1,
      0,
    ).getDate();
    const dailyTotals = new Map<number, number>();

    for (let d = 1; d <= daysInMonth; d++) {
      dailyTotals.set(d, 0);
    }
    payments.forEach((p) => {
      const day = new Date(p.payment_date).getDate();
      dailyTotals.set(day, (dailyTotals.get(day) ?? 0) + Number(p.amount));
    });

    return Array.from(dailyTotals.entries()).map(([day, amount]) => ({
      day: String(day),
      amount,
    }));
  }, [payments, selectedMonth]);

  const filteredPayments = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return payments;
    return payments.filter((p) => {
      const name = members[p.admission_id]?.toLowerCase() ?? "";
      return name.includes(q) || p.payment_date.includes(q);
    });
  }, [payments, members, search]);

  const groupedByDate = useMemo(() => {
    const groups = new Map<string, PaymentRecord[]>();
    filteredPayments.forEach((p) => {
      const key = p.payment_date;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredPayments]);

  const monthLabel = selectedMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const canGoForward = !isCurrentOrFutureMonth(nextMonth(selectedMonth));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Back"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#FFFFFF] text-[#94A3B8] transition-colors hover:text-[#0F172A] active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-[22px] font-bold tracking-tight text-[#0F172A]">Payment History</h1>
          <p className="mt-0.5 text-[12px] text-[#94A3B8]">Monthly collection & analytics</p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] px-2 py-2">
        <button
          onClick={() => setSelectedMonth((m) => previousMonth(m))}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[#94A3B8] transition-colors hover:bg-white/[0.04] hover:text-[#0F172A]"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-[14px] font-semibold text-[#0F172A]">{monthLabel}</p>
          <p className="text-[10px] text-[#64748B]">
            {stats.count} transaction{stats.count === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={() => canGoForward && setSelectedMonth((m) => nextMonth(m))}
          disabled={!canGoForward}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[#94A3B8] transition-colors hover:bg-white/[0.04] hover:text-[#0F172A] disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#22C55E]" />
        </div>
      ) : (
        <>
          <SurfaceCard className="p-5">
            <p className="text-[12px] font-medium text-[#94A3B8]">Total Collected</p>
            <p className="mt-1 flex items-center text-[28px] font-bold text-[#0F172A]">
              <IndianRupee className="h-6 w-6" />
              {stats.total.toLocaleString("en-IN")}
            </p>
            {comparison && (
              <p className={`mt-2 flex items-center gap-1 text-[12px] font-medium ${comparison.up ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                {comparison.up ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {comparison.pct}% vs {previousMonth(selectedMonth).toLocaleDateString("en-IN", { month: "short" })}
              </p>
            )}
          </SurfaceCard>

          <div className="grid grid-cols-3 gap-2.5">
            <SurfaceCard className="p-3.5 text-center">
              <Receipt className="mx-auto h-4 w-4 text-[#F59E0B]" />
              <p className="mt-1.5 text-[18px] font-bold text-[#0F172A]">{stats.count}</p>
              <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Payments</p>
            </SurfaceCard>
            <SurfaceCard className="p-3.5 text-center">
              <Users className="mx-auto h-4 w-4 text-[#22C55E]" />
              <p className="mt-1.5 text-[18px] font-bold text-[#0F172A]">{stats.uniqueMembers}</p>
              <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Members</p>
            </SurfaceCard>
            <SurfaceCard className="p-3.5 text-center">
              <IndianRupee className="mx-auto h-4 w-4 text-[#3B82F6]" />
              <p className="mt-1.5 text-[18px] font-bold text-[#0F172A]">{stats.average.toLocaleString("en-IN")}</p>
              <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Avg</p>
            </SurfaceCard>
          </div>

          {stats.count > 0 && (
            <SurfaceCard className="p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
                Daily Collection
              </p>
              <ChartContainer
                config={{ amount: { label: "Amount", color: "#22C55E" } }}
                className="aspect-[2/1] h-[140px] w-full"
              >
                <BarChart data={dailyChartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748B", fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Collected"]}
                        labelFormatter={(label) => `Day ${label}`}
                      />
                    }
                  />
                  <Bar dataKey="amount" fill="var(--color-amount)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </SurfaceCard>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              placeholder="Search by member or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 rounded-2xl border-[#E2E8F0] bg-[#FFFFFF] pl-9 text-[14px] text-[#0F172A] placeholder:text-[#64748B] focus-visible:ring-[#22C55E]/40"
            />
          </div>

          {filteredPayments.length === 0 ? (
            <div className="py-12 text-center">
              <Receipt className="mx-auto h-10 w-10 text-[#CBD5E1]" />
              <p className="mt-3 text-[13px] text-[#64748B]">
                {stats.count === 0
                  ? `No payments recorded in ${monthLabel}`
                  : "No matching payments"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedByDate.map(([date, records]) => {
                const dayTotal = records.reduce((s, r) => s + Number(r.amount), 0);
                return (
                  <div key={date}>
                    <div className="mb-2 flex items-center justify-between px-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
                        {new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-[12px] font-semibold text-[#22C55E]">
                        ₹{dayTotal.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      {records.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-semibold text-[#0F172A]">
                              {members[p.admission_id] ?? "Unknown member"}
                            </p>
                            <p className="mt-0.5 text-[11px] capitalize text-[#64748B]">
                              {p.method || "cash"}
                            </p>
                          </div>
                          <p className="flex items-center text-[14px] font-semibold text-[#22C55E]">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {Number(p.amount).toLocaleString("en-IN")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
