export type MembersFilter = "all" | "paid" | "unpaid" | "active" | "inactive" | "pending" | "rejected";

export interface MemberPayment {
  admission_id: string;
  payment_date: string;
}

export function matchesMemberFilter(member: { id: string; status: string }, payments: MemberPayment[], filter: MembersFilter, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const memberPayments = payments.filter((payment) => payment.admission_id === member.id);
  const paid = memberPayments.some((payment) => {
    const date = new Date(`${payment.payment_date}T00:00:00`);
    return date <= today && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  });
  const active = memberPayments.some((payment) => {
    const start = new Date(`${payment.payment_date}T00:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + 30);
    return start <= today && today < end;
  });
  switch (filter) {
    case "paid": return paid;
    case "unpaid": return !paid;
    case "active": return active;
    case "inactive": return !active;
    case "pending": return member.status === "pending";
    case "rejected": return member.status === "rejected";
    default: return true;
  }
}