import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, Mail, Phone } from "lucide-react";
import { AddAdmissionDialog } from "@/components/AddAdmissionDialog";

interface Admission {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string;
}

interface AdmissionsListProps {
  userId: string;
}

export function AdmissionsList({ userId }: AdmissionsListProps) {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

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
                  <Badge
                    variant="outline"
                    className={statusColor[admission.status] || "text-neutral-400"}
                  >
                    {admission.status}
                  </Badge>
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
    </>
  );
}
