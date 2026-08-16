import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/stores/authStore";
import { validateSession } from "@/features/auth/api";
import { AppRouter } from "@/app/router";

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
  const session = useAuthStore((s) => s.session);
  const setStatus = useAuthStore((s) => s.setStatus);
  const clear = useAuthStore((s) => s.clear);

  // Sesi tiada dalam Supabase Auth — dipulihkan dari localStorage.
  // Sahkan token terhadap pangkalan data; jika tidak sah/tamat tempoh,
  // bersihkan sesi dan pengguna diarahkan semula ke log masuk.
  useEffect(() => {
    let active = true;

    if (!session?.token) {
      setStatus("unauthenticated");
      return;
    }

    (async () => {
      const ok = await validateSession(session.token);
      if (!active) return;
      if (ok) {
        setStatus("authenticated");
      } else {
        clear();
      }
    })();

    return () => {
      active = false;
    };
  }, [session, setStatus, clear]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
