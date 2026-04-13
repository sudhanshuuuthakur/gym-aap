import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, Search, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Member {
  id: string;
  name: string;
  phone: string | null;
  status: string;
}

interface AttendanceScreenProps {
  userId: string;
}

export function AttendanceScreen({ userId }: AttendanceScreenProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [presentIds, setPresentIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const today = format(new Date(), "yyyy-MM-dd");
  const todayDisplay = format(new Date(), "EEEE, dd MMM yyyy");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [membersRes, attendanceRes] = await Promise.all([
      supabase
        .from("admissions")
        .select("id, name, phone, status")
        .eq("user_id", userId)
        .order("name"),
      supabase
        .from("attendance")
        .select("admission_id")
        .eq("user_id", userId)
        .eq("check_in_date", today),
    ]);

    if (membersRes.data) setMembers(membersRes.data);
    if (attendanceRes.data) {
      setPresentIds(new Set(attendanceRes.data.map((a) => a.admission_id)));
    }
    setLoading(false);
  }, [userId, today]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleAttendance = async (memberId: string) => {
    const isPresent = presentIds.has(memberId);

    if (isPresent) {
      const { error } = await supabase
        .from("attendance")
        .delete()
        .eq("admission_id", memberId)
        .eq("check_in_date", today)
        .eq("user_id", userId);
      if (error) {
        toast.error("Failed to remove attendance");
        return;
      }
      setPresentIds((prev) => {
        const next = new Set(prev);
        next.delete(memberId);
        return next;
      });
    } else {
      const { error } = await supabase.from("attendance").insert({
        user_id: userId,
        admission_id: memberId,
        check_in_date: today,
      });
      if (error) {
        toast.error("Failed to mark attendance");
        return;
      }
      setPresentIds((prev) => new Set(prev).add(memberId));
    }
  };

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = presentIds.size;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-100">Attendance</h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
          <CalendarDays className="h-4 w-4" />
          <span>{todayDisplay}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-neutral-800 bg-neutral-900/60">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{presentCount}</p>
            <p className="text-xs text-neutral-500">Present Today</p>
          </CardContent>
        </Card>
        <Card className="border-neutral-800 bg-neutral-900/60">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-neutral-300">{members.length - presentCount}</p>
            <p className="text-xs text-neutral-500">Absent</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <Input
          placeholder="Search member..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 border-neutral-800 bg-neutral-900/60 text-neutral-100 placeholder:text-neutral-600"
        />
      </div>

      {/* Member list */}
      {loading ? (
        <p className="text-center text-neutral-500 text-sm py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-neutral-500 text-sm py-8">
          {members.length === 0 ? "No members yet. Add members first." : "No results found."}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((member) => {
            const isPresent = presentIds.has(member.id);
            return (
              <button
                key={member.id}
                onClick={() => toggleAttendance(member.id)}
                className={`w-full flex items-center gap-3 rounded-xl border p-4 transition-all active:scale-[0.98] ${
                  isPresent
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-neutral-800 bg-neutral-900/60"
                }`}
              >
                {isPresent ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="h-6 w-6 text-neutral-600 shrink-0" />
                )}
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-100 truncate">{member.name}</p>
                  {member.phone && (
                    <p className="text-xs text-neutral-500">{member.phone}</p>
                  )}
                </div>
                {isPresent && (
                  <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    Present
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
