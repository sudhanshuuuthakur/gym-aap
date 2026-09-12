import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Bell, ChevronDown, UserRound } from "lucide-react";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { AddAdmissionDialog } from "@/components/AddAdmissionDialog";
import { BottomNav, type Screen } from "@/components/BottomNav";
import { HeaderInstallButton } from "@/components/HeaderInstallButton";
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

  // Keep browser/system back in sync with in-app screens
  useEffect(() => {
    window.history.replaceState({ screen: "home" }, "");
    const onPopState = (e: PopStateEvent) => {
      const target = (e.state?.screen as Screen) || "home";
      setScreen(target);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigateTo = (next: Screen) => {
    if (next !== screen) {
      window.history.pushState({ screen: next }, "");
    }
    setScreen(next);
  };

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
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            aria-label="Open profile"
            className="group flex min-w-0 items-center gap-2.5 rounded-full py-1 pr-2 text-left transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#22C55E]/12 text-[#22C55E] ring-1 ring-[#22C55E]/20">
              <UserRound className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-medium text-[#94A3B8]">Profile</span>
              <span className="block max-w-[145px] truncate text-[14px] font-semibold text-[#0F172A]">{greeting}</span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#94A3B8] transition-transform group-hover:translate-y-0.5" strokeWidth={2} />
          </button>
          <div className="flex items-center gap-2">
            <HeaderInstallButton />
            <button
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#FFFFFF] text-[#94A3B8] transition-colors hover:text-[#0F172A] active:scale-95"
            >
              <Bell className="h-4 w-4" strokeWidth={2} />
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
            </button>
          </div>
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
                onAttendance={() => navigateTo("attendance")}
                onCollectPayment={() => navigateTo("collect-payment")}
                onViewMembers={(filter) => { setMemberFilter(filter); navigateTo("member-list"); }}
              />
            )}
            {screen === "member-list" && (
              <MemberListScreen userId={session.user.id} filter={memberFilter} onBack={() => window.history.back()} />
            )}
            {screen === "attendance" && <AttendanceScreen userId={session.user.id} onBack={() => window.history.back()} />}
            {screen === "collect-payment" && <CollectPaymentScreen userId={session.user.id} onBack={() => window.history.back()} />}
            {screen === "members" && <MembersScreen userId={session.user.id} />}
            {screen === "info" && <InfoScreen greeting={greeting} onEditProfile={() => setEditOpen(true)} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <BottomNav active={screen} onChange={navigateTo} />

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
