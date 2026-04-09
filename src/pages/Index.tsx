import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { PhoneLoginForm } from "@/components/PhoneLoginForm";
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return null;

  return (
    <BackgroundGradientAnimation>
      <div className="absolute z-50 inset-0 flex items-center justify-center px-4">
        {session ? (
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-300">
              hello
            </h1>
            <p className="text-neutral-400">
              Signed in as {session.user.phone}
            </p>
            <button
              onClick={handleLogout}
              className="text-sm text-neutral-400 hover:text-neutral-200 underline transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <PhoneLoginForm />
        )}
      </div>
    </BackgroundGradientAnimation>
  );
};

export default Index;
