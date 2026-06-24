import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PhoneLoginForm } from "@/components/PhoneLoginForm";
import { Dashboard } from "@/components/Dashboard";
import type { Session } from "@supabase/supabase-js";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

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

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setOffset({ x, y });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  if (loading) return null;

  if (session) {
    return <Dashboard session={session} />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4 bg-[#030508]">
      {/* Parallax background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform transition-transform duration-[1200ms] ease-out scale-110"
        style={{
          backgroundImage: "url('/gym.background.png')",
          transform: `translate3d(${offset.x * -15}px, ${offset.y * -15}px, 0) scale(1.1)`,
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#030508]/70 backdrop-blur-[2px] pointer-events-none" />

      {/* Animated floating orbs for depth */}
      <div
        className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-[#5ec3ff]/10 blur-3xl animate-pulse will-change-transform"
        style={{
          transform: `translate3d(${offset.x * 30}px, ${offset.y * 30}px, 0)`,
          transition: "transform 800ms ease-out",
          animationDuration: "6s",
        }}
      />
      <div
        className="absolute -bottom-40 -right-32 w-[32rem] h-[32rem] rounded-full bg-[#2dd4bf]/10 blur-3xl animate-pulse will-change-transform"
        style={{
          transform: `translate3d(${offset.x * -40}px, ${offset.y * -40}px, 0)`,
          transition: "transform 1000ms ease-out",
          animationDuration: "8s",
          animationDelay: "1s",
        }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-[20rem] h-[20rem] rounded-full bg-[#7c3aed]/10 blur-3xl animate-pulse will-change-transform"
        style={{
          transform: `translate3d(${offset.x * 20}px, ${offset.y * -20}px, 0)`,
          transition: "transform 900ms ease-out",
          animationDuration: "10s",
          animationDelay: "2s",
        }}
      />

      {/* Subtle ambient vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(3,5,8,0.6)_100%)] pointer-events-none" />

      {/* Login Form with subtle counter-parallax */}
      <div
        className="relative z-10 will-change-transform"
        style={{
          transform: `translate3d(${offset.x * 4}px, ${offset.y * 4}px, 0)`,
          transition: "transform 400ms ease-out",
        }}
      >
        <PhoneLoginForm />
      </div>
    </div>
  );
};

export default Index;
