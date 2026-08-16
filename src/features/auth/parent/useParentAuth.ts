import { useCallback, useState } from "react";
import {
  sendGuardianOtp,
  signOut,
  verifyGuardianOtp,
} from "@/features/auth/api";
import { useAuthStore } from "@/stores/authStore";
import { bm } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";

export function useParentAuth() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuthStore((s) => s.setSession);
  const reset = useAuthStore((s) => s.reset);
  const navigate = useNavigate();

  const sendOtp = useCallback(
    async (value: string) => {
      setError(null);
      setIsLoading(true);
      try {
        const result = await sendGuardianOtp(value);
        if ("error" in result) {
          // Ralat khusus "auth.emailNotRegistered" => guna kamus
          const msg =
            result.error === "auth.emailNotRegistered"
              ? bm.auth.emailNotRegistered
              : result.error;
          setError(msg);
          return { ok: false, error: msg };
        }
        setEmail(value.trim().toLowerCase());
        setStep("code");
        return { ok: true };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const verifyOtp = useCallback(
    async (code: string) => {
      setError(null);
      setIsLoading(true);
      try {
        const result = await verifyGuardianOtp(email, code);
        if ("error" in result) {
          setError(result.error);
          return { ok: false, error: result.error };
        }
        // Supabase listener akan tetapkan session di App.tsx.
        // Kita tetapkan role parent di sini supaya tidak bergantung race condition.
        setSession(null, "parent");
        navigate("/portal/delima-info", { replace: true });
        return { ok: true };
      } finally {
        setIsLoading(false);
      }
    },
    [email, navigate, setSession]
  );

  const resendOtp = useCallback(async () => {
    return sendOtp(email);
  }, [email, sendOtp]);

  const back = useCallback(() => {
    setStep("email");
    setError(null);
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut();
      reset();
      navigate("/login", { replace: true });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, reset]);

  return {
    step,
    email,
    isLoading,
    error,
    setEmail,
    sendOtp,
    verifyOtp,
    resendOtp,
    back,
    logout,
  };
}
