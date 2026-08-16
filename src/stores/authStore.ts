import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "parent" | "admin";

export interface AuthState {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  /** Status muat-naik session awal */
  status: "loading" | "unauthenticated" | "authenticated";

  setSession: (session: Session | null, role: AppRole | null) => void;
  setStatus: (status: AuthState["status"]) => void;
  reset: () => void;

  isParent: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      role: null,
      status: "loading",

      setSession: (session, role) =>
        set({
          session,
          user: session?.user ?? null,
          role,
          status: session ? "authenticated" : "unauthenticated",
        }),

      setStatus: (status) => set({ status }),

      reset: () =>
        set({
          session: null,
          user: null,
          role: null,
          status: "unauthenticated",
        }),

      isParent: () => get().role === "parent",
      isAdmin: () => get().role === "admin",
    }),
    {
      name: "sfxk-auth",
      partialize: (s) => ({ session: s.session, user: s.user, role: s.role }),
    }
  )
);
