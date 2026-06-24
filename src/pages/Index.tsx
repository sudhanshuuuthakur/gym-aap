import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PhoneLoginForm } from "@/components/PhoneLoginForm";
import { Dashboard } from "@/components/Dashboard";
import type { Session } from "@supabase/supabase-js";

type Intensity = "subtle" | "medium" | "strong";

const INTENSITY_PRESETS: Record<Intensity, { parallax: number; orbScale: number; orbOpacity: number; label: string }> = {
  subtle: { parallax: 0.4, orbScale: 0.6, orbOpacity: 0.5, label: "Subtle" },
  medium: { parallax: 1, orbScale: 1, orbOpacity: 1, label: "Medium" },
  strong: { parallax: 1.8, orbScale: 1.4, orbOpacity: 1.5, label: "Strong" },
};

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [intensity, setIntensity] = useState<Intensity>(() => {
    if (typeof window === "undefined") return "medium";
    return (localStorage.getItem("bg-intensity") as Intensity) || "medium";
  });
  const [reducedMotion, setReducedMotion] = useState(false);

  const preset = INTENSITY_PRESETS[intensity];
  const p = reducedMotion ? 0 : preset.parallax;

  useEffect(() => {
    localStorage.setItem("bg-intensity", intensity);
  }, [intensity]);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);

    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

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
    if (reducedMotion) return;
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setOffset({ x, y });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [reducedMotion]);

  if (loading) return null;

  if (session) {
    return <Dashboard session={session} />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4 bg-[#030508]">
      {/* Parallax background image */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform scale-110 ${reducedMotion ? "" : "transition-transform duration-[1200ms] ease-out"}`}
        style={{
          backgroundImage: "url('/gym.background.png')",
          transform: `translate3d(${offset.x * -15 * p}px, ${offset.y * -15 * p}px, 0) scale(1.1)`,
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#030508]/70 backdrop-blur-[2px] pointer-events-none" />

      {/* Animated floating orbs for depth */}
      <div
        className={`absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-[#5ec3ff] blur-3xl will-change-transform ${reducedMotion ? "" : "animate-pulse"}`}
        style={{
          opacity: reducedMotion ? 0.04 : 0.1 * preset.orbOpacity,
          transform: `translate3d(${offset.x * 30 * p}px, ${offset.y * 30 * p}px, 0) scale(${reducedMotion ? 0.9 : preset.orbScale})`,
          transition: reducedMotion ? "none" : "transform 800ms ease-out",
          animationDuration: "6s",
        }}
      />
      <div
        className={`absolute -bottom-40 -right-32 w-[32rem] h-[32rem] rounded-full bg-[#2dd4bf] blur-3xl will-change-transform ${reducedMotion ? "" : "animate-pulse"}`}
        style={{
          opacity: reducedMotion ? 0.03 : 0.1 * preset.orbOpacity,
          transform: `translate3d(${offset.x * -40 * p}px, ${offset.y * -40 * p}px, 0) scale(${reducedMotion ? 0.85 : preset.orbScale})`,
          transition: reducedMotion ? "none" : "transform 1000ms ease-out",
          animationDuration: "8s",
          animationDelay: "1s",
        }}
      />
      <div
        className={`absolute top-1/3 right-1/4 w-[20rem] h-[20rem] rounded-full bg-[#7c3aed] blur-3xl will-change-transform ${reducedMotion ? "" : "animate-pulse"}`}
        style={{
          opacity: reducedMotion ? 0.03 : 0.1 * preset.orbOpacity,
          transform: `translate3d(${offset.x * 20 * p}px, ${offset.y * -20 * p}px, 0) scale(${reducedMotion ? 0.9 : preset.orbScale})`,
          transition: reducedMotion ? "none" : "transform 900ms ease-out",
          animationDuration: "10s",
          animationDelay: "2s",
        }}
      />

      {/* Subtle ambient vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(3,5,8,0.6)_100%)] pointer-events-none" />

      {/* Intensity control */}
      {!reducedMotion && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1 rounded-full border border-[#2a3a50] bg-[#0d1117]/70 backdrop-blur-xl p-1 shadow-lg">
          {(Object.keys(INTENSITY_PRESETS) as Intensity[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setIntensity(key)}
              aria-pressed={intensity === key}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                intensity === key
                  ? "bg-[#5ec3ff] text-[#03131f] shadow-[0_2px_10px_rgba(94,195,255,0.35)]"
                  : "text-[#94a3b8] hover:text-[#cbd5e1]"
              }`}
            >
              {INTENSITY_PRESETS[key].label}
            </button>
          ))}
        </div>
      )}

      {/* Reduced-motion notice */}
      {reducedMotion && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full border border-[#2a3a50] bg-[#0d1117]/70 backdrop-blur-xl px-3 py-1.5 shadow-lg">
          <svg className="w-3.5 h-3.5 text-[#5ec3ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
          <span className="text-xs font-medium text-[#94a3b8]">Motion reduced</span>
        </div>
      )}

      {/* Login Form with subtle counter-parallax */}
      <div
        className={`relative z-10 will-change-transform ${reducedMotion ? "" : "transition-transform duration-[400ms] ease-out"}`}
        style={{
          transform: `translate3d(${offset.x * 4 * p}px, ${offset.y * 4 * p}px, 0)`,
        }}
      >
        <PhoneLoginForm />
      </div>
    </div>
  );
};

export default Index;
