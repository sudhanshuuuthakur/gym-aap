import { useState } from "react";
import { Download } from "lucide-react";
import { useInstallApp } from "@/hooks/useInstallApp";
import { InstallAppDialog } from "@/components/InstallAppDialog";

/**
 * Persistent header install entry point. Stays visible (never dismissible)
 * for as long as the browser reports the app can be installed.
 */
export function HeaderInstallButton() {
  const { canInstall, installed, inPreviewFrame } = useInstallApp();
  const [open, setOpen] = useState(false);

  if (installed || inPreviewFrame || !canInstall) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Install Gym Manager app"
        className="flex h-10 items-center gap-1.5 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 px-3 text-[13px] font-semibold text-[#16A34A] transition-colors hover:bg-[#22C55E]/16 active:scale-95"
      >
        <Download className="h-4 w-4" strokeWidth={2.25} />
        <span className="hidden sm:inline">Install app</span>
        <span className="sm:hidden">Install</span>
      </button>
      <InstallAppDialog open={open} onOpenChange={setOpen} />
    </>
  );
}