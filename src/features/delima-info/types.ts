import { z } from "zod";

/**
 * Skema DELIMA — sumber kebenaran untuk bentuk data & validasi.
 * Digunakan oleh borang admin, jadual, dan parser Excel.
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
  tahun: z
    .string()
    .trim()
    .min(1, "Tahun wajib diisi")
    .max(40, "Tahun terlalu panjang"),
  kelas: z
    .string()
    .trim()
    .min(1, "Kelas wajib diisi")
    .max(80, "Kelas terlalu panjang"),
  kata_laluan: z
    .string()
    .min(1, "Kata Laluan DELIMA wajib diisi")
    .max(120, "Kata laluan terlalu panjang"),
});

export const delimaFormSchema = delimaSchema.omit({ id: true });

export type Delima = z.infer<typeof delimaSchema>;
export type DelimaFormValues = z.infer<typeof delimaFormSchema>;

/**
 * Senarai "Tahun" yang dicadangkan sebagai fallback. Admin masih boleh taip nilai lain.
 */
export const TAHUN_SUGGESTIONS = [
  "Prasekolah",
  "Tahun 1",
  "Tahun 2",
  "Tahun 3",
  "Tahun 4",
  "Tahun 5",
  "Tahun 6",
] as const;

/**
 * Nama lajur jangkaan untuk parser Excel.
 * Senarai ini mudah dikemas kini apabila spesifikasi xlsx sebenar diterima.
 *
 * Format rasmi yang digunakan oleh fail "SKSFXRESET.xlsx" (sheet "password"):
 *   BIL | ID DELIMA | NAMA | TAHUN | KELAS | PASSWORD | KP
 *
 * Di mana:
 *   - ID DELIMA  = e-mel DELIMA pelajar (cth: m-15247730@moe-dl.edu.my)
 *   - TAHUN      = kod aras (cth: D1, D2, D3, D4, D5, D6)
 *                  UNTUK TAHUN 1: format "D1-XXX" di mana XXX = nama kelas
 *                                  (cth: "D1-CHARITY" → Tahun 1, kelas CHARITY)
 *                  ATAU nilai bebas (cth: "1", "Tahun 1", "Prasekolah")
 *   - KELAS      = nama kelas (CHARITY, FAITH, GLORY, HOPE, PEACE, WISDOM)
 *                  UNTUK TAHUN 1: lajur ini biasanya kosong
 *                                  (nama kelas ada dalam lajur TAHUN sebagai "D1-XXX")
 *   - PASSWORD   = kata laluan DELIMA (cth: DELIMa@2075)
 *   - KP         = tidak digunakan (diabaikan)
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
  tahun: ["tahun", "year", "darjah", "tingkatan", "aras"],
  kelas: ["kelas", "class"],
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
