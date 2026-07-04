import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, Search, CalendarDays, Users, UserCheck, UserX, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { SurfaceCard } from "@/components/premium/SurfaceCard";
import { motion } from "framer-motion";

interface Member {
  id: string;
  name: string;
  phone: string | null;
  status: string;
}

interface AttendanceScreenProps {
  userId: string;
  onBack: () => void;
}

export function AttendanceScreen({ userId, onBack }: AttendanceScreenProps) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.06] bg-[#121821] text-[#94A3B8] transition-colors hover:text-white active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-[22px] font-bold tracking-tight text-white">Attendance</h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-[#94A3B8]">
            <CalendarDays className="h-3.5 w-3.5" />
            {todayDisplay}
          </p>
        </div>
      </div>

      {/* Rate */}
      <SurfaceCard className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium text-[#94A3B8]">Attendance Rate</p>
            <p className="mt-1 text-[24px] font-bold leading-none text-white">{attendancePercent}%</p>
          </div>
          <div className="text-right text-[12px] text-[#94A3B8]">
            <p><span className="font-semibold text-white">{presentCount}</span> / {members.length} present</p>
          </div>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${attendancePercent}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full bg-[#22C55E]"
          />
        </div>
      </SurfaceCard>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <SurfaceCard className="p-3.5 text-center">
          <UserCheck className="mx-auto h-4 w-4 text-[#22C55E]" />
          <p className="mt-1.5 text-[18px] font-bold text-white">{presentCount}</p>
          <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Present</p>
        </SurfaceCard>
        <SurfaceCard className="p-3.5 text-center">
          <UserX className="mx-auto h-4 w-4 text-[#EF4444]" />
          <p className="mt-1.5 text-[18px] font-bold text-white">{absentCount}</p>
          <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Absent</p>
        </SurfaceCard>
        <SurfaceCard className="p-3.5 text-center">
          <Users className="mx-auto h-4 w-4 text-[#94A3B8]" />
          <p className="mt-1.5 text-[18px] font-bold text-white">{members.length}</p>
          <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Total</p>
        </SurfaceCard>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
        <Input
          placeholder="Search member..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 rounded-2xl border-white/[0.06] bg-[#121821] pl-9 text-[14px] text-white placeholder:text-[#64748B] focus-visible:ring-[#22C55E]/40"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center text-[13px] text-[#64748B]">Loading members…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12">
          <Users className="h-10 w-10 text-[#1F2937]" />
          <p className="text-[13px] text-[#64748B]">
            {members.length === 0 ? "No members yet." : "No results found."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((member, idx) => {
            const isPresent = presentIds.has(member.id);
            return (
              <motion.button
                key={member.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.2), duration: 0.25 }}
                onClick={() => toggleAttendance(member.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all active:scale-[0.98] ${
                  isPresent
                    ? "border-[#22C55E]/30 bg-[#22C55E]/8"
                    : "border-white/[0.06] bg-[#121821] hover:bg-[#181F2A]"
                }`}
              >
                {isPresent ? (
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-[#22C55E]" />
                ) : (
                  <Circle className="h-6 w-6 shrink-0 text-[#64748B]" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-white">{member.name}</p>
                  {member.phone && (
                    <p className="mt-0.5 text-[12px] text-[#94A3B8]">{member.phone}</p>
                  )}
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                    isPresent
                      ? "border-[#22C55E]/30 bg-[#22C55E]/12 text-[#22C55E]"
                      : "border-white/[0.06] bg-white/[0.03] text-[#94A3B8]"
                  }`}
                >
                  {isPresent ? "Present" : "Absent"}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
