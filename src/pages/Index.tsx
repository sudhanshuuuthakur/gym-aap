import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { PhoneLoginForm } from "@/components/PhoneLoginForm";
import { Dashboard } from "@/components/Dashboard";
import type { Session } from "@supabase/supabase-js";

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
    <BackgroundGradientAnimation>
      <div className="absolute z-50 inset-0 flex items-center justify-center px-4">
        <PhoneLoginForm />
      </div>
    </BackgroundGradientAnimation>
  );
};

export default Index;
