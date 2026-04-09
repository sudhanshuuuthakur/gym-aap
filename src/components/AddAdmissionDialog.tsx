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
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("admissions").insert({
      user_id: userId,
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
    });
    setLoading(false);

    if (error) {
      toast.error("Failed to add admission");
    } else {
      toast.success("Admission added!");
      setName("");
      setEmail("");
      setPhone("");
      onAdded();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-neutral-800 bg-neutral-900 text-neutral-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-neutral-100">
            <UserPlus className="h-5 w-5" /> New Admission
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
              className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-neutral-400">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              maxLength={255}
              className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-neutral-400">Phone</Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 234 567 8900"
              className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-neutral-400 hover:text-neutral-100"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
