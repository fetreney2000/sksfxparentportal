import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StudentRow } from "@/features/delima-info/api";

export type AppRole = "guardian" | "admin";

export interface AppSession {
  token: string;
  role: AppRole;
  /** Admin sahaja */
  username?: string;
  name?: string;
  /** Guardian sahaja — ID DELIMA anak jagaan */
  delimaId?: string;
  student?: StudentRow | null;
}

export interface AuthState {
  session: AppSession | null;
  status: "loading" | "unauthenticated" | "authenticated";

  setSession: (session: AppSession | null) => void;
  setStatus: (status: AuthState["status"]) => void;
  clear: () => void;
  updateUsername: (username: string) => void;

  isAdmin: () => boolean;
  isGuardian: () => boolean;
  getToken: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      status: "loading",

      setSession: (session) =>
        set({
          session,
          status: session ? "authenticated" : "unauthenticated",
        }),

      setStatus: (status) => set({ status }),

      clear: () =>
        set({ session: null, status: "unauthenticated" }),

      updateUsername: (username) =>
        set((s) =>
          s.session ? { session: { ...s.session, username } } : {}
        ),

      isAdmin: () => get().session?.role === "admin",
      isGuardian: () => get().session?.role === "guardian",
      getToken: () => get().session?.token ?? null,
    }),
    {
      name: "sfxk-auth",
      partialize: (s) => ({ session: s.session }),
    }
  )
);
