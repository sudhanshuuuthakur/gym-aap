import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Dumbbell } from "lucide-react";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { AddAdmissionDialog } from "@/components/AddAdmissionDialog";
import { BottomNav, type Screen } from "@/components/BottomNav";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { MembersScreen } from "@/components/screens/MembersScreen";
import { InfoScreen } from "@/components/screens/InfoScreen";
import { AttendanceScreen } from "@/components/screens/AttendanceScreen";
import { MemberListScreen } from "@/components/screens/MemberListScreen";
import { CollectPaymentScreen } from "@/components/screens/CollectPaymentScreen";
import type { Session } from "@supabase/supabase-js";

interface DashboardProps {
  session: Session;
}

export function Dashboard({ session }: DashboardProps) {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [defaultFee, setDefaultFee] = useState<number>(500);
  const [editOpen, setEditOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [memberFilter, setMemberFilter] = useState<"all" | "paid" | "notpaid">("all");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("display_name, phone")
      .eq("user_id", session.user.id)
      .single()
      .then(({ data }) => {
        if (data?.display_name) setDisplayName(data.display_name);
      });
  }, [session.user.id]);

  const phone = session.user.user_metadata?.phone || "Owner";
  const greeting = displayName || phone;

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#FFFFFF] text-[#0F172A]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-[#FFFFFF]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#22C55E]/12">
              <Dumbbell className="h-4 w-4 text-[#22C55E]" strokeWidth={2.25} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-[#0F172A]">Gym Manager</span>
          </div>
          <button
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#FFFFFF] text-[#94A3B8] transition-colors hover:text-[#0F172A] active:scale-95"
          >
            <Bell className="h-4 w-4" strokeWidth={2} />
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
          </button>
        </div>
      </header>

      {/* Screen Content */}
      <main className="relative mx-auto max-w-5xl px-6 pt-6 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen + "-" + refreshKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {screen === "home" && (
              <HomeScreen
                userId={session.user.id}
                greeting={greeting}
                onAddMember={() => setAddMemberOpen(true)}
                onAttendance={() => setScreen("attendance")}
                onCollectPayment={() => setScreen("collect-payment")}
                onViewMembers={(filter) => { setMemberFilter(filter); setScreen("member-list"); }}
              />
            )}
            {screen === "member-list" && (
              <MemberListScreen userId={session.user.id} filter={memberFilter} onBack={() => setScreen("home")} />
            )}
            {screen === "attendance" && <AttendanceScreen userId={session.user.id} onBack={() => setScreen("home")} />}
            {screen === "collect-payment" && <CollectPaymentScreen userId={session.user.id} onBack={() => setScreen("home")} />}
            {screen === "members" && <MembersScreen userId={session.user.id} />}
            {screen === "info" && <InfoScreen greeting={greeting} onEditProfile={() => setEditOpen(true)} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <BottomNav active={screen} onChange={setScreen} />

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        userId={session.user.id}
        currentDisplayName={displayName}
        currentDefaultFee={defaultFee}
        onSaved={(name) => setDisplayName(name)}
      />

      <AddAdmissionDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        userId={session.user.id}
        onAdded={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
