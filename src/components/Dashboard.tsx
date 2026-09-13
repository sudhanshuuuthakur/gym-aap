import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Bell, UserRound } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardProps {
  session: Session;
}

export function Dashboard({ session }: DashboardProps) {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [profilePhone, setProfilePhone] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
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
      .select("display_name, phone, avatar_url")
      .eq("user_id", session.user.id)
      .single()
      .then(async ({ data }) => {
        if (!data) return;
        setDisplayName(data.display_name);
        setProfilePhone(data.phone);
        setAvatarPath(data.avatar_url);
        if (data.avatar_url) {
          const { data: signedAvatar } = await supabase.storage.from("avatars").createSignedUrl(data.avatar_url, 3600);
          setAvatarUrl(signedAvatar?.signedUrl || null);
        }
      });
  }, [session.user.id]);

  const phone = session.user.user_metadata?.phone || "Owner";
  const greeting = displayName || phone;

  return (
    <div className="relative min-h-[100dvh] w-full bg-background text-foreground transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 pt-5 pb-4">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            aria-label="Open profile"
            className="flex h-11 w-11 items-center justify-center rounded-full p-0 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={avatarUrl || undefined} alt="Profile photo" />
              <AvatarFallback className="bg-primary/10 text-primary">
                {displayName?.trim().charAt(0).toUpperCase() || <UserRound className="h-[18px] w-[18px]" strokeWidth={2.2} />}
              </AvatarFallback>
            </Avatar>
          </button>
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
        currentPhone={profilePhone || phone}
        currentAvatarPath={avatarPath}
        currentDefaultFee={defaultFee}
        onSaved={(name, nextPhone, nextAvatarPath, nextAvatarUrl) => {
          setDisplayName(name);
          setProfilePhone(nextPhone);
          setAvatarPath(nextAvatarPath);
          setAvatarUrl(nextAvatarUrl);
        }}
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
