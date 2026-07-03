import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const SurfaceCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-[22px] border border-white/[0.06] bg-[#121821] p-6",
        className,
      )}
      {...props}
    />
  ),
);
SurfaceCard.displayName = "SurfaceCard";