import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Phone, Mail, Calendar, IndianRupee, CheckCircle2 } from "lucide-react";

interface Member {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: string;
  created_at?: string;
  join_date?: string | null;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
}

interface MemberProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
}

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
}

interface Attendance {
  id: string;
  check_in_date: string;
}

export function MemberProfileDialog({ open, onOpenChange, member }: MemberProfileDialogProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  useEffect(() => {
    if (!member || !open) return;
    Promise.all([
      (supabase as any)
        .from("payments")
        .select("id, amount, payment_date")
        .eq("admission_id", member.id)
        .order("payment_date", { ascending: false })
        .limit(5),
      (supabase as any)
        .from("attendance")
        .select("id, check_in_date")
        .eq("admission_id", member.id)
        .order("check_in_date", { ascending: false })
        .limit(5),
    ]).then(([p, a]) => {
      if (p.data) setPayments(p.data);
      if (a.data) setAttendance(a.data);
    });
  }, [member, open]);

  if (!member) return null;

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number | null | undefined }) => (
    <div className="flex items-center justify-between border-b border-neutral-800 py-2">
      <span className="flex items-center gap-2 text-xs text-neutral-400">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className="text-sm text-neutral-100">{value || "—"}</span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-neutral-800 bg-neutral-900 text-neutral-100 sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-neutral-100">
            <User className="h-5 w-5" /> {member.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-wide text-neutral-500">Contact</p>
            <InfoRow icon={Phone} label="Phone" value={member.phone} />
            <InfoRow icon={Mail} label="Email" value={member.email} />
          </div>
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-wide text-neutral-500">Details</p>
            <InfoRow icon={Calendar} label="Joined" value={member.join_date || (member.created_at ? new Date(member.created_at).toLocaleDateString() : null)} />
            <InfoRow icon={User} label="Age" value={member.age} />
            <InfoRow icon={User} label="Height (cm)" value={member.height} />
            <InfoRow icon={User} label="Weight (kg)" value={member.weight} />
            <InfoRow icon={CheckCircle2} label="Status" value={member.status} />
          </div>
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-wide text-neutral-500">Recent Payments</p>
            {payments.length === 0 ? (
              <p className="py-2 text-xs text-neutral-500">No payments recorded</p>
            ) : (
              <div className="space-y-1">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-md bg-neutral-800/40 px-3 py-2 text-sm">
                    <span className="flex items-center gap-1 text-neutral-200">
                      <IndianRupee className="h-3.5 w-3.5" />{p.amount}
                    </span>
                    <span className="text-xs text-neutral-500">{new Date(p.payment_date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-wide text-neutral-500">Recent Attendance</p>
            {attendance.length === 0 ? (
              <p className="py-2 text-xs text-neutral-500">No check-ins yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {attendance.map((a) => (
                  <span key={a.id} className="rounded-md bg-neutral-800/60 px-2 py-1 text-xs text-neutral-300">
                    {new Date(a.check_in_date).toLocaleDateString()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}