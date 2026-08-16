import { supabase } from "@/lib/supabaseClient";
import type { AppRole } from "@/stores/authStore";

/**
 * Semak sama ada auth user adalah admin berdasarkan jadual admins.
 * Digunakan untuk AuthProvider + ProtectedRoute.
 */
export async function checkAdminRole(authUserId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("admins")
      .select("id")
      .eq("auth_user_id", authUserId)
      .maybeSingle();
    if (error) return false;
    return Boolean(data);
  } catch {
    return false;
  }
}

/**
 * Semak sama ada e-mel wujud dalam jadual guardians (tanpa mendedahkan data lain).
 * Ibu bapa mesti berdaftar dulu sebelum boleh log masuk.
 */
export async function isGuardianEmailRegistered(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  try {
    const { data, error } = await supabase
      .from("guardians")
      .select("id")
      .eq("email", normalized)
      .maybeSingle();
    if (error) return false;
    return Boolean(data);
  } catch {
    return false;
  }
}

/**
 * Dapatkan mapping username admin → e-mel sintetik Supabase.
 * Konvensyen: <username>@admin.sfxkeningau.internal
 */
export function buildAdminEmail(username: string): string {
  const clean = username.trim().toLowerCase();
  return `${clean}@admin.sfxkeningau.internal`;
}

/**
 * Log masuk admin menggunakan username + kata laluan.
 */
export async function signInAdmin(
  username: string,
  password: string
): Promise<{ role: AppRole } | { error: string }> {
  const email = buildAdminEmail(username);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.session) {
    return { error: "Nama pengguna atau kata laluan salah." };
  }
  // Pastikan pengguna sememangnya admin
  const ok = await checkAdminRole(data.user.id);
  if (!ok) {
    await supabase.auth.signOut();
    return { error: "Akaun ini bukan akaun pentadbir." };
  }
  return { role: "admin" };
}
/**
 * Hantar OTP ke e-mel penjaga.
 * PRA-SEMAK: e-mel mesti wujud dalam jadual guardians.
 */
export async function sendGuardianOtp(
  email: string
): Promise<{ ok: true } | { error: string }> {
  const normalized = email.trim().toLowerCase();
  const registered = await isGuardianEmailRegistered(normalized);
  if (!registered) {
    return { error: "auth.emailNotRegistered" };
  }
  const { error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: {
      shouldCreateUser: false,
    },
  });
  if (error) {
    return { error: error.message };
  }
  return { ok: true };
}

/**
 * Sahkan OTP dan log masuk.
 */
export async function verifyGuardianOtp(
  email: string,
  token: string
): Promise<{ ok: true } | { error: string }> {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.verifyOtp({
    email: normalized,
    token,
    type: "email",
  });
  if (error || !data.session) {
    return { error: error?.message || "Kod pengesahan tidak sah." };
  }
  return { ok: true };
}

/**
 * Log keluar (semua peranan).
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
