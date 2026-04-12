import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Dumbbell, Settings } from "lucide-react";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { AdmissionsList } from "@/components/AdmissionsList";
import { MembershipStats } from "@/components/MembershipStats";
import type { Session } from "@supabase/supabase-js";

interface DashboardProps {
  session: Session;
}

export function Dashboard({ session }: DashboardProps) {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const phone = session.user.user_metadata?.phone || "Owner";
  const greeting = displayName || phone;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-950/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20">
              <Dumbbell className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <span className="text-sm font-semibold text-neutral-100">Gym Manager</span>
              <p className="text-xs text-neutral-500">{greeting}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="text-neutral-400 hover:text-neutral-100"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-neutral-400 hover:text-neutral-100"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-100">
            👋 Hi, {greeting}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Here's how your gym is doing today
          </p>
        </div>

        {/* Membership Overview — TOP PRIORITY */}
        <MembershipStats userId={session.user.id} />

        {/* Members List */}
        <AdmissionsList userId={session.user.id} />
      </main>

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        userId={session.user.id}
        currentDisplayName={displayName}
        onSaved={(name) => setDisplayName(name)}
      />
    </div>
  );
}
