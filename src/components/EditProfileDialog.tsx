import { useEffect, useRef, useState } from "react";
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
import { Camera, Check, IndianRupee, Moon, Sun, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { z } from "zod";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentDisplayName: string | null;
  currentPhone: string | null;
  currentAvatarPath: string | null;
  currentDefaultFee?: number;
  onSaved: (newName: string, newPhone: string, avatarPath: string | null, avatarUrl: string | null) => void;
}

const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Display name cannot be empty").max(100, "Display name must be less than 100 characters"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must contain exactly 10 digits"),
});

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function EditProfileDialog({
  open,
  onOpenChange,
  userId,
  currentDisplayName,
  currentPhone,
  currentAvatarPath,
  currentDefaultFee = 500,
  onSaved,
}: EditProfileDialogProps) {
  const [displayName, setDisplayName] = useState(currentDisplayName || "");
  const [phone, setPhone] = useState(currentPhone || "");
  const [defaultFee, setDefaultFee] = useState(currentDefaultFee.toString());
  const [avatarPath, setAvatarPath] = useState<string | null>(currentAvatarPath);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!open) return;
    setDisplayName(currentDisplayName || "");
    setPhone(currentPhone || "");
    setAvatarPath(currentAvatarPath);
    setAvatarFile(null);
    if (currentAvatarPath) {
      supabase.storage.from("avatars").createSignedUrl(currentAvatarPath, 3600).then(({ data }) => setAvatarUrl(data?.signedUrl || null));
    } else {
      setAvatarUrl(null);
    }
  }, [open, currentDisplayName, currentPhone, currentAvatarPath]);

  const handleAvatarChange = (file: File | undefined) => {
    if (!file) return;
    if (!AVATAR_TYPES.includes(file.type)) {
      toast.error("Choose a JPG, PNG, or WEBP photo");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("Photo must be smaller than 5 MB");
      return;
    }
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const validation = profileSchema.safeParse({ displayName, phone: phone.trim() });
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message || "Check your profile details");
      return;
    }

    setLoading(true);
    let nextAvatarPath = avatarPath;
    let nextAvatarUrl = avatarUrl;

    if (avatarFile) {
      const extension = avatarFile.type.split("/")[1] || "jpg";
      nextAvatarPath = `${userId}/avatar-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(nextAvatarPath, avatarFile, {
        cacheControl: "3600",
        contentType: avatarFile.type,
        upsert: false,
      });
      if (uploadError) {
        setLoading(false);
        toast.error("Could not upload your photo");
        return;
      }
      const { data: signedAvatar } = await supabase.storage.from("avatars").createSignedUrl(nextAvatarPath, 3600);
      nextAvatarUrl = signedAvatar?.signedUrl || null;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: validation.data.displayName, phone: validation.data.phone, avatar_url: nextAvatarPath })
      .eq("user_id", userId);
    setLoading(false);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated!");
      onSaved(validation.data.displayName, validation.data.phone, nextAvatarPath, nextAvatarUrl);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto border-border bg-background text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <User className="h-5 w-5" /> Edit Profile
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-24 w-24 ring-4 ring-primary/10">
              <AvatarImage src={avatarUrl || undefined} alt="Your profile photo" />
              <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                {displayName.trim().charAt(0).toUpperCase() || <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => handleAvatarChange(event.target.files?.[0])}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Camera className="mr-2 h-4 w-4" /> Change photo
            </Button>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Display name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              maxLength={100}
              className="bg-muted text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Phone number</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric"
              placeholder="10-digit phone number"
              maxLength={10}
              className="bg-muted text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground">
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
              className="bg-muted text-foreground placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">This is the default amount charged to each member per 30 days</p>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-3">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
              <div>
                <p className="text-sm font-medium text-foreground">Dark appearance</p>
                <p className="text-xs text-muted-foreground">Remember this choice on this device</p>
              </div>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              aria-label="Toggle dark appearance"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : <><Check className="mr-2 h-4 w-4" /> Save</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
