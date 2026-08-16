import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/stores/authStore";
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

  // Sesi tiada dalam Supabase Auth — hanya dipulihkan dari localStorage.
  useEffect(() => {
    if (session) {
      setStatus("authenticated");
    } else {
      setStatus("unauthenticated");
    }
  }, [session, setStatus]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
