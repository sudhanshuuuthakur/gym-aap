import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dumbbell } from "lucide-react";
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
    <div className="min-h-screen w-full bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-950/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20">
            <Dumbbell className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-neutral-100">Gym Manager</span>
        </div>
      </header>

      {/* Screen Content */}
      <main className="mx-auto max-w-5xl px-6 py-8 pb-24">
        {screen === "home" && (
          <HomeScreen
            key={refreshKey}
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
      </main>

      {/* Bottom Navigation */}
      <BottomNav active={screen} onChange={setScreen} />

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        userId={session.user.id}
        currentDisplayName={displayName}
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
