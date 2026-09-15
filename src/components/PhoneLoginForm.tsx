import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Apple, Dumbbell, Lock, Phone } from "lucide-react";
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
    <div className="login-panel w-full max-w-[390px] rounded-[28px] border border-login-accent/70 bg-login-panel/95 px-6 py-7 shadow-login backdrop-blur-md sm:px-8 sm:py-8">
      <div className="text-center">
        <div className="mb-5 flex items-center justify-center gap-2 text-login-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-login-accent text-login-panel">
            <Dumbbell className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold">mygympal<span className="text-login-accent">.in</span></span>
        </div>
        <h1 className="text-[30px] font-extrabold leading-tight text-login-foreground">
          {mode === "login" ? (
            <>Welcome to <span className="block text-login-accent">MY GYM PAL</span></>
          ) : (
            <>Create your <span className="block text-login-accent">GYM ACCOUNT</span></>
          )}
        </h1>
        <p className="mt-3 text-sm leading-6 text-login-muted">
          {mode === "login"
            ? "Manage your gym. Grow your community. All in one place."
            : "New user? Enter your 10-digit phone number and choose a 6-digit PIN"}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-full border-login-foreground bg-login-foreground text-login-panel hover:bg-login-foreground/90 hover:text-login-panel"
        >
          <span className="text-lg font-extrabold text-login-google">G</span>
          Continue with Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-full border-login-accent bg-transparent text-login-foreground hover:bg-login-accent/10 hover:text-login-foreground"
        >
          <Apple className="h-5 w-5" aria-hidden="true" />
          Continue with Apple
        </Button>

        <div className="flex items-center gap-3 py-1 text-xs font-semibold uppercase text-login-muted">
          <span className="h-px flex-1 bg-login-line" />
          Continue with phone
          <span className="h-px flex-1 bg-login-line" />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-login-muted">
            <Phone className="h-3.5 w-3.5" /> Phone number
          </label>
          <Input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="h-11 rounded-xl border-login-line bg-login-input text-login-foreground placeholder:text-login-muted focus-visible:border-login-accent focus-visible:ring-login-accent/40"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-login-muted">
            <Lock className="h-3.5 w-3.5" /> 6-digit PIN
          </label>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={pin} onChange={setPin}>
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="h-11 w-10 rounded-lg border-login-line bg-login-input text-base text-login-foreground focus-visible:border-login-accent focus-visible:ring-login-accent/40 sm:w-11"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="h-12 w-full rounded-full bg-login-accent font-bold text-login-panel shadow-login-button transition-transform hover:bg-login-accent/90 active:scale-[0.98]"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Sign in"
            : "Create account"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setPin("");
          }}
          className="h-auto w-full whitespace-normal py-1 text-[13px] font-normal text-login-muted hover:bg-transparent hover:text-login-accent"
        >
          {mode === "login"
            ? "Don't have an account? create account"
            : "Already have an account? Sign in"}
        </Button>
      </div>
    </div>
  );
}
