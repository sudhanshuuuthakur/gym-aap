import { AdmissionsList } from "@/components/AdmissionsList";

interface MembersScreenProps {
  userId: string;
  gymId: string;
}

export function MembersScreen({ userId, gymId }: MembersScreenProps) {
  return <AdmissionsList userId={userId} gymId={gymId} />;
}
