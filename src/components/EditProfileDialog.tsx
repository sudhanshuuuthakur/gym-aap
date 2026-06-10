import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { User, IndianRupee } from "lucide-react";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentDisplayName: string | null;
  currentDefaultFee?: number;
  onSaved: (newName: string) => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  userId,
  currentDisplayName,
  currentDefaultFee = 500,
  onSaved,
}: EditProfileDialogProps) {
  const [displayName, setDisplayName] = useState(currentDisplayName || "");
  const [defaultFee, setDefaultFee] = useState(currentDefaultFee.toString());
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      toast.error("Display name cannot be empty");
      return;
    }
    if (trimmed.length > 100) {
      toast.error("Display name must be less than 100 characters");
      return;
    }

    const fee = Number(defaultFee);
    if (isNaN(fee) || fee <= 0) {
      toast.error("Default fee must be a positive number");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ 
        display_name: trimmed,
        default_membership_fee: fee 
      })
      .eq("user_id", userId);
    setLoading(false);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated!");
      onSaved(trimmed);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-neutral-800 bg-neutral-900 text-neutral-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-neutral-100">
            <User className="h-5 w-5" /> Edit Profile
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-neutral-400">Display Name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              maxLength={100}
              className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-neutral-400">
              <IndianRupee className="h-4 w-4" />
              Default Membership Fee
            </Label>
            <Input
              type="number"
              inputMode="numeric"
              value={defaultFee}
              onChange={(e) => setDefaultFee(e.target.value)}
              placeholder="Enter default fee amount"
              min="1"
              className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500"
            />
            <p className="text-xs text-neutral-500">This is the default amount charged to each member per 30 days</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-neutral-400 hover:text-neutral-100"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
