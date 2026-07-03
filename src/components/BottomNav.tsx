import { Home, Users, Info } from "lucide-react";
import { motion } from "framer-motion";
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
    <nav
      className="fixed inset-x-0 bottom-0 z-50 pointer-events-none"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
    >
      <div className="pointer-events-auto mx-auto flex max-w-md items-center justify-between gap-1 rounded-full border border-white/[0.06] bg-[#121821]/95 px-2 py-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl mx-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              aria-label={tab.label}
              className={cn(
                "relative flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/50",
                isActive ? "text-white" : "text-[#94A3B8] hover:text-white",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-[#22C55E]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
                {isActive && <span>{tab.label}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
