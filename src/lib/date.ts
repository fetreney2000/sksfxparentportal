import { format, formatInTimeZone, toZonedTime } from "date-fns-tz";
import { ms } from "date-fns/locale";

export const KL_TZ = "Asia/Kuala_Lumpur";

/**
 * Memformat tarikh ke format dd/MM/yyyy dalam zon waktu Kuala Lumpur.
 * Terima input Date, string ISO, atau timestamp.
 */
export function formatDateKL(input: Date | string | null | undefined): string {
  if (!input) return "-";
  try {
    return formatInTimeZone(new Date(input), KL_TZ, "dd/MM/yyyy", { locale: ms });
  } catch {
    return "-";
  }
}

/**
 * Memformat tarikh + masa ke dd/MM/yyyy HH:mm dalam zon waktu KL (24 jam).
 */
export function formatDateTimeKL(input: Date | string | null | undefined): string {
  if (!input) return "-";
  try {
    return formatInTimeZone(new Date(input), KL_TZ, "dd/MM/yyyy HH:mm", { locale: ms });
  } catch {
    return "-";
  }
}

/**
 * Memformat masa sahaja (HH:mm) dalam zon waktu KL.
 */
export function formatTimeKL(input: Date | string | null | undefined): string {
  if (!input) return "-";
  try {
    return formatInTimeZone(new Date(input), KL_TZ, "HH:mm", { locale: ms });
  } catch {
    return "-";
  }
}

/**
 * Tarikh & masa semasa di zon waktu KL sebagai objek Date.
 * Berguna untuk nilai lalai borang tarikh.
 */
export function nowKL(): Date {
  return toZonedTime(new Date(), KL_TZ);
}

/**
 * Memformat Date kepada yyyy-MM-dd (format input native HTML date input)
 * dalam zon waktu KL — untuk elak "tergelincir" sehari.
 */
export function toDateInputValueKL(input: Date | string | null | undefined): string {
  if (!input) return "";
  try {
    return formatInTimeZone(new Date(input), KL_TZ, "yyyy-MM-dd");
  } catch {
    return "";
  }
}

/**
 * Dari string yyyy-MM-dd (HTML date input) ke Date yang mewakili tengah malam KL.
 * Digunakan supaya tarikh yang dipilih pengguna kekal pada hari yang sama.
 */
export function fromDateInputValueKL(value: string): Date {
  // value: "yyyy-MM-dd" — kita treat sebagai midnight KL
  return toZonedTime(`${value}T00:00:00`, KL_TZ);
}

/**
 * Helper untuk memaparkan tarikh panjang dalam BM (contoh: 16 Ogos 2026).
 */
export function formatDateLongBM(input: Date | string | null | undefined): string {
  if (!input) return "-";
  try {
    return formatInTimeZone(new Date(input), KL_TZ, "d MMMM yyyy", { locale: ms });
  } catch {
    return "-";
  }
}

/**
 * Re-export util date-fns yang berguna.
 */
export { format, ms };
