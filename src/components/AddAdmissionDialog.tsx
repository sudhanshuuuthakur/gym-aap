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
import { UserPlus } from "lucide-react";

interface AddAdmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onAdded: () => void;
}

export function AddAdmissionDialog({
  open,
  onOpenChange,
  userId,
  onAdded,
}: AddAdmissionDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("admissions").insert({
      user_id: userId,
      name: name.trim(),
      phone: phone.trim(),
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      age: age ? parseInt(age, 10) : null,
    });
    setLoading(false);

    if (error) {
      toast.error("Failed to add member");
    } else {
      toast.success("Member added!");
      setName("");
      setPhone("");
      setHeight("");
      setWeight("");
      setAge("");
      onAdded();
      onOpenChange(false);
    }
  };

  const inputClass = "bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-neutral-800 bg-neutral-900 text-neutral-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-neutral-100">
            <UserPlus className="h-5 w-5" /> New Member
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-neutral-400">Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              maxLength={100}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-neutral-400">Phone *</Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className={inputClass}
            />
          </div>

          <p className="text-xs text-neutral-500 pt-1">Optional details</p>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-neutral-400 text-xs">Age</Label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                min={1}
                max={120}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-400 text-xs">Height (cm)</Label>
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170"
                min={1}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-400 text-xs">Weight (kg)</Label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70"
                min={1}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-neutral-400 hover:text-neutral-100"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Adding..." : "Add Member"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
