import * as XLSX from "xlsx";
import {
  EXPECTED_EXCEL_HEADERS,
  type DelimaFieldKey,
  type DelimaFormValues,
} from "../types";

export interface ParsedRow {
  rowNumber: number; // 1-based, referring to the original sheet row
  raw: Record<string, unknown>;
  mapped: Partial<DelimaFormValues>;
  notes: string[]; // pemerhatian/pelarasan automatik
}

export interface ParseResult {
  headers: string[];
  rows: ParsedRow[];
  /** Baris ke-1 (1-based) di mana data mula dalam helaian (berguna untuk mesej). */
  dataStartRow: number;
}

/**
 * Baca fail Excel (.xlsx) dan kembalikan senarai header + baris mentah.
 *
 * Mengendalikan format umum helaian DELIMA:
 *  - Baris 1: mungkin mengandungi tajuk helaian (cth: "Sheet: password")
 *  - Baris 2: biasanya header lajur (BIL, ID DELIMA, NAMA, TAHUN, KELAS, PASSWORD, KP)
 *  - Baris 3+: data pelajar
 *
 * Fungsi ini cuba mengesan baris header sebenar secara automatik dengan
 * mencari baris pertama yang mengandungi beberapa nama lajur yang dikenali.
 */
export function parseDelimaExcel(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];

        // Baca sebagai array-of-arrays supaya kita boleh kesan baris header
        const aoa = XLSX.utils.sheet_to_json<(string | number)[]>(ws, {
          header: 1,
          defval: "",
          raw: false,
        });

        // Cari baris header: baris pertama yang mempunyai >= 2 lajur yang
        // sepadan dengan nama yang dikenali.
        let headerRowIdx = 0;
        const knownNames = Object.values(EXPECTED_EXCEL_HEADERS)
          .flat()
          .map((n) => normalize(n));

        for (let i = 0; i < Math.min(aoa.length, 10); i++) {
          const row = aoa[i] ?? [];
          const matches = row.filter(
            (c) => knownNames.includes(normalize(String(c ?? "")))
          ).length;
          if (matches >= 2) {
            headerRowIdx = i;
            break;
          }
        }

        const headerRow = (aoa[headerRowIdx] ?? []).map((c) => String(c ?? "").trim());
        const headers = headerRow.filter((h) => h.length > 0);

        const dataRows: ParsedRow[] = [];
        for (let i = headerRowIdx + 1; i < aoa.length; i++) {
          const arr = aoa[i] ?? [];
          // Abaikan baris yang sepenuhnya kosong
          if (arr.every((c) => String(c ?? "").trim() === "")) continue;
          const raw: Record<string, unknown> = {};
          headers.forEach((h, idx) => {
            raw[h] = arr[idx] ?? "";
          });
          dataRows.push({
            rowNumber: i + 1,
            raw,
            mapped: {},
            notes: [],
          });
        }

        resolve({
          headers,
          rows: dataRows,
          dataStartRow: headerRowIdx + 2, // 1-based
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Cuba auto-padankan header fail dengan medan sistem (fuzzy match).
 * Kembalikan mapping `DelimaFieldKey -> headerName`.
 */
export function autoMapHeaders(headers: string[]): Record<DelimaFieldKey, string> {
  const normalizedHeaders = headers.map((h) => ({ raw: h, norm: normalize(h) }));
  const map: Record<DelimaFieldKey, string> = {
    delima_id: "",
    nama: "",
    kata_laluan: "",
  };

  (Object.keys(EXPECTED_EXCEL_HEADERS) as DelimaFieldKey[]).forEach((field) => {
    const candidates = EXPECTED_EXCEL_HEADERS[field].map(normalize);
    // Cari padanan tepat dahulu
    let matched = normalizedHeaders.find((h) => candidates.includes(h.norm));
    if (!matched) {
      // fuzzy: substring
      matched = normalizedHeaders.find((h) =>
        candidates.some((c) => h.norm.includes(c) || c.includes(h.norm))
      );
    }
    if (matched) {
      map[field] = matched.raw;
    }
  });

  return map;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Jana templat xlsx kosong untuk dimuat turun oleh admin.
 *
 * Format lajur menepati fail DELIMA standard sekolah (sheet "password"):
 *   BIL | ID DELIMA | NAMA | TAHUN | KELAS | PASSWORD | KP
 *
 * Hanya tiga lajur diimport: ID DELIMA, NAMA, PASSWORD.
 * Lajur lain (BIL, TAHUN, KELAS, KP) disertakan untuk padan dengan fail
 * sumber sekolah tetapi DIABAIKAN oleh parser.
 */
export function generateDelimaTemplate(): Blob {
  const headers = [
    "BIL",
    "ID DELIMA",
    "NAMA",
    "TAHUN",
    "KELAS",
    "PASSWORD",
    "KP",
  ];
  const examples = [
    ["1", "m-15247730@moe-dl.edu.my", "ABDURRAUF BIN JUAT", "D2", "CHARITY", "DELIMa@2075", ""],
    ["2", "m-231203018922@moe-dl.edu.my", "ABNER JACKFEREDDU", "D1-CHARITY", "", "DELIMa@2078", ""],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...examples]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DELIMA");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * Jana fail .xlsx log ralat untuk dimuat turun oleh admin.
 */
export function generateErrorLog(
  failedRows: Array<{
    row: number;
    error: string;
    delima_id?: string;
    data: Partial<DelimaFormValues>;
  }>
): Blob {
  const headers = ["Baris", "Ralat", "ID Delima", "Nama", "Kata Laluan"];
  const aoa = [
    headers,
    ...failedRows.map((f) => [
      String(f.row),
      f.error,
      f.delima_id ?? f.data.delima_id ?? "",
      f.data.nama ?? "",
      f.data.kata_laluan ?? "",
    ]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ralat");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
