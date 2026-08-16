import { supabase } from "@/lib/supabaseClient";
import { useAuthStore, type AppRole } from "@/stores/authStore";
import type { StudentRow } from "@/features/delima-info/api";

interface AuthFail {
  ok: false;
  error: string;
}
interface AuthOk<T extends AppRole = AppRole> {
  ok: true;
  role: T;
}

/**
 * Log masuk admin menggunakan username + kata laluan.
 * Kredensial disimpan dalam jadual `admins` (bukan Supabase Auth).
 */
export async function signInAdmin(
  username: string,
  password: string
): Promise<AuthFail | AuthOk<"admin">> {
  const { data, error } = await supabase.rpc("authenticate_admin", {
    p_username: username,
    p_password: password,
  });
  if (error || !data || !data.ok) {
    return { ok: false, error: data?.error ?? "Nama pengguna atau kata laluan salah." };
  }
  useAuthStore.getState().setSession({
    token: data.token,
    role: "admin",
    username: data.username,
    name: data.name,
  });
  return { ok: true, role: "admin" };
}

/**
 * Log masuk ibu bapa/penjaga menggunakan ID DELIMA anak (tiada kata laluan).
 * ID DELIMA berfungsi sebagai kredensial — dikenali oleh pihak sekolah.
 */
export async function signInGuardian(
  delimaId: string
): Promise<AuthFail | AuthOk<"guardian">> {
  const { data, error } = await supabase.rpc("login_guardian", {
    p_delima_id: delimaId,
  });
  if (error || !data || !data.ok) {
    return { ok: false, error: data?.error ?? "ID DELIMA tidak dijumpai." };
  }
  useAuthStore.getState().setSession({
    token: data.token,
    role: "guardian",
    delimaId: String(data.student?.delima_id ?? delimaId),
    student: (data.student as StudentRow) ?? null,
  });
  return { ok: true, role: "guardian" };
}

/**
 * Log keluar (2 jenis peranan) — kosongkan sesi tempatan sahaja.
 */
export function signOut(): void {
  useAuthStore.getState().clear();
}
