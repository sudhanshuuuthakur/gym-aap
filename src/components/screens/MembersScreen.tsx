import { AdmissionsList } from "@/components/AdmissionsList";

interface MembersScreenProps {
  userId: string;
}

export function MembersScreen({ userId }: MembersScreenProps) {
  return <AdmissionsList userId={userId} />;
}
