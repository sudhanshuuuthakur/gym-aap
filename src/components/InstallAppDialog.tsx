import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share, MoreVertical, ExternalLink, Check } from "lucide-react";
import { useInstallApp } from "@/hooks/useInstallApp";
import { toast } from "sonner";

interface InstallAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstallAppDialog({ open, onOpenChange }: InstallAppDialogProps) {
  const { canInstall, installed, install, isIos, inPreviewFrame } = useInstallApp();

  const handleInstall = async () => {
    const outcome = await install();
    if (outcome === "accepted") {
      toast.success("Gym Manager is being added to your home screen");
      onOpenChange(false);
    } else if (outcome === "dismissed") {
      toast.info("Installation cancelled");
    }
  };

  const steps = isIos
    ? [
        { icon: <Share className="h-4 w-4" strokeWidth={2} />, text: "Tap the Share button in Safari" },
        { icon: <Download className="h-4 w-4" strokeWidth={2} />, text: 'Choose "Add to Home Screen"' },
        { icon: <Check className="h-4 w-4" strokeWidth={2} />, text: 'Tap "Add" — the icon appears on your home screen' },
      ]
    : [
        { icon: <MoreVertical className="h-4 w-4" strokeWidth={2} />, text: "Open your browser menu (⋮)" },
        { icon: <Download className="h-4 w-4" strokeWidth={2} />, text: 'Tap "Install app" or "Add to Home screen"' },
        { icon: <Check className="h-4 w-4" strokeWidth={2} />, text: "Confirm — Gym Manager opens like a real app" },
      ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl border-[#E2E8F0] bg-white p-6">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#22C55E]/12 text-[#22C55E]">
            <Download className="h-6 w-6" strokeWidth={2.25} />
          </div>
          <DialogTitle className="text-[18px] font-bold text-[#0F172A]">
            {installed ? "App already installed" : "Install Gym Manager"}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#64748B]">
            {installed
              ? "You're already running the installed app."
              : "Run Gym Manager full screen from your home screen — no browser bar."}
          </DialogDescription>
        </DialogHeader>

        {!installed && (
          <div className="space-y-4">
            {canInstall ? (
              <Button
                onClick={handleInstall}
                className="h-11 w-full rounded-full bg-[#22C55E] font-semibold text-white hover:bg-[#22C55E]/90"
              >
                Install now
              </Button>
            ) : (
              <div className="space-y-3 rounded-2xl bg-[#F8FAFC] p-4">
                {inPreviewFrame && (
                  <p className="text-[12px] font-medium text-[#0F172A]">
                    Installing isn't possible inside this preview window. Open the app in your
                    browser first:
                  </p>
                )}
                {steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-[1px] flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#22C55E] shadow-sm">
                      {step.icon}
                    </div>
                    <p className="text-[13px] leading-5 text-[#334155]">
                      <span className="font-semibold text-[#0F172A]">{i + 1}. </span>
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {inPreviewFrame && (
              <Button
                variant="outline"
                onClick={() => window.open(window.location.href, "_blank", "noopener")}
                className="h-11 w-full rounded-full border-[#E2E8F0] text-[13px] font-semibold text-[#0F172A]"
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Open in browser
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}