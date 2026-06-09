import { Home, Users, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type Screen = "home" | "members" | "info" | "attendance" | "member-list" | "collect-payment";

interface BottomNavProps {
  active: Screen;
  onChange: (screen: Screen) => void;
}

const tabs: { id: Screen; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "members", label: "Members", icon: Users },
  { id: "info", label: "Info", icon: Info },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-700/60 bg-neutral-900/95 backdrop-blur-lg shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <div className="mx-auto flex max-w-5xl items-center justify-around py-2.5 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200",
                isActive
                  ? "text-emerald-400 bg-emerald-500/10 shadow-sm shadow-emerald-500/10"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
              )}
            >
              <Icon className={cn("h-5.5 w-5.5", isActive && "drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]")} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("text-[11px] font-semibold tracking-wide", isActive && "text-emerald-300")}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
