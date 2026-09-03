import { motion } from "framer-motion";
import { MembershipStats } from "@/components/MembershipStats";
import { ActionCard } from "@/components/premium/ActionCard";
import { SurfaceCard } from "@/components/premium/SurfaceCard";
import { InstallBanner } from "@/components/InstallBanner";
import { UserPlus, ClipboardCheck, Wallet, CalendarClock, ChevronRight } from "lucide-react";

interface HomeScreenProps {
  userId: string;
  greeting: string;
  onAddMember?: () => void;
  onAttendance?: () => void;
  onCollectPayment?: () => void;
  onViewMembers?: (filter: "all" | "paid" | "notpaid") => void;
}

function getGreetingLabel() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "hi ";
  return "Good evening";
}

export function HomeScreen({ userId, greeting, onAddMember, onAttendance, onCollectPayment, onViewMembers }: HomeScreenProps) {
  const salutation = getGreetingLabel();

  return (
    <div className="space-y-7">
      <InstallBanner />

      {/* Welcome */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-[13px] font-medium text-[#94A3B8]">
          {salutation} <span aria-hidden>👋</span>
        </p>
        <h1 className="mt-1 truncate text-[24px] font-bold leading-tight tracking-tight text-[#0F172A]">
          {greeting}
        </h1>
        <p className="mt-1.5 text-[13px] text-[#64748B]">
          Here's today's gym overview.
        </p>
      </motion.section>

      {/* Quick Actions */}
      <section aria-labelledby="quick-actions-title">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="quick-actions-title" className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <ActionCard icon={UserPlus} title="Add Member" subtitle="Register new" onClick={onAddMember} tone="primary" index={0} />
          <ActionCard icon={ClipboardCheck} title="Attendance" subtitle="Check-ins" onClick={onAttendance} tone="accent" index={1} />
          <ActionCard icon={Wallet} title="Collect" subtitle="Payments" onClick={onCollectPayment} tone="warning" index={2} />
        </div>
      </section>

      {/* Membership Overview */}
      <MembershipStats userId={userId} onViewMembers={onViewMembers} />

      {/* Upcoming Reminders */}
      <section aria-labelledby="reminders-title">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="reminders-title" className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
            Upcoming Reminders
          </h2>
        </div>
        <SurfaceCard className="p-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-2xl p-1 text-left transition-colors hover:bg-white/[0.02] active:scale-[0.99]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#22C55E]/12 text-[#22C55E]">
              <CalendarClock className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-[#0F172A]">0 memberships expiring</p>
              <p className="mt-0.5 truncate text-[12px] text-[#94A3B8]">No memberships expire this week.</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#64748B]" />
          </button>
        </SurfaceCard>
      </section>
    </div>
  );
}
