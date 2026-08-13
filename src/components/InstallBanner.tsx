import { useState } from "react";
import { motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { useInstallApp } from "@/hooks/useInstallApp";
import { InstallAppDialog } from "@/components/InstallAppDialog";

const DISMISS_KEY = "gm_install_banner_dismissed";

export function InstallBanner() {
  const { canInstall, installed, inPreviewFrame } = useInstallApp();
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY) === "1",
  );
  const [open, setOpen] = useState(false);

  if (installed || dismissed || inPreviewFrame || !canInstall) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-sm"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#22C55E]/12 text-[#22C55E]">
            <Download className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <span className="min-w-0">
            <span className="block text-[14px] font-semibold text-[#0F172A]">
              Add Gym Manager to your home screen
            </span>
            <span className="mt-0.5 block truncate text-[12px] text-[#64748B]">
              Opens full screen, just like an app.
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install banner"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
      <InstallAppDialog open={open} onOpenChange={setOpen} />
    </>
  );
}