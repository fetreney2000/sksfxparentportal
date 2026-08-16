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

/**
 * Sahkan token sesi pada permulaan aplikasi.
 * Mengembalikan true jika token masih sah, false jika tamat tempoh/rosak.
 */
export async function validateSession(token: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("validate_session", {
      p_token: token,
    });
    if (error) return false;
    return Boolean(data && data.ok);
  } catch {
    return false;
  }
}

/**
 * Semak sama ada ralat daripada Supabase menandakan sesi tidak sah
 * (token tamat tempoh / rosak). Jika ya, kosongkan sesi supaya app
 * mengalihkan pengguna ke halaman log masuk.
 */
export function handleInvalidSession(error: unknown): void {
  const code = (error as { code?: string } | null)?.code;
  const message = error instanceof Error ? error.message : String(error);
  if (code === "P0001" && message.includes("Sesi")) {
    useAuthStore.getState().clear();
  }
}

/**
 * Tukar nama pengguna & kata laluan admin sendiri.
 * Kata laluan semasa mesti diberikan; token admin disemak di sisi DB.
 */
export async function changeAdminCredentials(params: {
  currentPassword: string;
  newUsername: string;
  newPassword: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = useAuthStore.getState().getToken();
  if (!token) {
    return { ok: false, error: "Sesi tidak sah." };
  }
  const { data, error } = await supabase.rpc("change_admin_credentials", {
    p_token: token,
    p_current_password: params.currentPassword,
    p_new_username: params.newUsername,
    p_new_password: params.newPassword,
  });
  if (error) {
    handleInvalidSession(error);
    return { ok: false, error: error.message };
  }
  if (data && data.ok) {
    return { ok: true };
  }
  return { ok: false, error: data?.error ?? "Gagal menukar kredensial." };
}
