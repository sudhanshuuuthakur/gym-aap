import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatisticCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "neutral" | "primary" | "warning";
  onClick?: () => void;
}

const toneMap = {
  neutral: { iconBg: "bg-[#F1F5F9] text-[#0F172A]", value: "text-[#0F172A]" },
  primary: { iconBg: "bg-[#22C55E]/12 text-[#22C55E]", value: "text-[#22C55E]" },
  warning: { iconBg: "bg-[#F59E0B]/12 text-[#F59E0B]", value: "text-[#F59E0B]" },
};

export function StatisticCard({ label, value, icon: Icon, tone = "neutral", onClick }: StatisticCardProps) {
  const t = toneMap[tone];
  const Comp: any = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-3 rounded-2xl p-4 text-left transition-colors",
        onClick && "hover:bg-white/[0.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/50",
      )}
    >
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-full", t.iconBg)}>
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div>
        <p className={cn("text-[26px] font-bold leading-none tracking-tight", t.value)}>{value}</p>
        <p className="mt-1.5 text-[12px] font-medium text-[#94A3B8]">{label}</p>
      </div>
    </Comp>
  );
}