import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, Mail, Phone, MoreVertical, Pencil, Trash2, Eye, Send } from "lucide-react";
import { AddAdmissionDialog } from "@/components/AddAdmissionDialog";
import { EditMemberDialog } from "@/components/EditMemberDialog";
import { MemberProfileDialog } from "@/components/MemberProfileDialog";
import { SendMessageDialog } from "@/components/SendMessageDialog";
import { SurfaceCard } from "@/components/premium/SurfaceCard";
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

  const fetchAdmissions = useCallback(async () => {
    const [memberRes, profileRes] = await Promise.all([
      supabase
        .from("admissions")
        .select("id, name, email, phone, status, created_at, join_date, age, height, weight")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userId)
        .single(),
    ]);
    setAdmissions((memberRes.data as Admission[]) || []);
    if (profileRes.data) setGymName((profileRes.data as { display_name: string | null }).display_name || "");
    setLoading(false);
  }, [userId]);

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
    pending: "bg-[#F59E0B]/12 text-[#F59E0B] border-[#F59E0B]/30",
    approved: "bg-[#22C55E]/12 text-[#22C55E] border-[#22C55E]/30",
    rejected: "bg-[#EF4444]/12 text-[#EF4444] border-[#EF4444]/30",
  };

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-[#0F172A]">Members</h1>
            <p className="mt-0.5 text-[12px] text-[#94A3B8]">All admissions</p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="flex h-10 items-center gap-1.5 rounded-full bg-[#22C55E] px-4 text-[13px] font-semibold text-[#FFFFFF] transition-all hover:bg-[#22C55E]/90 active:scale-95"
          >
            <UserPlus className="h-4 w-4" /> Add
          </button>
        </div>
        <SurfaceCard className="p-4">
          {loading ? (
            <p className="py-6 text-center text-[13px] text-[#64748B]">Loading…</p>
          ) : admissions.length === 0 ? (
            <div className="py-10 text-center">
              <Users className="mx-auto h-10 w-10 text-[#CBD5E1]" />
              <p className="mt-3 text-[13px] text-[#64748B]">No admissions yet. Tap Add to create one.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {admissions.map((admission, idx) => (
                <motion.div
                  key={admission.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.02, 0.2), duration: 0.25 }}
                  className="flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9] p-4"
                >
                  <div className="space-y-1">
                    <p className="text-[14px] font-semibold text-[#0F172A]">{admission.name}</p>
                    <div className="flex flex-wrap gap-3 text-[11px] text-[#94A3B8]">
                      {admission.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {admission.email}
                        </span>
                      )}
                      {admission.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {admission.phone}
                        </span>
                      )}
                      <span>
                        {new Date(admission.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={statusColor[admission.status] || "text-[#94A3B8]"}
                    >
                      {admission.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                          aria-label="Member actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A]"
                      >
                        <DropdownMenuItem
                          onClick={() => setViewing(admission)}
                          className="focus:bg-[#F1F5F9] focus:text-[#0F172A]"
                        >
                          <Eye className="mr-2 h-4 w-4" /> View profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEditing(admission)}
                          className="focus:bg-[#F1F5F9] focus:text-[#0F172A]"
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleting(admission)}
                          className="text-[#EF4444] focus:bg-[#EF4444]/10 focus:text-[#EF4444]"
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
        </SurfaceCard>
      </div>

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

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#94A3B8]">
              This permanently removes the member and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#E2E8F0] bg-[#F1F5F9] text-[#0F172A] hover:bg-[#F1F5F9] hover:text-[#0F172A]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-[#EF4444] text-[#0F172A] hover:bg-[#EF4444]/90"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
