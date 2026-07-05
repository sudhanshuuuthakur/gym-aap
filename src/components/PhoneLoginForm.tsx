import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Phone, Lock, Dumbbell } from "lucide-react";
import { toast } from "sonner";

type Mode = "login" | "signup";

export function PhoneLoginForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const email = `${phone.replace(/[^0-9]/g, "")}@phone.local`;

  const handleSubmit = async () => {
    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (pin.length < 6) {
      toast.error("Please enter a 6-digit PIN");
      return;
    }

    if (mode === "signup") {
      const trivialPins = new Set([
        "000000", "111111", "222222", "333333", "444444",
        "555555", "666666", "777777", "888888", "999999",
        "123456", "654321", "012345", "543210", "121212", "123123",
      ]);
      if (trivialPins.has(pin) || /^(\d)\1{5}$/.test(pin)) {
        toast.error("Please choose a less predictable 6-digit PIN");
        return;
      }
    }

    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password: pin,
        options: { data: { phone: cleanPhone } },
      });
      setLoading(false);
      if (error) {
        console.error("Signup error:", error);
        toast.error(error.message || "Unable to create account.");
      } else {
        toast.success("Account created! You're now signed in.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pin,
      });
      setLoading(false);
      if (error) {
        toast.error("No account found. Please create one below.");
        setMode("signup");
        setPin("");
      } else {
        toast.success("Signed in!");
      }
    }
  };

  return (
    <div className="w-full max-w-sm rounded-[22px] border border-white/[0.06] bg-[#121821]/95 backdrop-blur-xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#22C55E]/12 border border-[#22C55E]/25">
          <Dumbbell className="h-6 w-6 text-[#22C55E]" strokeWidth={2.25} />
        </div>
        <h2 className="text-[26px] font-bold tracking-tight text-white">
          {mode === "login" ? "Gym Manager" : "Create account"}
        </h2>
        <p className="text-[13px] text-[#94A3B8]">
          {mode === "login"
            ? "Sign in with your phone number & PIN"
            : "New user? Enter your 10-digit phone number and choose a 6-digit PIN"}
        </p>
      </div>

      <div className="space-y-5 mt-8">
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> Phone number
          </label>
          <Input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="bg-[#181F2A] border-white/[0.06] text-white placeholder:text-[#475569] h-11 rounded-xl focus-visible:ring-[#22C55E]/40 focus-visible:border-[#22C55E]/60"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> 6-digit PIN
          </label>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={pin} onChange={setPin}>
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="bg-[#181F2A] border-white/[0.06] text-white h-12 w-11 text-lg rounded-xl focus-visible:ring-[#22C55E]/40 focus-visible:border-[#22C55E]/60"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-11 rounded-full bg-[#22C55E] hover:bg-[#22C55E]/90 text-[#0B0F14] font-semibold shadow-[0_8px_24px_rgba(34,197,94,0.25)] transition-all active:scale-[0.98]"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Sign in"
            : "Create account"}
        </Button>

        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setPin("");
          }}
          className="w-full text-[13px] text-[#94A3B8] hover:text-[#22C55E] transition-colors"
        >
          {mode === "login"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
