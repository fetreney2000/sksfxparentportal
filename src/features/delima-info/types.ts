import { z } from "zod";

/**
 * Skema DELIMA — sumber kebenaran untuk bentuk data & validasi.
 * Digunakan oleh borang admin, jadual, dan parser Excel.
 *
 * NOTA: Medan "tahun" dan "kelas" telah dikeluarkan daripada sistem.
 */
export const delimaSchema = z.object({
  id: z.string().uuid().optional(),
  delima_id: z
    .string()
    .trim()
    .min(1, "ID Delima wajib diisi")
    .max(64, "ID Delima terlalu panjang"),
  nama: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi")
    .max(120, "Nama terlalu panjang"),
  kata_laluan: z
    .string()
    .min(1, "Kata Laluan DELIMA wajib diisi")
    .max(120, "Kata laluan terlalu panjang"),
});

export const delimaFormSchema = delimaSchema.omit({ id: true });

export type Delima = z.infer<typeof delimaSchema>;
export type DelimaFormValues = z.infer<typeof delimaFormSchema>;

/**
 * Nama lajur jangkaan untuk parser Excel.
 * Senarai ini mudah dikemas kini apabila spesifikasi xlsx sebenar diterima.
 *
 * Format rasmi yang digunakan oleh fail "SKSFXRESET.xlsx" (sheet "password"):
 *   BIL | ID DELIMA | NAMA | TAHUN | KELAS | PASSWORD | KP
 *
 * Hanya tiga lajur yang diimport (lajur lain diabaikan):
 *   - ID DELIMA  = e-mel DELIMA pelajar (cth: m-15247730@moe-dl.edu.my)
 *   - NAMA       = nama penuh pelajar
 *   - PASSWORD   = kata laluan DELIMA (cth: DELIMa@2075)
 */
export const EXPECTED_EXCEL_HEADERS: Record<keyof Omit<DelimaFormValues, never>, string[]> = {
  delima_id: [
    "id delima",
    "delima id",
    "delima_id",
    "id_delima",
    "no delima",
    "no. delima",
    "idpelajar",
    "id murid",
  ],
  nama: [
    "nama",
    "nama penuh",
    "nama pelajar",
    "nama murid",
    "student name",
    "name",
    "first name",
  ],
  kata_laluan: [
    "kata laluan",
    "kata_laluan",
    "password",
    "katalaluan",
    "delima password",
    "katalaluan delima",
  ],
};

export type DelimaFieldKey = keyof Omit<DelimaFormValues, never>;
