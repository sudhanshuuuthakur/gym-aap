import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ContactRound } from "lucide-react";
import { isContactPickerSupported, pickContact } from "@/lib/contactPicker";
import { toast } from "sonner";

interface ContactPickerButtonProps {
  onSelect: (data: { name: string; phone: string }) => void;
  variant?: "default" | "suffix";
}

export function ContactPickerButton({ onSelect, variant = "default" }: ContactPickerButtonProps) {
  const [loading, setLoading] = useState(false);
  const supported = isContactPickerSupported();

  const handlePick = async () => {
    if (!supported) {
      toast.error("Contact picker requires a mobile browser (Android Chrome/Edge)");
      return;
    }

    setLoading(true);
    try {
      const result = await pickContact();
      if (result) {
        if (!result.phone) {
          toast.error("Selected contact has no valid 10-digit phone number");
        }
        onSelect(result);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to pick contact");
      }
    } finally {
      setLoading(false);
    }
  };

  if (variant === "suffix") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handlePick}
        disabled={loading}
        className="h-8 w-8 shrink-0 rounded-md text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100"
        title="Pick from phone contacts"
      >
        <ContactRound className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handlePick}
      disabled={loading}
      className="h-10 w-10 shrink-0 border-neutral-700 bg-neutral-800 text-neutral-100 hover:bg-neutral-700 hover:text-neutral-50"
      title="Pick from phone contacts"
    >
      <ContactRound className="h-5 w-5" />
    </Button>
  );
}
