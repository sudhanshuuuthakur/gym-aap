import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center px-4"
      style={{
        backgroundImage: "url('/gym.background.png')",
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for visibility */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950/75 via-neutral-900/70 to-neutral-950/75 pointer-events-none" />
      
      {/* Login Form */}
      <div className="relative z-10">
        <PhoneLoginForm />
      </div>
    </div>
  );
};

export default Index;
