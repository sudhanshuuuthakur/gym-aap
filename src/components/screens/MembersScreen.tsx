import { AdmissionsList } from "@/components/AdmissionsList";

interface MembersScreenProps {
  userId: string;
  gymId: string;
  gymName: string;
}

export function MembersScreen({ userId, gymId, gymName }: MembersScreenProps) {
  return <AdmissionsList userId={userId} gymId={gymId} gymName={gymName} />;
}
