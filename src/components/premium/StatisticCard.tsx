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
  neutral: { iconBg: "bg-secondary text-foreground", value: "text-foreground" },
  primary: { iconBg: "bg-primary/10 text-primary", value: "text-primary" },
  warning: { iconBg: "bg-warning/10 text-warning", value: "text-warning" },
};

export function StatisticCard({ label, value, icon: Icon, tone = "neutral", onClick }: StatisticCardProps) {
  const t = toneMap[tone];
  const Comp: any = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-3 rounded-xl border border-border/70 bg-surface p-4 text-left transition-colors",
        onClick && "hover:border-primary/40 hover:bg-surface-2 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
      )}
    >
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-full", t.iconBg)}>
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div>
        <p className={cn("text-[26px] font-bold leading-none tracking-tight", t.value)}>{value}</p>
        <p className="mt-1.5 text-[12px] font-medium text-muted-foreground">{label}</p>
      </div>
    </Comp>
  );
}