import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Dumbbell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface InfoScreenProps {
  greeting: string;
  onEditProfile: () => void;
}

export function InfoScreen({ greeting, onEditProfile }: InfoScreenProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-100">Info</h1>

      <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neutral-200">
            <Dumbbell className="h-5 w-5" /> Gym Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-neutral-400">Logged in as</p>
            <p className="text-neutral-100 font-medium">{greeting}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="justify-start border-neutral-700 text-neutral-300 hover:text-neutral-100"
              onClick={onEditProfile}
            >
              <Settings className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
            <Button
              variant="outline"
              className="justify-start border-neutral-700 text-red-400 hover:text-red-300 hover:border-red-500/50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
