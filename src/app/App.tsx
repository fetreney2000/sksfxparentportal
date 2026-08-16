import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/stores/authStore";
import { AppRouter } from "@/app/router";
import { checkAdminRole } from "@/features/auth/api";
import { toast } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export function App() {
  const setSession = useAuthStore((s) => s.setSession);
  const setStatus = useAuthStore((s) => s.setStatus);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!mounted) return;
        if (session?.user) {
          const isAdmin = await checkAdminRole(session.user.id);
          setSession(session, isAdmin ? "admin" : "parent");
        } else {
          setStatus("unauthenticated");
        }
      } catch (e) {
        if (mounted) {
          setStatus("unauthenticated");
          toast.error("Sesi tidak dapat dimuatkan.");
        }
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        const isAdmin = await checkAdminRole(session.user.id);
        setSession(session, isAdmin ? "admin" : "parent");
      } else {
        setSession(null, null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setSession, setStatus]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
