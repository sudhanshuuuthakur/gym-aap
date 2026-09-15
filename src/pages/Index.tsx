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
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-login-overlay px-4 py-6">
      <img
        src={loginBgAsset.url}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 z-[1] bg-login-overlay" />
      <div className="relative z-10 w-full max-w-[390px]">
        <PhoneLoginForm />
      </div>
    </div>
  );
};

export default Index;
