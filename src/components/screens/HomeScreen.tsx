import { MembershipStats } from "@/components/MembershipStats";
import { UserPlus, ClipboardCheck, Wallet } from "lucide-react";

interface HomeScreenProps {
  userId: string;
  greeting: string;
  onAddMember?: () => void;
  onAttendance?: () => void;
}

const quickActions = [
  { id: "add-member", label: "Add Member", icon: UserPlus, color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400" },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck, color: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400" },
  { id: "collect-payment", label: "Collect Payment", icon: Wallet, color: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400" },
];

export function HomeScreen({ userId, greeting, onAddMember, onAttendance }: HomeScreenProps) {
  const handleAction = (id: string) => {
    if (id === "add-member" && onAddMember) onAddMember();
    if (id === "attendance" && onAttendance) onAttendance();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-100">
          👋 Hi, {greeting}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Here's how your gym is doing today
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const isWide = action.id === "collect-payment";
          return (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              className={`${isWide ? "col-span-2" : ""} flex flex-col items-center justify-center gap-2 rounded-2xl border bg-gradient-to-br h-28 p-6 transition-transform active:scale-[0.97] ${action.color}`}
            >
              <Icon className="h-8 w-8 shrink-0" />
              <span className="text-sm font-semibold text-neutral-100">{action.label}</span>
            </button>
          );
        })}
      </div>

      <MembershipStats userId={userId} />
    </div>
  );
}
