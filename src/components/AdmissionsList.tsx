import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, Mail, Phone, MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import { AddAdmissionDialog } from "@/components/AddAdmissionDialog";
import { EditMemberDialog } from "@/components/EditMemberDialog";
import { MemberProfileDialog } from "@/components/MemberProfileDialog";
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

  const fetchAdmissions = useCallback(async () => {
    const { data } = await supabase
      .from("admissions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setAdmissions((data as Admission[]) || []);
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
    pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <>
      <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-neutral-200">
            <Users className="h-5 w-5" /> New Admissions
          </CardTitle>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Add
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-neutral-500 text-sm">Loading...</p>
          ) : admissions.length === 0 ? (
            <p className="text-neutral-500 text-sm text-center py-6">
              No admissions yet. Click "Add" to create one.
            </p>
          ) : (
            <div className="space-y-3">
              {admissions.map((admission) => (
                <div
                  key={admission.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-800/40 p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-neutral-100">{admission.name}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-neutral-400">
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
                      className={statusColor[admission.status] || "text-neutral-400"}
                    >
                      {admission.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-700/60 hover:text-neutral-100"
                          aria-label="Member actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="border-neutral-800 bg-neutral-900 text-neutral-100"
                      >
                        <DropdownMenuItem
                          onClick={() => setViewing(admission)}
                          className="focus:bg-neutral-800 focus:text-neutral-100"
                        >
                          <Eye className="mr-2 h-4 w-4" /> View profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEditing(admission)}
                          className="focus:bg-neutral-800 focus:text-neutral-100"
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleting(admission)}
                          className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
        <AlertDialogContent className="border-neutral-800 bg-neutral-900 text-neutral-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              This permanently removes the member and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-neutral-700 bg-neutral-800 text-neutral-100 hover:bg-neutral-700 hover:text-neutral-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
