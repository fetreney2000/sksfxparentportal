import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInAdmin, signOut } from "@/features/auth/api";
import { useAuthStore } from "@/stores/authStore";

export function useAdminAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuthStore((s) => s.setSession);
  const reset = useAuthStore((s) => s.reset);
  const navigate = useNavigate();

  const login = useCallback(
    async (username: string, password: string) => {
      setError(null);
      setIsLoading(true);
      try {
        const result = await signInAdmin(username, password);
        if ("error" in result) {
          setError(result.error);
          return { ok: false, error: result.error };
        }
        // Supabase listener akan set session; kita tetapkan role awal
        setSession(null, "admin");
        navigate("/admin", { replace: true });
        return { ok: true };
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, setSession]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut();
      reset();
      navigate("/admin/login", { replace: true });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, reset]);

  return { login, logout, isLoading, error, setError };
}
