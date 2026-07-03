import { SurfaceCard } from "@/components/premium/SurfaceCard";
import { LogOut, Settings, User, ChevronRight } from "lucide-react";
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
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-white">Info</h1>
        <p className="mt-1 text-[13px] text-[#64748B]">Account and preferences</p>
      </div>

      <SurfaceCard className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#22C55E]/12 text-[#22C55E]">
            <User className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-white">{greeting}</p>
            <p className="text-[12px] text-[#94A3B8]">Signed in</p>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-2">
        <button
          onClick={onEditProfile}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-white/[0.03] active:scale-[0.99]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-white">
            <Settings className="h-4 w-4" strokeWidth={2} />
          </div>
          <span className="flex-1 text-[14px] font-medium text-white">Edit Profile</span>
          <ChevronRight className="h-4 w-4 text-[#64748B]" />
        </button>
        <div className="mx-3 h-px bg-white/[0.06]" />
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-white/[0.03] active:scale-[0.99]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EF4444]/12 text-[#EF4444]">
            <LogOut className="h-4 w-4" strokeWidth={2} />
          </div>
          <span className="flex-1 text-[14px] font-medium text-[#EF4444]">Log Out</span>
          <ChevronRight className="h-4 w-4 text-[#64748B]" />
        </button>
      </SurfaceCard>
    </div>
  );
}
