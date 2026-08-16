import { supabase } from "@/lib/supabaseClient";
import type { Delima, DelimaFormValues } from "./types";

export interface DelimaRow extends Delima {
  created_at: string;
  updated_at: string;
}

/**
 * Dapatkan senarai semua pelajar (admin sahaja, RLS menyekat parent).
 */
export async function fetchAllDelima(): Promise<DelimaRow[]> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("tahun", { ascending: true })
    .order("kelas", { ascending: true })
    .order("nama", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as DelimaRow[];
}

/**
 * Dapatkan senarai anak jagaan untuk ibu bapa yang sedang log masuk.
 * RLS akan tapis supaya hanya anak sendiri dipaparkan.
 */
export async function fetchChildrenForCurrentGuardian(): Promise<DelimaRow[]> {
  const { data, error } = await supabase
    .from("students")
    .select("*, guardian_student!inner(guardian_id, guardians!inner(email))")
    .order("nama", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as DelimaRow[];
}

/**
 * Dapatkan senarai ID Delima sedia ada (untuk pengesahan import).
 */
export async function fetchExistingDelimaIds(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("students")
    .select("delima_id");
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((r) => r.delima_id));
}

/**
 * Tambah rekod DELIMA baharu.
 */
export async function createDelima(values: DelimaFormValues): Promise<DelimaRow> {
  const { data, error } = await supabase
    .from("students")
    .insert(values)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as DelimaRow;
}

/**
 * Kemas kini rekod DELIMA berdasarkan id.
 */
export async function updateDelima(
  id: string,
  values: DelimaFormValues
): Promise<DelimaRow> {
  const { data, error } = await supabase
    .from("students")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as DelimaRow;
}

/**
 * Padam rekod DELIMA berdasarkan id.
 */
export async function deleteDelima(id: string): Promise<void> {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Semak sama ada delima_id sudah wujud (untuk pengesahan unik di borang).
 */
export async function checkDelimaIdExists(
  delimaId: string,
  excludeId?: string
): Promise<boolean> {
  let q = supabase
    .from("students")
    .select("id")
    .eq("delima_id", delimaId);
  if (excludeId) q = q.neq("id", excludeId);
  const { data, error } = await q.maybeSingle();
  if (error) return false;
  return Boolean(data);
}

/**
 * Insert/upsert berkelompok.
 */
export async function batchUpsertDelima(
  rows: DelimaFormValues[],
  conflictStrategy: "upsert" | "skip"
): Promise<{ success: number; failed: number; errors: { row: number; error: string }[] }> {
  let success = 0;
  const failed: { row: number; error: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      if (conflictStrategy === "upsert") {
        const { error } = await supabase
          .from("students")
          .upsert(row, { onConflict: "delima_id" });
        if (error) throw new Error(error.message);
        success++;
      } else {
        // skip: cuba insert; jika conflict, abaikan
        const { error } = await supabase.from("students").insert(row);
        if (error) {
          if (error.code === "23505") {
            // duplicate — skip
            continue;
          }
          throw new Error(error.message);
        }
        success++;
      }
    } catch (e) {
      failed.push({ row: i, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return { success, failed: failed.length, errors: failed };
}

/**
 * Log import ke jadual import_logs.
 */
export async function logImport(params: {
  filename: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  errorDetail?: unknown;
}): Promise<void> {
  // imported_by boleh null jika context admin tiada
  let importedBy: string | null = null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: adm } = await supabase
        .from("admins")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      importedBy = adm?.id ?? null;
    }
  } catch {
    // abaikan
  }

  await supabase.from("import_logs").insert({
    imported_by: importedBy,
    filename: params.filename,
    total_rows: params.totalRows,
    success_rows: params.successRows,
    failed_rows: params.failedRows,
    error_detail: params.errorDetail ?? null,
  });
}

export async function fetchImportLogs(): Promise<
  Array<{
    id: string;
    filename: string | null;
    total_rows: number | null;
    success_rows: number | null;
    failed_rows: number | null;
    created_at: string;
    imported_by: string | null;
  }>
> {
  const { data, error } = await supabase
    .from("import_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []) as never;
}
