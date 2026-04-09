import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Calendar, Activity, TrendingUp } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

interface DashboardProps {
  session: Session;
}

export function Dashboard({ session }: DashboardProps) {
  const [displayName, setDisplayName] = useState<string | null>(null);

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

  const phone = session.user.user_metadata?.phone || "User";
  const greeting = displayName || phone;
  const joinDate = new Date(session.user.created_at).toLocaleDateString();

  const stats = [
    { label: "Status", value: "Active", icon: Activity, color: "text-emerald-400" },
    { label: "Joined", value: joinDate, icon: Calendar, color: "text-blue-400" },
    { label: "Sessions", value: "1", icon: TrendingUp, color: "text-amber-400" },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-950/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-neutral-200">{greeting}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-neutral-400 hover:text-neutral-100"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-100 to-neutral-400">
            Welcome, {greeting}
          </h1>
          <p className="mt-1 text-neutral-500">Here's your dashboard overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-neutral-400">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-neutral-100">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-neutral-200">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
              Edit Profile
            </Button>
            <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
              Settings
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
