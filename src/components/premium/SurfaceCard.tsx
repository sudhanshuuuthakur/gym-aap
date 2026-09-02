import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const SurfaceCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-[0_12px_36px_hsl(var(--background)/0.35)]",
        className,
      )}
      {...props}
    />
  ),
);
SurfaceCard.displayName = "SurfaceCard";