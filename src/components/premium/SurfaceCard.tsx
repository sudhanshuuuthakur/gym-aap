import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const SurfaceCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-[22px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]",
        className,
      )}
      {...props}
    />
  ),
);
SurfaceCard.displayName = "SurfaceCard";