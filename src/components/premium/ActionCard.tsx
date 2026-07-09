import { motion } from "framer-motion";
import { ArrowUpRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  tone?: "primary" | "accent" | "warning";
  index?: number;
}

const toneMap = {
  primary: {
    iconBg: "bg-[#22C55E]/15 text-[#16A34A]",
    arrow: "text-[#22C55E]",
    tint: "bg-gradient-to-br from-[#DCFCE7] via-[#F0FDF4] to-[#FFFFFF]",
  },
  accent: {
    iconBg: "bg-[#3B82F6]/15 text-[#2563EB]",
    arrow: "text-[#3B82F6]",
    tint: "bg-gradient-to-br from-[#DBEAFE] via-[#EFF6FF] to-[#FFFFFF]",
  },
  warning: {
    iconBg: "bg-[#F59E0B]/15 text-[#D97706]",
    arrow: "text-[#F59E0B]",
    tint: "bg-gradient-to-br from-[#FEF3C7] via-[#FFFBEB] to-[#FFFFFF]",
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
        "group relative flex h-full min-h-[148px] w-full flex-col items-start justify-start gap-3 overflow-hidden rounded-[22px] border border-[#E2E8F0] bg-[#FFFFFF] p-4 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] transition-all hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_16px_32px_-12px_rgba(15,23,42,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/50",
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
            <p className="text-[12px] font-semibold leading-tight text-[#0F172A] whitespace-nowrap">{title}</p>
            {subtitle && <p className="mt-0.5 text-[11px] leading-tight text-[#94A3B8] break-words">{subtitle}</p>}
          </div>
          <ArrowUpRight className={cn("h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5", t.arrow)} />
        </div>
      </div>
    </motion.button>
  );
}