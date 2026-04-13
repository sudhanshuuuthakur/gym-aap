import { Home, Users, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type Screen = "home" | "members" | "info";

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-6 py-1.5 rounded-lg transition-colors",
                isActive
                  ? "text-primary"
                  : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
