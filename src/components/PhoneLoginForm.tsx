import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Phone, Lock } from "lucide-react";
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
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1117]/65 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1a2332]/80 border border-[#2a3a50]">
          <Phone className="h-7 w-7 text-[#5ec3ff]" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white">
          {mode === "login" ? "Gym Manager" : "Create account"}
        </h2>
        <p className="text-sm text-[#94a3b8]">
          {mode === "login"
            ? "Sign in with your phone number & PIN"
            : "New user? Enter your 10-digit phone number and choose a 6-digit PIN"}
        </p>
      </div>

      <div className="space-y-5 mt-8">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-[#64748b] flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> Phone number
          </label>
          <Input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="bg-[#111827]/70 border-[#2a3a50] text-white placeholder:text-[#475569] h-11 focus-visible:ring-[#5ec3ff]/40 focus-visible:border-[#5ec3ff]/60"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-[#64748b] flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> 6-digit PIN
          </label>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={pin} onChange={setPin}>
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="bg-[#111827]/70 border-[#2a3a50] text-white h-12 w-11 text-lg focus-visible:ring-[#5ec3ff]/40 focus-visible:border-[#5ec3ff]/60"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-11 bg-[#5ec3ff] hover:bg-[#7dd1ff] text-[#0b1120] font-semibold shadow-[0_4px_14px_rgba(94,195,255,0.25)] transition-all"
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
          className="w-full text-sm text-[#94a3b8] hover:text-[#5ec3ff] transition-colors"
        >
          {mode === "login"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
