import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInGuardian, signOut } from "@/features/auth/api";
import { useAuthStore } from "@/stores/authStore";

export function useParentAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  const login = useCallback(
    async (delimaId: string) => {
      setError(null);
      setIsLoading(true);
      try {
        const result = await signInGuardian(delimaId);
        if (!result.ok) {
          setError(result.error);
          return { ok: false, error: result.error };
        }
        navigate("/portal/delima-info", { replace: true });
        return { ok: true };
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const logout = useCallback(async () => {
    signOut();
    setSession(null);
    navigate("/login", { replace: true });
  }, [navigate, setSession]);

  return { login, logout, isLoading, error };
}
