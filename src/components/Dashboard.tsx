import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
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
import { GymSwitcher, type GymOption } from "@/components/GymSwitcher";
import { ActiveGymProvider } from "@/lib/activeGym";
import { DEFAULT_GYM_NAME, getActiveGymStorageKey } from "@/lib/gyms";
import { toast } from "sonner";

interface DashboardProps {
  session: Session;
}

export function Dashboard({ session }: DashboardProps) {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [profilePhone, setProfilePhone] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [defaultFee, setDefaultFee] = useState<number>(500);
  const [editOpen, setEditOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [memberFilter, setMemberFilter] = useState<"all" | "paid" | "notpaid">("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [gyms, setGyms] = useState<GymOption[]>([]);
  const [activeGymId, setActiveGymId] = useState<string | null>(null);
  const [gymsLoading, setGymsLoading] = useState(true);

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
    let cancelled = false;
    const loadGyms = async () => {
      setGymsLoading(true);
      const { data, error } = await supabase
        .from("gyms")
        .select("id, name")
        .eq("owner_id", session.user.id)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (error) {
        toast.error("Could not load your gyms");
        setGymsLoading(false);
        return;
      }
      let availableGyms = data ?? [];
      if (availableGyms.length === 0) {
        const { data: created, error: createError } = await supabase
          .from("gyms")
          .insert({ owner_id: session.user.id, name: DEFAULT_GYM_NAME })
          .select("id, name")
          .single();
        if (cancelled) return;
        if (created) availableGyms = [created];
        else if (createError) {
          const { data: retried } = await supabase
            .from("gyms")
            .select("id, name")
            .eq("owner_id", session.user.id)
            .order("created_at", { ascending: true });
          availableGyms = retried ?? [];
        }
      }
      setGyms(availableGyms);
      if (availableGyms.length) {
        const storedId = window.localStorage.getItem(getActiveGymStorageKey(session.user.id));
        const selected = availableGyms.find((gym) => gym.id === storedId) ?? availableGyms[0];
        setActiveGymId(selected.id);
        window.localStorage.setItem(getActiveGymStorageKey(session.user.id), selected.id);
      }
      setGymsLoading(false);
    };
    void loadGyms();
    supabase
      .from("profiles")
      .select("display_name, phone, avatar_url")
      .eq("user_id", session.user.id)
      .single()
      .then(({ data }) => {
        if (cancelled) return;
        if (!data) return;
        setDisplayName(data.display_name);
        setProfilePhone(data.phone);
        setAvatarPath(data.avatar_url);
      });
    return () => { cancelled = true; };
  }, [session.user.id]);

  const selectGym = (gymId: string) => {
    setActiveGymId(gymId);
    window.localStorage.setItem(getActiveGymStorageKey(session.user.id), gymId);
    setScreen("home");
    window.history.replaceState({ screen: "home" }, "");
    setRefreshKey((key) => key + 1);
  };

  const createGym = async (name: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("gyms")
      .insert({ owner_id: session.user.id, name })
      .select("id, name")
      .single();
    if (error || !data) {
      toast.error("Could not create gym. Please try again.");
      return false;
    }
    setGyms((current) => [...current, data]);
    selectGym(data.id);
    toast.success(`${data.name} created`);
    return true;
  };

  const phone = session.user.user_metadata?.phone || "Owner";
  const greeting = displayName || phone;

  return (
    <ActiveGymProvider value={activeGymId}>
    <div className="relative min-h-[100dvh] w-full bg-background text-foreground transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 pt-5 pb-4 sm:px-6">
          {!gymsLoading && activeGymId && <GymSwitcher gyms={gyms} activeGymId={activeGymId} onSelect={selectGym} onCreate={createGym} />}
          <div className="flex items-center gap-2">
            <HeaderInstallButton />
            <button
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground active:scale-95"
            >
              <Bell className="h-4 w-4" strokeWidth={2} />
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
            </button>
          </div>
        </div>
      </header>

      {/* Screen Content */}
      <main className="relative mx-auto max-w-5xl px-6 pt-6 pb-32">
        {gymsLoading || !activeGymId ? <div className="py-12 text-center text-sm text-muted-foreground">Loading your gym…</div> : (
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
                gymId={activeGymId}
                greeting={greeting}
                onAddMember={() => setAddMemberOpen(true)}
                onAttendance={() => navigateTo("attendance")}
                onCollectPayment={() => navigateTo("collect-payment")}
                onViewMembers={(filter) => { setMemberFilter(filter); navigateTo("member-list"); }}
              />
            )}
            {screen === "member-list" && (
              <MemberListScreen userId={session.user.id} gymId={activeGymId} gymName={gyms.find((gym) => gym.id === activeGymId)?.name || DEFAULT_GYM_NAME} filter={memberFilter} onBack={() => window.history.back()} />
            )}
            {screen === "attendance" && <AttendanceScreen userId={session.user.id} gymId={activeGymId} onBack={() => window.history.back()} />}
            {screen === "collect-payment" && <CollectPaymentScreen userId={session.user.id} gymId={activeGymId} onBack={() => window.history.back()} />}
            {screen === "members" && <MembersScreen userId={session.user.id} gymId={activeGymId} gymName={gyms.find((gym) => gym.id === activeGymId)?.name || DEFAULT_GYM_NAME} />}
            {screen === "info" && <InfoScreen greeting={greeting} onEditProfile={() => setEditOpen(true)} />}
          </motion.div>
        </AnimatePresence>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav active={screen} onChange={navigateTo} />

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        userId={session.user.id}
        currentDisplayName={displayName}
        currentPhone={profilePhone || phone}
        currentAvatarPath={avatarPath}
        currentDefaultFee={defaultFee}
        onSaved={(name, nextPhone, nextAvatarPath, nextAvatarUrl) => {
          setDisplayName(name);
          setProfilePhone(nextPhone);
          setAvatarPath(nextAvatarPath);
        }}
      />

      <AddAdmissionDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        userId={session.user.id}
        gymId={activeGymId ?? ""}
        onAdded={() => setRefreshKey((k) => k + 1)}
      />
    </div>
    </ActiveGymProvider>
  );
}
