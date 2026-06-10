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
    if (cleanPhone.length < 7) {
      toast.error("Please enter a valid phone number");
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
        toast.error("Unable to create account. Please check your details and try again.");
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
        toast.error("Invalid phone number or PIN");
      } else {
        toast.success("Signed in!");
      }
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm">
          <Phone className="h-6 w-6 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-300">
          {mode === "login" ? "Gym Manager" : "Create account"}
        </h2>
        <p className="text-sm text-neutral-400">
          {mode === "login"
            ? "Sign in with your phone number & PIN"
            : "Enter your phone number & choose a 6-digit PIN"}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> Phone number
          </label>
          <Input
            type="tel"
            placeholder="+1 234 567 8900"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-neutral-900/50 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 backdrop-blur-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> 6-digit PIN
          </label>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={pin} onChange={setPin}>
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="bg-neutral-900/50 border-neutral-700 text-neutral-100"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-primary/80 backdrop-blur-sm hover:bg-primary"
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
          className="w-full text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          {mode === "login"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
