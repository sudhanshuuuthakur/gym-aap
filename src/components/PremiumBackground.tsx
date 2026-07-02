export function PremiumBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0A0A0A]">
      <style>{`
        .pb-dots {
          background-image: radial-gradient(rgba(255,255,255,0.9) 1.4px, transparent 1.6px);
          background-size: 16px 16px;
          -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 72%);
                  mask-image: radial-gradient(ellipse at center, black 0%, transparent 72%);
        }
        .pb-dots-emerald { background-image: radial-gradient(rgba(16,208,138,0.95) 1.4px, transparent 1.6px); }
        .pb-dots-blue    { background-image: radial-gradient(rgba(79,140,255,0.95) 1.4px, transparent 1.6px); }
        .pb-dots-amber   { background-image: radial-gradient(rgba(245,185,51,0.95) 1.4px, transparent 1.6px); }
      `}</style>

      {/* Corner glows */}
      <div
        className="absolute -top-[20vh] -left-[20vw] h-[70vh] w-[70vw]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(16,208,138,0.45) 0%, rgba(16,208,138,0.18) 30%, transparent 68%)",
        }}
      />
      <div
        className="absolute -top-[15vh] -right-[20vw] h-[65vh] w-[65vw]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(79,140,255,0.42) 0%, rgba(79,140,255,0.18) 32%, transparent 68%)",
        }}
      />
      <div
        className="absolute -bottom-[20vh] -right-[15vw] h-[65vh] w-[65vw]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(245,185,51,0.45) 0%, rgba(245,185,51,0.18) 32%, transparent 68%)",
        }}
      />
      <div
        className="absolute -bottom-[25vh] -left-[15vw] h-[55vh] w-[55vw]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, transparent 62%)",
        }}
      />

      {/* Corner outline shapes */}
      <div
        className="absolute -top-[8vh] -left-[10vw] border-2 border-[#10D08A]/70"
        style={{
          width: "clamp(180px, 34vw, 420px)",
          height: "clamp(180px, 34vw, 420px)",
          borderRadius: "28px",
          transform: "rotate(-18deg)",
          boxShadow: "0 0 40px rgba(16,208,138,0.25)",
        }}
      />
      <div
        className="absolute -top-[6vh] -right-[8vw] border-2 border-[#4F8CFF]/70"
        style={{
          width: "clamp(180px, 32vw, 400px)",
          height: "clamp(180px, 32vw, 400px)",
          borderRadius: "28px",
          transform: "rotate(22deg)",
          boxShadow: "0 0 40px rgba(79,140,255,0.25)",
        }}
      />
      <div
        className="absolute -bottom-[10vh] -right-[10vw] border-2 border-[#F5B933]/70"
        style={{
          width: "clamp(200px, 36vw, 440px)",
          height: "clamp(200px, 36vw, 440px)",
          borderRadius: "28px",
          transform: "rotate(-12deg)",
          boxShadow: "0 0 40px rgba(245,185,51,0.25)",
        }}
      />

      {/* Dumbbell outline bottom-left */}
      <svg
        className="absolute bottom-[8vh] -left-[4vw] text-white/20"
        style={{ width: "clamp(180px, 32vw, 360px)", height: "auto" }}
        viewBox="0 0 200 120"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="4" y="30" width="18" height="60" rx="4" />
        <rect x="22" y="45" width="10" height="30" rx="2" />
        <rect x="32" y="55" width="136" height="10" rx="3" />
        <rect x="168" y="45" width="10" height="30" rx="2" />
        <rect x="178" y="30" width="18" height="60" rx="4" />
      </svg>

      {/* Dot grid clusters */}
      <div
        className="pb-dots pb-dots-emerald absolute"
        style={{ top: "22vh", left: "2vw", width: "clamp(140px, 26vw, 300px)", height: "clamp(140px, 26vw, 300px)", opacity: 1 }}
      />
      <div
        className="pb-dots pb-dots-blue absolute"
        style={{ top: "20vh", right: "2vw", width: "clamp(140px, 26vw, 300px)", height: "clamp(140px, 26vw, 300px)", opacity: 1 }}
      />
      <div
        className="pb-dots pb-dots-amber absolute"
        style={{ bottom: "4vh", left: "50%", transform: "translateX(-50%)", width: "clamp(160px, 34vw, 360px)", height: "clamp(90px, 16vw, 180px)", opacity: 0.95 }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.7) 100%)",
        }}
      />
    </div>
  );
}
