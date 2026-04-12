import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, Users } from "lucide-react";

interface MembershipStatsProps {
  userId: string;
}

export function MembershipStats({ userId }: MembershipStatsProps) {
  const [total, setTotal] = useState(0);
  const [paid, setPaid] = useState(0);
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase
        .from("admissions")
        .select("status")
        .eq("user_id", userId);

      if (data) {
        setTotal(data.length);
        setPaid(data.filter((d) => d.status === "approved").length);
        setPending(data.filter((d) => d.status === "pending").length);
      }
      setLoading(false);
    }
    fetchStats();
  }, [userId]);

  const paidPercent = total > 0 ? Math.round((paid / total) * 100) : 0;
  const pendingPercent = total > 0 ? Math.round((pending / total) * 100) : 0;

  if (loading) {
    return (
      <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
        <CardContent className="py-8 text-center text-neutral-500 text-sm">
          Loading stats...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-neutral-200 text-lg">
          <Users className="h-5 w-5" />
          Membership Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Big number summary */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-4">
            <p className="text-3xl font-bold text-neutral-100">{total}</p>
            <p className="mt-1 text-xs text-neutral-400">Total Members</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-3xl font-bold text-emerald-400">{paid}</p>
            <p className="mt-1 text-xs text-emerald-400/70">Paid ✅</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-3xl font-bold text-amber-400">{pending}</p>
            <p className="mt-1 text-xs text-amber-400/70">Not Paid ⏳</p>
          </div>
        </div>

        {/* Progress bars */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Paid
              </span>
              <span className="font-medium text-neutral-300">
                {paid} of {total} ({paidPercent}%)
              </span>
            </div>
            <Progress
              value={paidPercent}
              className="h-3 bg-neutral-800 [&>div]:bg-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-amber-400">
                <Clock className="h-4 w-4" />
                Still Remaining
              </span>
              <span className="font-medium text-neutral-300">
                {pending} of {total} ({pendingPercent}%)
              </span>
            </div>
            <Progress
              value={pendingPercent}
              className="h-3 bg-neutral-800 [&>div]:bg-amber-500"
            />
          </div>
        </div>

        {/* Simple message */}
        {total === 0 ? (
          <p className="text-center text-sm text-neutral-500 py-2">
            No members yet. Add your first admission below!
          </p>
        ) : (
          <p className="text-center text-sm text-neutral-400 py-2">
            {paid === total
              ? "🎉 Everyone has paid! Great job!"
              : `${pending} member${pending !== 1 ? "s" : ""} still need${pending === 1 ? "s" : ""} to pay`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
