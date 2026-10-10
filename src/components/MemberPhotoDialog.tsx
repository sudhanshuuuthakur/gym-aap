import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Props {
  member: { id: string; name: string; avatar_url?: string | null } | null;
  userId: string;
  photoUrl?: string;
  onClose: () => void;
  onSaved: () => void;
}

export function MemberPhotoDialog({ member, userId, photoUrl, onClose, onSaved }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>();
  const [busy, setBusy] = useState(false);
  useEffect(() => { setFile(null); }, [member?.id]);
  useEffect(() => {
    if (!file) { setPreview(undefined); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function pick(selected: File | undefined) {
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) { toast.error("Choose a JPG, PNG or WEBP photo"); return; }
    if (selected.size > 5 * 1024 * 1024) { toast.error("Photo must be smaller than 5 MB"); return; }
    setFile(selected);
  }

  async function save(remove = false) {
    if (!member || (!remove && !file)) return;
    setBusy(true);
    let newPath: string | null = null;
    try {
      if (!remove && file) {
        const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
        newPath = `${userId}/member-${member.id}-${crypto.randomUUID()}.${extension}`;
        const { error } = await supabase.storage.from("avatars").upload(newPath, file, { contentType: file.type });
        if (error) throw error;
      }
      const { data, error } = await supabase.from("admissions").update({ avatar_url: newPath }).eq("id", member.id).eq("user_id", userId).select("id").single();
      if (error || !data) {
        if (newPath) await supabase.storage.from("avatars").remove([newPath]);
        throw error || new Error("Member not found");
      }
      if (member.avatar_url?.startsWith(`${userId}/`)) await supabase.storage.from("avatars").remove([member.avatar_url]);
      toast.success(remove ? "Photo removed" : "Photo saved");
      onSaved();
      onClose();
    } catch { toast.error("Could not save the photo. Please try again."); }
    finally { setBusy(false); }
  }

  return <Dialog open={!!member} onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
    <DialogContent className="sm:max-w-sm">
      <DialogHeader><DialogTitle>Member photo</DialogTitle></DialogHeader>
      <div className="flex flex-col items-center gap-4 py-4">
        <Avatar className="h-28 w-28"><AvatarImage src={preview || photoUrl} alt={member?.name} /><AvatarFallback className="bg-primary/15 text-2xl font-semibold text-primary">{member?.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</AvatarFallback></Avatar>
        <p className="max-w-full break-words text-center font-semibold">{member?.name}</p>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Member photo file" className="hidden" onChange={(event) => {
          const selected = event.target.files?.[0];
          event.target.value = "";
          pick(selected);
        }} />
        <input ref={cameraInput} type="file" accept="image/*" capture="environment" aria-label="Take member photo with camera" className="hidden" onChange={(event) => {
          const selected = event.target.files?.[0];
          event.target.value = "";
          pick(selected);
        }} />
        <div className="flex w-full gap-2">
          <Button variant="outline" className="flex-1" disabled={busy} onClick={() => cameraInput.current?.click()}><Camera />Take photo</Button>
          <Button variant="outline" className="flex-1" disabled={busy} onClick={() => input.current?.click()}><ImagePlus />Choose photo</Button>
        </div>
        {member?.avatar_url && <Button variant="ghost" className="text-destructive" disabled={busy} onClick={() => save(true)}><Trash2 />Remove photo</Button>}
      </div>
      <Button disabled={!file || busy} onClick={() => save()}>{busy && <Loader2 className="animate-spin" />}Save photo</Button>
    </DialogContent>
  </Dialog>;
}
