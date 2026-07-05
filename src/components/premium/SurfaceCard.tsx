import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const SurfaceCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-[22px] border border-[#E2E8F0] bg-[#FFFFFF] p-6",
        className,
      )}
      {...props}
    />
  ),
);
SurfaceCard.displayName = "SurfaceCard";