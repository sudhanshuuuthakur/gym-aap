import { useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { UserPlus, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [joinDate, setJoinDate] = useState<Date | undefined>(new Date());
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
    if (!/^\d{10}$/.test(phone.trim())) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("admissions").insert({
      user_id: userId,
      name: name.trim(),
      phone: phone.trim(),
      join_date: joinDate ? format(joinDate, "yyyy-MM-dd") : null,
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
      setJoinDate(new Date());
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
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                setPhone(val);
              }}
              placeholder="10 digit number"
              maxLength={10}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-neutral-400">Date of Joining</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    inputClass,
                    !joinDate && "text-neutral-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {joinDate ? format(joinDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-neutral-700 bg-neutral-900 z-[9999]" align="start">
                <Calendar
                  mode="single"
                  selected={joinDate}
                  onSelect={setJoinDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto text-neutral-100")}
                  classNames={{
                    caption_label: "text-sm font-medium text-neutral-100",
                    nav_button: cn(
                      "h-7 w-7 bg-neutral-800 border border-neutral-700 p-0 opacity-70 hover:opacity-100 hover:bg-neutral-700 text-neutral-100 inline-flex items-center justify-center rounded-md"
                    ),
                    head_cell: "text-neutral-400 rounded-md w-9 font-normal text-[0.8rem]",
                    day: "h-9 w-9 p-0 font-normal text-neutral-200 hover:bg-neutral-700 rounded-md inline-flex items-center justify-center",
                    day_selected: "bg-emerald-600 text-white hover:bg-emerald-500 focus:bg-emerald-600",
                    day_today: "bg-neutral-700 text-neutral-100",
                    day_outside: "text-neutral-600 opacity-50",
                    day_disabled: "text-neutral-600 opacity-50",
                  }}
                />
              </PopoverContent>
            </Popover>
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
