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
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-800/60 text-neutral-300 transition-colors hover:bg-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-amber-400">Payment History</h1>
          <p className="text-xs text-neutral-500">Monthly collection records & analytics</p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-neutral-800/60 bg-neutral-900/40 px-2 py-2">
        <button
          onClick={() => setSelectedMonth((m) => previousMonth(m))}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-neutral-100">{monthLabel}</p>
          <p className="text-[10px] text-neutral-500">
            {stats.count} transaction{stats.count === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={() => canGoForward && setSelectedMonth((m) => nextMonth(m))}
          disabled={!canGoForward}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200 disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-amber-600/5 p-4">
            <p className="text-xs text-amber-300/80">Total Collected</p>
            <p className="mt-1 flex items-center text-3xl font-bold text-amber-300">
              <IndianRupee className="h-6 w-6" />
              {stats.total.toLocaleString("en-IN")}
            </p>
            {comparison && (
              <p className={`mt-2 flex items-center gap-1 text-xs ${comparison.up ? "text-emerald-400" : "text-red-400"}`}>
                {comparison.up ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {comparison.pct}% vs {previousMonth(selectedMonth).toLocaleDateString("en-IN", { month: "short" })}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/40 p-3 text-center">
              <Receipt className="mx-auto h-4 w-4 text-amber-400/80" />
              <p className="mt-1.5 text-lg font-bold text-neutral-100">{stats.count}</p>
              <p className="text-[10px] text-neutral-500">Payments</p>
            </div>
            <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/40 p-3 text-center">
              <Users className="mx-auto h-4 w-4 text-emerald-400/80" />
              <p className="mt-1.5 text-lg font-bold text-neutral-100">{stats.uniqueMembers}</p>
              <p className="text-[10px] text-neutral-500">Members</p>
            </div>
            <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/40 p-3 text-center">
              <IndianRupee className="mx-auto h-4 w-4 text-blue-400/80" />
              <p className="mt-1.5 text-lg font-bold text-neutral-100">{stats.average.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-neutral-500">Avg / payment</p>
            </div>
          </div>

          {stats.count > 0 && (
            <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/40 p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                Daily Collection
              </p>
              <ChartContainer
                config={{ amount: { label: "Amount", color: "hsl(38 92% 50%)" } }}
                className="aspect-[2/1] h-[140px] w-full"
              >
                <BarChart data={dailyChartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#737373", fontSize: 10 }}
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
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              placeholder="Search by member or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-neutral-800 bg-neutral-900/60 pl-9 text-neutral-200 placeholder:text-neutral-600"
            />
          </div>

          {filteredPayments.length === 0 ? (
            <div className="py-12 text-center">
              <Receipt className="mx-auto h-10 w-10 text-neutral-700" />
              <p className="mt-3 text-sm text-neutral-500">
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
                      <p className="text-xs font-medium text-neutral-400">
                        {new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs font-semibold text-amber-400/90">
                        ₹{dayTotal.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      {records.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-xl border border-neutral-800/60 bg-neutral-900/40 px-3.5 py-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-neutral-100">
                              {members[p.admission_id] ?? "Unknown member"}
                            </p>
                            <p className="mt-0.5 text-[10px] capitalize text-neutral-500">
                              {p.method || "cash"}
                            </p>
                          </div>
                          <p className="flex items-center text-sm font-semibold text-emerald-400">
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
