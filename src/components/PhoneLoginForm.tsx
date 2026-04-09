import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Phone } from "lucide-react";
import { toast } from "sonner";

type Step = "phone" | "otp";

export function PhoneLoginForm() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: phone.trim() });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("OTP sent to your phone!");
      setStep("otp");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: otp,
      type: "sms",
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully!");
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm">
          <Phone className="h-6 w-6 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-300">
          {step === "phone" ? "Welcome" : "Enter code"}
        </h2>
        <p className="text-sm text-neutral-400">
          {step === "phone"
            ? "Sign in with your phone number"
            : `We sent a code to ${phone}`}
        </p>
      </div>

      {step === "phone" ? (
        <div className="space-y-4">
          <Input
            type="tel"
            placeholder="+1 234 567 8900"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-neutral-900/50 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 backdrop-blur-sm"
          />
          <Button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full bg-primary/80 backdrop-blur-sm hover:bg-primary"
          >
            {loading ? "Sending..." : "Send code"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
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
          <Button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="w-full bg-primary/80 backdrop-blur-sm hover:bg-primary"
          >
            {loading ? "Verifying..." : "Verify & Sign in"}
          </Button>
          <button
            onClick={() => { setStep("phone"); setOtp(""); }}
            className="w-full text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Use a different number
          </button>
        </div>
      )}
    </div>
  );
}
