import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Users, Phone, MoreVertical, MoreHorizontal, Plus, Camera, Pencil, Trash2, Eye, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MemberPhotoDialog } from "@/components/MemberPhotoDialog";
import { matchesMemberFilter, type MembersFilter, type MemberPayment } from "@/lib/memberFilters";
import { AddAdmissionDialog } from "@/components/AddAdmissionDialog";
import { EditMemberDialog } from "@/components/EditMemberDialog";
import { MemberProfileDialog } from "@/components/MemberProfileDialog";
import { SendMessageDialog } from "@/components/SendMessageDialog";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Admission {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  join_date?: string | null;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  avatar_url?: string | null;
}

interface AdmissionsListProps {
  userId: string;
}

export function AdmissionsList({ userId }: AdmissionsListProps) {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Admission | null>(null);
  const [viewing, setViewing] = useState<Admission | null>(null);
  const [deleting, setDeleting] = useState<Admission | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [messaging, setMessaging] = useState<Admission | null>(null);
  const [gymName, setGymName] = useState("");
  const [filter, setFilter] = useState<MembersFilter>("all");
  const [payments, setPayments] = useState<MemberPayment[]>([]);
  const [photoMember, setPhotoMember] = useState<Admission | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState(false);

  const fetchAdmissions = useCallback(async () => {
    const [memberRes, profileRes, paymentRes] = await Promise.all([
      supabase
        .from("admissions")
        .select("id, name, email, phone, status, created_at, join_date, age, height, weight, avatar_url")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", userId)
        .single(),
      supabase.from("payments").select("admission_id, payment_date").eq("user_id", userId),
    ]);
    if (memberRes.error || paymentRes.error) {
      setLoadError(true);
      setLoading(false);
      return;
    }
    setLoadError(false);
    setAdmissions((memberRes.data as Admission[]) || []);
    setPayments(paymentRes.data || []);
    if (profileRes.data) setGymName((profileRes.data as { display_name: string | null }).display_name || "");
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    const paths = admissions.flatMap((member) => member.avatar_url ? [member.avatar_url] : []);
    if (!paths.length) { setPhotoUrls({}); return; }
    supabase.storage.from("avatars").createSignedUrls(paths, 3600).then(({ data }) => {
      if (cancelled) return;
      const urls: Record<string, string> = {};
      data?.forEach((photo) => { if (photo.path && photo.signedUrl) urls[photo.path] = photo.signedUrl; });
      setPhotoUrls(urls);
    });
    return () => { cancelled = true; };
  }, [admissions]);

  useEffect(() => {
    fetchAdmissions();
  }, [fetchAdmissions]);

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    const { error } = await supabase.from("admissions").delete().eq("id", deleting.id);
    setDeleteLoading(false);
    if (error) {
      toast.error("Failed to delete member");
    } else {
      toast.success("Member deleted");
      setDeleting(null);
      fetchAdmissions();
    }
  };

  const statusColor: Record<string, string> = {
    pending: "bg-secondary text-secondary-foreground border-border",
    approved: "bg-primary/10 text-primary border-primary/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };
  const filters: { key: MembersFilter; label: string }[] = [
    { key: "all", label: "All" }, { key: "paid", label: "Paid" },
    { key: "unpaid", label: "Unpaid" }, { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
  ];
  const filtered = admissions.filter((member) => matchesMemberFilter(member, payments, filter));

  return (
    <>
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Members</h1>
            <p className="mt-1 text-sm text-muted-foreground">All admissions</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2" aria-label="Member filters">
          {filters.map(({ key, label }) => <Button key={key} size="sm" variant={filter === key ? "default" : "outline"} aria-pressed={filter === key} onClick={() => setFilter(key)} className="h-10 rounded-full px-4 text-[13px]">{label}</Button>)}
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant={filter === "pending" || filter === "rejected" ? "default" : "outline"} size="icon" className="h-10 w-11 rounded-full" aria-label="More member filters"><MoreHorizontal /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(["pending", "rejected"] as const).map((key) => <DropdownMenuItem key={key} onClick={() => setFilter(key)} className="capitalize">{key}{filter === key && <Check className="ml-auto h-4 w-4" />}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {(filter === "paid" || filter === "unpaid") && <p className="text-xs text-muted-foreground">Payments this month</p>}
        <div>
          {loadError ? (
            <div className="py-6 text-center"><p className="text-sm text-muted-foreground">Could not load members.</p><Button variant="outline" className="mt-3" onClick={fetchAdmissions}>Try again</Button></div>
          ) : loading ? (
            <p className="py-6 text-center text-[13px] text-muted-foreground">Loading…</p>
          ) : admissions.length === 0 ? (
            <div className="py-10 text-center">
              <Users className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-[13px] text-muted-foreground">No members yet.</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No members in this category.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((admission, idx) => (
                <motion.div
                  key={admission.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.02, 0.2), duration: 0.25 }}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 sm:p-4"
                >
                  <Button variant="ghost" className="h-12 w-12 shrink-0 rounded-full p-0 sm:h-14 sm:w-14" aria-label={`Photo for ${admission.name}`} title="Add or change member photo" onClick={() => setPhotoMember(admission)}>
                    <Avatar className="h-full w-full"><AvatarImage src={admission.avatar_url ? photoUrls[admission.avatar_url] : undefined} alt={admission.name} /><AvatarFallback className="bg-primary/15 text-base font-semibold text-primary">{admission.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</AvatarFallback></Avatar>
                  </Button>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="break-words text-[14px] font-semibold text-foreground">{admission.name}</p>
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                      {admission.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {admission.phone}
                        </span>
                      )}
                      <span>
                        {new Date(admission.join_date ? `${admission.join_date}T00:00:00` : admission.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant="outline" className={`rounded-full px-2 py-0 text-[10px] sm:hidden ${statusColor[admission.status] || "text-muted-foreground"}`}>{admission.status}</Badge>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Badge
                      variant="outline"
                      className={`hidden rounded-full sm:inline-flex ${statusColor[admission.status] || "text-muted-foreground"}`}
                    >
                      {admission.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"
                          className="h-9 w-9 rounded-full text-muted-foreground"
                          aria-label={`Actions for ${admission.name}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="border-border bg-popover text-popover-foreground"
                      >
                        <DropdownMenuItem
                          onClick={() => setViewing(admission)}
                          className="focus:bg-muted focus:text-foreground"
                        >
                          <Eye className="mr-2 h-4 w-4" /> View profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPhotoMember(admission)}><Camera className="mr-2 h-4 w-4" />{admission.avatar_url ? "Change photo" : "Add photo"}</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setMessaging(admission)}
                          className="focus:bg-muted focus:text-foreground"
                        >
                          <Send className="mr-2 h-4 w-4" /> Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEditing(admission)}
                          className="focus:bg-muted focus:text-foreground"
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleting(admission)}
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {createPortal(<div className="pointer-events-none fixed inset-x-0 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-5xl justify-end px-6"><Button size="icon" aria-label="Add member" title="Add member" onClick={() => setAddOpen(true)} className="pointer-events-auto h-14 w-14 rounded-full shadow-lg [&_svg]:size-7"><Plus /></Button></div>, document.body)}
      <MemberPhotoDialog member={photoMember} userId={userId} photoUrl={photoMember?.avatar_url ? photoUrls[photoMember.avatar_url] : undefined} onClose={() => setPhotoMember(null)} onSaved={fetchAdmissions} />

      <AddAdmissionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        userId={userId}
        onAdded={fetchAdmissions}
      />

      <EditMemberDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        member={editing}
        onUpdated={fetchAdmissions}
      />

      <MemberProfileDialog
        open={!!viewing}
        onOpenChange={(o) => !o && setViewing(null)}
        member={viewing}
      />

      <SendMessageDialog
        open={!!messaging}
        onOpenChange={(o) => !o && setMessaging(null)}
        memberName={messaging?.name || ""}
        memberPhone={messaging?.phone || null}
        gymName={gymName}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="border-border bg-card text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This permanently removes the member and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
