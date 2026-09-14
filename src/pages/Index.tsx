import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PhoneLoginForm } from "@/components/PhoneLoginForm";
import { Dashboard } from "@/components/Dashboard";
import type { Session } from "@supabase/supabase-js";
import loginBgAsset from "@/assets/login.background.png.asset.json";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  if (session) {
    return <Dashboard session={session} />;
  }

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('${loginBgAsset.url}')` }}
    >
      <div className="absolute inset-0 z-[1] bg-white/75" />
      <div className="relative z-10">
        <PhoneLoginForm />
      </div>
    </div>
  );
};

export default Index;
