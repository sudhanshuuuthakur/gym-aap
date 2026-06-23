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
      {/* Refined dark overlay for readability */}
      <div className="absolute inset-0 bg-[#030508]/70 backdrop-blur-[2px] pointer-events-none" />
      
      {/* Subtle ambient vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(3,5,8,0.55)_100%)] pointer-events-none" />
      
      {/* Login Form */}
      <div className="relative z-10">
        <PhoneLoginForm />
      </div>
    </div>
  );
};

export default Index;
