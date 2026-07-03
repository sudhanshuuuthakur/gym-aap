import { motion } from "framer-motion";
import { ArrowUpRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
    iconBg: "bg-[#22C55E]/12 text-[#22C55E]",
    arrow: "text-[#22C55E]",
    tint: "bg-gradient-to-b from-[#22C55E]/[0.06] to-transparent",
  },
  accent: {
    iconBg: "bg-[#3B82F6]/12 text-[#3B82F6]",
    arrow: "text-[#3B82F6]",
    tint: "bg-gradient-to-b from-[#3B82F6]/[0.06] to-transparent",
  },
  warning: {
    iconBg: "bg-[#F59E0B]/12 text-[#F59E0B]",
    arrow: "text-[#F59E0B]",
    tint: "bg-gradient-to-b from-[#F59E0B]/[0.06] to-transparent",
  },
};

export function ActionCard({ icon: Icon, title, subtitle, onClick, tone = "primary", index = 0 }: ActionCardProps) {
  const t = toneMap[tone];
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative flex h-full min-h-[148px] w-full flex-col items-start justify-between overflow-hidden rounded-[22px] border border-white/[0.06] bg-[#121821] p-5 text-left transition-colors hover:bg-[#151C27] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/50",
      )}
      aria-label={title}
    >
      <div className={cn("pointer-events-none absolute inset-0", t.tint)} aria-hidden />
      <div className={cn("relative flex h-11 w-11 items-center justify-center rounded-full", t.iconBg)}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="relative w-full">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-white">{title}</p>
            <p className="mt-0.5 truncate text-[12px] text-[#94A3B8]">{subtitle}</p>
          </div>
          <ArrowUpRight className={cn("h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5", t.arrow)} />
        </div>
      </div>
    </motion.button>
  );
}