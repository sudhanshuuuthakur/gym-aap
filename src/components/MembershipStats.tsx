import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, Users, ChevronDown, ChevronUp } from "lucide-react";

interface Member {
  id: string;
  name: string;
  status: string;
}

interface MembershipStatsProps {
  userId: string;
}

export function MembershipStats({ userId }: MembershipStatsProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<"all" | "paid" | "notpaid" | null>(null);

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase
        .from("admissions")
        .select("id, name, status")
        .eq("user_id", userId)
        .order("name");

      if (data) setMembers(data);
      setLoading(false);
    }
    fetchStats();
  }, [userId]);

  const total = members.length;
  const paidMembers = members.filter((m) => m.status === "approved");
  const pendingMembers = members.filter((m) => m.status === "pending");
  const paid = paidMembers.length;
  const pending = pendingMembers.length;
  const paidPercent = total > 0 ? Math.round((paid / total) * 100) : 0;
  const pendingPercent = total > 0 ? Math.round((pending / total) * 100) : 0;

  const toggle = (section: "all" | "paid" | "notpaid") => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const MemberList = ({ list, showDot }: { list: Member[]; showDot?: boolean }) => (
    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
      {list.map((m) => (
        <div key={m.id} className="flex items-center gap-2 rounded-lg bg-neutral-800/50 px-3 py-2 text-sm text-neutral-200">
          {(showDot ?? true) && (
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${m.status === "approved" ? "bg-emerald-400" : "bg-red-400"}`} />
          )}
          {m.name}
        </div>
      ))}
      {list.length === 0 && (
        <p className="text-xs text-neutral-500 text-center py-2">No members</p>
      )}
    </div>
  );

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
        {/* Big number summary - clickable */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <button
              onClick={() => toggle("all")}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-800/30 p-4 transition-colors hover:bg-neutral-800/60"
            >
              <p className="text-3xl font-bold text-neutral-100">{total}</p>
              <p className="mt-1 text-xs text-neutral-400 flex items-center justify-center gap-1">
                Total Members
                {expandedSection === "all" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </p>
            </button>
            {expandedSection === "all" && <MemberList list={members} />}
          </div>
          <div>
            <button
              onClick={() => toggle("paid")}
              className="w-full rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition-colors hover:bg-emerald-500/10"
            >
              <p className="text-3xl font-bold text-emerald-400">{paid}</p>
              <p className="mt-1 text-xs text-emerald-400/70 flex items-center justify-center gap-1">
                Paid ✅
                {expandedSection === "paid" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </p>
            </button>
            {expandedSection === "paid" && <MemberList list={paidMembers} showDot={false} />}
          </div>
          <div>
            <button
              onClick={() => toggle("notpaid")}
              className="w-full rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 transition-colors hover:bg-amber-500/10"
            >
              <p className="text-3xl font-bold text-amber-400">{pending}</p>
              <p className="mt-1 text-xs text-amber-400/70 flex items-center justify-center gap-1">
                Not Paid ⏳
                {expandedSection === "notpaid" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </p>
            </button>
            {expandedSection === "notpaid" && <MemberList list={pendingMembers} showDot={false} />}
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
