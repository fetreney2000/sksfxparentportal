import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/stores/authStore";
import { handleInvalidSession } from "@/features/auth/api";
import type { DelimaFormValues } from "./types";

export interface StudentRow extends DelimaFormValues {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ImportLogRow {
  id: string;
  imported_by: string | null;
  filename: string | null;
  total_rows: number | null;
  success_rows: number | null;
  failed_rows: number | null;
  error_detail: unknown;
  created_at: string;
}

type BatchError = { index: number; delima_id: string; error: string };
type FailedResult = { success: number; failed: number; errors: BatchError[] };

function getToken(): string | null {
  return useAuthStore.getState().getToken();
}

function authError(): never {
  throw new Error("Sesi tidak sah atau telah tamat tempoh. Sila log masuk semula.");
}

/**
 * Lempar ralat RPC; jika ralat menandakan sesi tidak sah, kosongkan sesi.
 */
function rpcError(error: unknown): never {
  handleInvalidSession(error);
  throw error instanceof Error ? error : new Error(String(error));
}

/**
 * Ibu bapa: dapatkan maklumat pelajar sendiri (token guardian / delima_id).
 *
 * Menggunakan `get_guardian_student` untuk data terkini. Jika RPC itu tidak
 * tersedia (cth. fungsi belum dimigrasi di pangkalan data), fungsi ini
 * mengembalikan snapshot pelajar yang disimpan semasa log masuk
 * (daripada `login_guardian`) supaya halaman ibu bapa tetap berfungsi.
 */
export async function fetchGuardianStudent(): Promise<StudentRow> {
  const token = getToken();
  if (!token) authError();
  const session = useAuthStore.getState().session;

  try {
    const { data, error } = await supabase.rpc("get_guardian_student", {
      p_token: token,
    });
    if (!error && data && data.length > 0) {
      return data[0] as StudentRow;
    }
  } catch {
    // gugur ke fallback di bawah
  }

  // Fallback: snapshot daripada log masuk
  if (session?.student) {
    return session.student as StudentRow;
  }
  throw new Error("Tiada rekod pelajar untuk ID DELIMA ini.");
}

/**
 * Admin: senarai semua pelajar.
 */
export async function fetchAllDelima(): Promise<StudentRow[]> {
  const token = getToken();
  if (!token) authError();
  const { data, error } = await supabase.rpc("list_students_admin", { p_token: token });
  if (error) rpcError(error);
  return (data ?? []) as StudentRow[];
}

/**
 * Admin: senarai ID Delima sedia ada (untuk pengesahan import).
 */
export async function fetchExistingDelimaIds(): Promise<Set<string>> {
  const token = getToken();
  if (!token) authError();
  const { data, error } = await supabase.rpc("list_student_ids_admin", { p_token: token });
  if (error) rpcError(error);
  return new Set((data ?? []).map((v: unknown) => String(v)));
}

/**
 * Admin: tambah rekod baharu.
 */
export async function createDelima(values: DelimaFormValues): Promise<void> {
  const token = getToken();
  if (!token) authError();
  const { error } = await supabase.rpc("create_student_admin", {
    p_token: token,
    p_delima_id: values.delima_id,
    p_nama: values.nama,
    p_kata_laluan: values.kata_laluan,
  });
  if (error) rpcError(error);
}

/**
 * Admin: kemas kini rekod.
 */
export async function updateDelima(
  id: string,
  values: DelimaFormValues
): Promise<void> {
  const token = getToken();
  if (!token) authError();
  const { error } = await supabase.rpc("update_student_admin", {
    p_token: token,
    p_id: id,
    p_delima_id: values.delima_id,
    p_nama: values.nama,
    p_kata_laluan: values.kata_laluan,
  });
  if (error) rpcError(error);
}

/**
 * Admin: padam rekod.
 */
export async function deleteDelima(id: string): Promise<void> {
  const token = getToken();
  if (!token) authError();
  const { error } = await supabase.rpc("delete_student_admin", {
    p_token: token,
    p_id: id,
  });
  if (error) rpcError(error);
}

/**
 * Admin: insert/upsert berkelompok.
 */
export async function batchUpsertDelima(
  rows: DelimaFormValues[],
  conflictStrategy: "upsert" | "skip"
): Promise<FailedResult> {
  const token = getToken();
  if (!token) authError();
  const { data, error } = await supabase.rpc("batch_upsert_students_admin", {
    p_token: token,
    p_rows: rows,
    p_conflict: conflictStrategy,
  });
  if (error) rpcError(error);
  const ok = data && typeof data === "object" && "success" in data
    ? (data as { success: number; failed: number; errors?: unknown[] })
    : { success: 0, failed: 0, errors: [] };
  return {
    success: ok.success,
    failed: ok.failed,
    errors:
      ok.failed > 0 && Array.isArray(ok.errors)
        ? ok.errors
            .map((e) => {
              const obj = e && typeof e === "object" ? (e as Record<string, unknown>) : {};
              return {
                index: Number(obj.index ?? NaN),
                delima_id: String(obj.delima_id ?? ""),
                error: String(obj.error ?? "Ralat tidak diketahui"),
              };
            })
            .filter((err) => !Number.isNaN(err.index))
        : [],
  };
}

/**
 * Admin: log import.
 */
export async function logImport(params: {
  filename: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  errorDetail?: unknown;
}): Promise<void> {
  const token = getToken();
  if (!token) authError();
  const { error } = await supabase.rpc("log_import", {
    p_token: token,
    p_filename: params.filename,
    p_total: params.totalRows,
    p_success: params.successRows,
    p_failed: params.failedRows,
    p_error: params.errorDetail ?? null,
  });
  if (error) rpcError(error);
}

/**
 * Admin: sejarah import.
 */
export async function fetchImportLogs(): Promise<ImportLogRow[]> {
  const token = getToken();
  if (!token) authError();
  const { data, error } = await supabase.rpc("list_import_logs_admin", {
    p_token: token,
  });
  if (error) rpcError(error);
  return (data ?? []) as ImportLogRow[];
}
