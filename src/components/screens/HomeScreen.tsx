import { MembershipStats } from "@/components/MembershipStats";

interface HomeScreenProps {
  userId: string;
  greeting: string;
}

export function HomeScreen({ userId, greeting }: HomeScreenProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-100">
          👋 Hi, {greeting}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Here's how your gym is doing today
        </p>
      </div>
      <MembershipStats userId={userId} />
    </div>
  );
}
