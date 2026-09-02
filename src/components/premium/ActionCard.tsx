import { motion } from "framer-motion";
import { ArrowUpRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick?: () => void;
  tone?: "primary" | "accent" | "warning";
  index?: number;
}

const toneMap = {
  primary: {
    iconBg: "bg-primary/10 text-primary",
    arrow: "text-primary",
    tint: "bg-primary/[0.04]",
  },
  accent: {
    iconBg: "bg-accent/10 text-accent",
    arrow: "text-accent",
    tint: "bg-accent/[0.04]",
  },
  warning: {
    iconBg: "bg-warning/10 text-warning",
    arrow: "text-warning",
    tint: "bg-warning/[0.04]",
  },
};

export function ActionCard({ icon: Icon, title, subtitle, onClick, tone = "primary", index = 0 }: ActionCardProps) {
  const t = toneMap[tone];
  return (
    <motion(Button)
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative flex h-full min-h-[142px] w-full flex-col items-start justify-between overflow-hidden rounded-xl border border-border bg-card p-4 text-left shadow-[0_12px_36px_hsl(var(--background)/0.35)] transition-all hover:border-primary/40 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
      )}
      aria-label={title}
    >
      <div className={cn("pointer-events-none absolute inset-0", t.tint)} aria-hidden />
      <div className={cn("relative flex h-11 w-11 items-center justify-center rounded-full", t.iconBg)}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="relative w-full">
        <div className="flex items-end justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold leading-tight text-foreground">{title}</p>
            <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground break-words">{subtitle}</p>
          </div>
          <ArrowUpRight className={cn("h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5", t.arrow)} />
        </div>
      </div>
    </motion.button>
  );
}