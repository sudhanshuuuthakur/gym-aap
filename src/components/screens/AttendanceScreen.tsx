import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, Search, CalendarDays, Users, UserCheck, UserX } from "lucide-react";
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
  const absentCount = members.length - presentCount;
  const attendancePercent = members.length > 0 ? Math.round((presentCount / members.length) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-600/30 to-teal-700/20 border border-emerald-500/20 p-5">
        <h1 className="text-2xl font-bold text-white">Attendance</h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-emerald-200/70">
          <CalendarDays className="h-4 w-4" />
          <span>{todayDisplay}</span>
        </div>
        {/* Progress bar */}
        {members.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-emerald-200/70">Attendance Rate</span>
              <span className="text-emerald-300 font-bold text-sm">{attendancePercent}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-neutral-800/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${attendancePercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-emerald-500/20 bg-emerald-500/10 shadow-lg shadow-emerald-500/5">
          <CardContent className="p-4 text-center">
            <UserCheck className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-emerald-400">{presentCount}</p>
            <p className="text-[10px] font-medium text-emerald-300/60 uppercase tracking-wider">Present</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 bg-red-500/10 shadow-lg shadow-red-500/5">
          <CardContent className="p-4 text-center">
            <UserX className="h-5 w-5 text-red-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-400">{absentCount}</p>
            <p className="text-[10px] font-medium text-red-300/60 uppercase tracking-wider">Absent</p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-blue-500/10 shadow-lg shadow-blue-500/5">
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 text-blue-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-400">{members.length}</p>
            <p className="text-[10px] font-medium text-blue-300/60 uppercase tracking-wider">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder="Search member..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 border-neutral-700 bg-neutral-800/80 text-neutral-100 placeholder:text-neutral-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
        />
      </div>

      {/* Member list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-neutral-400 text-sm">Loading members...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Users className="h-10 w-10 text-neutral-600" />
          <p className="text-neutral-400 text-sm">
            {members.length === 0 ? "No members yet. Add members first." : "No results found."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((member) => {
            const isPresent = presentIds.has(member.id);
            return (
              <button
                key={member.id}
                onClick={() => toggleAttendance(member.id)}
                className={`w-full flex items-center gap-3 rounded-xl border p-4 transition-all duration-200 active:scale-[0.98] ${
                  isPresent
                    ? "border-emerald-500/40 bg-emerald-500/15 shadow-md shadow-emerald-500/10"
                    : "border-neutral-700/60 bg-neutral-800/50 hover:border-neutral-600 hover:bg-neutral-800/80"
                }`}
              >
                {isPresent ? (
                  <CheckCircle2 className="h-7 w-7 text-emerald-400 shrink-0 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
                ) : (
                  <Circle className="h-7 w-7 text-neutral-500 shrink-0" />
                )}
                <div className="text-left flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isPresent ? "text-emerald-100" : "text-neutral-200"}`}>
                    {member.name}
                  </p>
                  {member.phone && (
                    <p className="text-xs text-neutral-400 mt-0.5">{member.phone}</p>
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all ${
                    isPresent
                      ? "text-emerald-300 bg-emerald-500/25 border border-emerald-500/30"
                      : "text-neutral-400 bg-neutral-700/50 border border-neutral-600/30"
                  }`}
                >
                  {isPresent ? "Present" : "Absent"}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
