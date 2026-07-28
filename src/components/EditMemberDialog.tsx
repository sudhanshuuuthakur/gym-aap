import { useEffect, useState } from "react";
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
import { Pencil } from "lucide-react";
import { ContactPickerButton } from "@/components/ContactPickerButton";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  age?: number | null;
  weight?: number | null;
  height?: number | null;
}

interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  onUpdated: () => void;
}

export function EditMemberDialog({ open, onOpenChange, member, onUpdated }: EditMemberDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setName(member.name || "");
      setPhone(member.phone || "");
      setEmail(member.email || "");
      setAge(member.age != null ? String(member.age) : "");
      setHeight(member.height != null ? String(member.height) : "");
      setWeight(member.weight != null ? String(member.weight) : "");
    }
  }, [member]);

  const handlePickContact = ({ name: contactName, phone: contactPhone }: { name: string; phone: string }) => {
    if (contactName) setName(contactName);
    if (contactPhone) setPhone(contactPhone);
  };

  const handleSave = async () => {
    if (!member) return;
    if (!name.trim()) return toast.error("Name is required");
    if (!phone.trim() || !/^\d{10}$/.test(phone.trim()))
      return toast.error("Phone must be 10 digits");

    setLoading(true);
    const { error } = await supabase
      .from("admissions")
      .update({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        age: age ? parseInt(age, 10) : null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
      })
      .eq("id", member.id);
    setLoading(false);

    if (error) {
      toast.error("Failed to update member");
    } else {
      toast.success("Member updated");
      onUpdated();
      onOpenChange(false);
    }
  };

  const inputClass =
    "bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-neutral-800 bg-neutral-900 text-neutral-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-neutral-100">
            <Pencil className="h-5 w-5" /> Edit Member
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-neutral-400">Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label className="text-neutral-400">Phone *</Label>
            <div
              className={cn(
                "flex h-10 w-full items-center rounded-md border bg-neutral-800 pl-3 pr-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-neutral-900",
                "border-neutral-700"
              )}
            >
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10 digit number"
                maxLength={10}
                className="w-full bg-transparent text-base placeholder:text-neutral-500 text-neutral-100 focus:outline-none md:text-sm"
              />
              <ContactPickerButton variant="suffix" onSelect={handlePickContact} />
            </div>
            <p className="text-[11px] leading-tight text-neutral-500 flex items-center gap-1">
              <span>💡</span>
              <span>Tap the icon above to pick name &amp; number directly from phone contacts</span>
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-neutral-400">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-neutral-400 text-xs">Age</Label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-400 text-xs">Height (cm)</Label>
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-400 text-xs">Weight (kg)</Label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
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
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}