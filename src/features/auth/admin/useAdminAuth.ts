import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInAdmin, signOut } from "@/features/auth/api";
import { useAuthStore } from "@/stores/authStore";

export function useAdminAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  const login = useCallback(
    async (username: string, password: string) => {
      setError(null);
      setIsLoading(true);
      try {
        const result = await signInAdmin(username, password);
        if (!result.ok) {
          setError(result.error);
          return { ok: false, error: result.error };
        }
        // Penonton (viewer) dibawa terus ke senarai ID DELIMA
        navigate(result.role === "viewer" ? "/admin/delima-info" : "/admin", {
          replace: true,
        });
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
    navigate("/admin/login", { replace: true });
  }, [navigate, setSession]);

  return { login, logout, isLoading, error };
}
