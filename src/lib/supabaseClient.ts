import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Supabase] VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY tidak ditetapkan. " +
      "Sila salin .env.example ke .env dan isi nilai yang betul."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: "sfxk-parent-portal",
  },
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
