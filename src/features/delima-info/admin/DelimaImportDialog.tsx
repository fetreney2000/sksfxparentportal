import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  CheckCircle2,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { bm } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { delimaFormSchema, EXPECTED_EXCEL_HEADERS, type DelimaFieldKey, type DelimaFormValues } from "../types";
import {
  autoMapHeaders,
  generateDelimaTemplate,
  generateErrorLog,
  parseDelimaExcel,
  type ParsedRow,
} from "./parseDelimaExcel";
import {
  useBatchUpsertDelima,
  useExistingDelimaIds,
  useLogImport,
} from "../queries";

interface DelimaImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ConflictStrategy = "upsert" | "skip";

export function DelimaImportDialog({ open, onOpenChange }: DelimaImportDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [dataStartRow, setDataStartRow] = useState(2);
  const [showSpec, setShowSpec] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [mapping, setMapping] = useState<Record<DelimaFieldKey, string>>({
    delima_id: "",
    nama: "",
    kata_laluan: "",
  });
  const [strategy, setStrategy] = useState<ConflictStrategy>("upsert");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    success: number;
    failed: number;
    errors: { row: number; delima_id: string; error: string; data: Partial<DelimaFormValues> }[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: existingIds } = useExistingDelimaIds();
  const batchUpsert = useBatchUpsertDelima();
  const logImport = useLogImport();

  // Reset state bila dialog dibuka
  const handleOpenChange = (next: boolean) => {
    if (next) {
      setStep(1);
      setFile(null);
      setHeaders([]);
      setRows([]);
      setDataStartRow(2);
      setMapping({ delima_id: "", nama: "", kata_laluan: "" });
      setStrategy("upsert");
      setProgress(0);
      setResult(null);
      // Tunjuk spec secara lalai untuk admin yang pertama kali menggunakan
      const dismissed = localStorage.getItem("sfxk-delima-spec-dismissed") === "1";
      setShowSpec(!dismissed);
    }
    onOpenChange(next);
  };

  const toggleShowSpec = () => {
    setShowSpec((v) => {
      const next = !v;
      if (!next && dontShowAgain) {
        localStorage.setItem("sfxk-delima-spec-dismissed", "1");
      }
      return next;
    });
  };

  const handleFile = async (selected: File) => {
    if (!selected.name.toLowerCase().endsWith(".xlsx")) {
      toast.error("Hanya fail .xlsx dibenarkan.");
      return;
    }
    setFile(selected);
    try {
      const parsed = await parseDelimaExcel(selected);
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setDataStartRow(parsed.dataStartRow);
      setMapping(autoMapHeaders(parsed.headers));
      setStep(2);
    } catch {
      toast.error("Gagal membaca fail Excel. Pastikan fail .xlsx tidak rosak.");
    }
  };

  const downloadTemplate = () => {
    const blob = generateDelimaTemplate();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "templat-delima.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Hasilkan data ternormal dengan transformasi tahun/kelas automatik
  const mappedRows: Array<{
    row: ParsedRow;
    data: Partial<DelimaFormValues>;
    errors: string[];
    duplicate: boolean;
    notes: string[];
  }> = useMemo(() => {
    return rows.map((r) => {
      const data: Partial<DelimaFormValues> = {};
      const notes: string[] = [...r.notes];

      // Kumpul nilai mentah dari lajur yang dipetakan
      (Object.keys(mapping) as DelimaFieldKey[]).forEach((k) => {
        const header = mapping[k];
        if (header && r.raw[header] != null) {
          (data as Record<string, string>)[k] = String(r.raw[header]).trim();
        }
      });

      const parsed = delimaFormSchema.safeParse(data);
      const errors = parsed.success ? [] : parsed.error.issues.map((i) => i.message);
      const duplicate = existingIds?.has(data.delima_id ?? "") ?? false;
      return { row: r, data, errors, duplicate, notes };
    });
  }, [rows, mapping, existingIds]);

  const validRows = mappedRows.filter((m) => m.errors.length === 0);
  const invalidRows = mappedRows.filter((m) => m.errors.length > 0);

  const goToPreview = () => {
    const missing: DelimaFieldKey[] = (
      Object.keys(mapping) as DelimaFieldKey[]
    ).filter((k) => !mapping[k]);
    if (missing.length > 0) {
      toast.error(`Sila padankan semua medan: ${missing.join(", ")}`);
      return;
    }
    setStep(3);
  };

  const runImport = async () => {
    if (validRows.length === 0) {
      toast.error("Tiada baris sah untuk diimport.");
      return;
    }
    setImporting(true);
    setStep(4);
    setProgress(0);

    const toImport = validRows.map((m) => m.data as DelimaFormValues);
    const total = toImport.length;
    const errors: {
      row: number; // nombor baris asal dalam fail Excel (1-based)
      delima_id: string;
      error: string;
      data: Partial<DelimaFormValues>;
    }[] = [];

    const BATCH = 100;
    let success = 0;
    for (let i = 0; i < toImport.length; i += BATCH) {
      const chunk = toImport.slice(i, i + BATCH);
      const res = await batchUpsert.mutateAsync({
        rows: chunk,
        conflictStrategy: strategy,
      });
      success += res.success;
      res.errors.forEach((e) => {
        const rowIdx = i + e.index;
        const orig = validRows[rowIdx];
        errors.push({
          // Nombor baris asal dalam fail Excel
          row: orig?.row.rowNumber ?? rowIdx + 1,
          delima_id: e.delima_id || (orig?.data.delima_id ?? ""),
          error: e.error,
          data: orig?.data ?? {},
        });
      });
      setProgress(Math.round(((i + chunk.length) / total) * 100));
    }

    // Gabungkan baris yang TIDAK sah pada langkah pengesahan (baris yang
    // di-skip kerana gagal validasi) supaya admin nampak SEBAB setiap baris.
    const validationErrors = invalidRows.map((m) => ({
      row: m.row.rowNumber,
      delima_id: m.data.delima_id ?? "",
      error: m.errors[0] ?? "Medan tidak lengkap atau tidak sah.",
      data: m.data,
    }));
    const allErrors = [...validationErrors, ...errors];

    setResult({ success, failed: allErrors.length, errors: allErrors });
    await logImport.mutateAsync({
      filename: file?.name ?? "unknown.xlsx",
      totalRows: total + invalidRows.length,
      successRows: success,
      failedRows: allErrors.length,
      errorDetail: allErrors.length ? allErrors : null,
    });
    setImporting(false);
    setProgress(100);
    if (allErrors.length === 0) {
      toast.success(`${bm.delima.importSuccess}: ${success} baris`);
    } else {
      toast.warning(`Import selesai: ${success} berjaya, ${allErrors.length} baris tidak diimport`);
    }
  };

  const downloadErrorLog = () => {
    if (!result) return;
    const blob = generateErrorLog(result.errors);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `log-ralat-import-${Date.now()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{bm.delima.importTitle}</DialogTitle>
          <DialogDescription>
            Langkah {step} / 4 —{" "}
            {step === 1
              ? bm.delima.importStep1
              : step === 2
              ? bm.delima.importStep2
              : step === 3
              ? bm.delima.importStep3
              : bm.delima.importStep4}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div
              className={cn(
                "rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50 hover:bg-accent/30"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
            >
              <FileSpreadsheet className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">{bm.delima.dropFile}</p>
              <p className="text-xs text-muted-foreground">{bm.delima.acceptedFormat}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" /> Pilih Fail
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>

            {/* Panel Spesifikasi Format Fail */}
            <div className="rounded-lg border bg-muted/30">
              <button
                type="button"
                onClick={toggleShowSpec}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium hover:bg-muted/50"
                aria-expanded={showSpec}
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  {showSpec ? bm.delima.specToggleHide : bm.delima.specToggleShow}
                </span>
                {showSpec ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {showSpec && (
                <div className="max-h-[55vh] space-y-4 overflow-y-auto border-t p-4 text-sm">
                  <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-blue-900">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="text-xs leading-relaxed">
                      {bm.delima.specIntro}
                    </p>
                  </div>

                  {/* Struktur Helaian */}
                  <section>
                    <h4 className="mb-1 font-semibold text-foreground">
                      {bm.delima.specSheetTitle}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {bm.delima.specSheetFormat}
                    </p>
                  </section>

                  <Separator />

                  {/* Lajur yang Diiktiraf */}
                  <section>
                    <h4 className="mb-2 font-semibold text-foreground">
                      {bm.delima.specColumnsTitle}
                    </h4>
                    <div className="space-y-1.5">
                      <SpecRow
                        label={bm.delima.specColDelimaId}
                        required
                        desc={bm.delima.specColDelimaIdDesc}
                      />
                      <SpecRow
                        label={bm.delima.specColNama}
                        required
                        desc={bm.delima.specColNamaDesc}
                      />
                      <SpecRow
                        label={bm.delima.specColPassword}
                        required
                        desc={bm.delima.specColPasswordDesc}
                      />
                      <SpecRow
                        label={bm.delima.specColIgnored}
                        desc={bm.delima.specColIgnoredDesc}
                        muted
                      />
                    </div>
                  </section>

                  <Separator />

                  {/* Nama Lajur yang Dikenali */}
                  <section>
                    <h4 className="mb-1 font-semibold text-foreground">
                      {bm.delima.specHeaderNamesTitle}
                    </h4>
                    <p className="mb-2 text-xs text-muted-foreground">
                      {bm.delima.specHeaderNamesDesc}
                    </p>
                    <ul className="grid gap-1 text-xs sm:grid-cols-2">
                      <HeaderNamesList field="delima_id" />
                      <HeaderNamesList field="nama" />
                      <HeaderNamesList field="kata_laluan" />
                    </ul>
                  </section>

                  <Separator />

                  {/* Contoh Baris */}
                  <section>
                    <h4 className="mb-2 font-semibold text-foreground">
                      {bm.delima.specExamplesTitle}
                    </h4>
                    <div className="space-y-1.5 rounded-md bg-background p-2 font-mono text-[11px]">
                      <div>
                        <span className="text-muted-foreground">
                          // Fail sekolah (ID DELIMA, NAMA, PASSWORD diimport; TAHUN/KELAS/BIL/KP diabaikan):
                        </span>
                        <br />
                        {bm.delima.specExample1}
                      </div>
                    </div>
                  </section>

                  <Separator />

                  {/* Had & Amaran */}
                  <section>
                    <h4 className="mb-2 font-semibold text-foreground">
                      {bm.delima.specLimitations}
                    </h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>• {bm.delima.specLimitFileFormat}</li>
                      <li>• {bm.delima.specLimitFirstSheet}</li>
                      <li>• {bm.delima.specLimitEmptyRows}</li>
                      <li>• {bm.delima.specLimitMaxRows}</li>
                    </ul>
                  </section>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                      <Checkbox
                        checked={dontShowAgain}
                        onCheckedChange={(c) => {
                          const checked = Boolean(c);
                          setDontShowAgain(checked);
                          if (checked) {
                            localStorage.setItem("sfxk-delima-spec-dismissed", "1");
                          } else {
                            localStorage.removeItem("sfxk-delima-spec-dismissed");
                          }
                        }}
                      />
                      Jangan tunjukkan lagi pada masa hadapan
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={downloadTemplate}
                    >
                      <Download className="h-4 w-4" /> {bm.delima.downloadTemplate}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
              <FileSpreadsheet className="mr-1 inline h-3 w-3" />
              Fail: <span className="font-mono">{file?.name}</span> · {rows.length} baris dikesan dari helaian pertama (data mula pada baris {dataStartRow}).
            </div>
            <p className="text-sm text-muted-foreground">
              {bm.delima.mappingHint} ({bm.delima.autoMatch} telah digunakan sebagai lalai.)
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(mapping) as DelimaFieldKey[]).map((key) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs">
                    {labelForField(key)} <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={mapping[key] || "__none__"}
                    onValueChange={(v) =>
                      setMapping((m) => ({
                        ...m,
                        [key]: v === "__none__" ? "" : v,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="— Pilih lajur —" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Tiada —</SelectItem>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                {bm.common.back}
              </Button>
              <Button onClick={goToPreview}>{bm.common.next}</Button>
            </DialogFooter>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label={bm.common.totalRecords} value={rows.length} />
              <Stat label={bm.delima.validRows} value={validRows.length} variant="success" />
              <Stat label={bm.delima.invalidRows} value={invalidRows.length} variant="destructive" />
              <Stat
                label="Bertindih"
                value={mappedRows.filter((m) => m.duplicate).length}
                variant="warning"
              />
            </div>

            <div className="space-y-2 rounded-md border p-3">
              <Label className="text-sm font-medium">{bm.delima.conflictStrategy}</Label>
              <div className="flex gap-3 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="strategy"
                    checked={strategy === "upsert"}
                    onChange={() => setStrategy("upsert")}
                  />
                  {bm.delima.conflictUpdate}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="strategy"
                    checked={strategy === "skip"}
                    onChange={() => setStrategy("skip")}
                  />
                  {bm.delima.conflictSkip}
                </label>
              </div>
            </div>

            <div className="max-h-72 overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">Baris</TableHead>
                    <TableHead>ID Delima</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappedRows.slice(0, 50).map((m) => (
                    <TableRow key={m.row.rowNumber}>
                      <TableCell className="text-xs text-muted-foreground">
                        {m.row.rowNumber}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {m.data.delima_id ?? "—"}
                      </TableCell>
                      <TableCell>
                        {m.data.nama ?? "—"}
                        {m.notes.length > 0 && (
                          <p className="mt-0.5 text-[10px] text-amber-700">
                            {m.notes.join(" ")}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {m.errors.length > 0 ? (
                          <Badge variant="destructive" title={m.errors.join("; ")}>
                            {m.errors[0]}
                          </Badge>
                        ) : m.duplicate ? (
                          <Badge variant="secondary">Bertindih</Badge>
                        ) : (
                          <Badge variant="success">Sah</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {mappedRows.length > 50 && (
              <p className="text-xs text-muted-foreground">
                Paparan 50 baris pertama. Jumlah keseluruhan: {mappedRows.length}.
              </p>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                {bm.common.back}
              </Button>
              <Button
                onClick={runImport}
                disabled={validRows.length === 0}
              >
                {bm.delima.importNow} ({validRows.length})
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            {importing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sedang mengimport...
                </div>
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">
                  {progress}% selesai
                </p>
              </div>
            )}

            {result && !importing && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-center">
                    <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600" />
                    <p className="mt-1 text-2xl font-bold text-emerald-700">
                      {result.success}
                    </p>
                    <p className="text-xs text-emerald-700">{bm.common.rowsImported}</p>
                  </div>
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-center">
                    <XCircle className="mx-auto h-6 w-6 text-red-600" />
                    <p className="mt-1 text-2xl font-bold text-red-700">
                      {result.failed}
                    </p>
                    <p className="text-xs text-red-700">{bm.common.rowsFailed}</p>
                  </div>
                </div>

                {result.failed > 0 && (
                  <>
                    <div className="rounded-md border border-red-200 bg-red-50/40 p-3">
                      <p className="mb-2 text-sm font-semibold text-red-800">
                        Baris yang tidak dapat diimport ({result.failed}):
                      </p>
                      <div className="max-h-56 overflow-auto rounded-md border bg-background">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16">Baris</TableHead>
                              <TableHead>ID Delima</TableHead>
                              <TableHead>Sebab</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {result.errors
                              .slice()
                              .sort((a, b) => a.row - b.row)
                              .map((e, i) => (
                                <TableRow key={`${e.row}-${i}`}>
                                  <TableCell className="text-xs font-medium text-red-700">
                                    {e.row}
                                  </TableCell>
                                  <TableCell className="font-mono text-xs">
                                    {e.delima_id || "—"}
                                  </TableCell>
                                  <TableCell className="text-xs">{e.error}</TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={downloadErrorLog}
                      className="w-full"
                    >
                      <Download className="h-4 w-4" /> {bm.delima.downloadErrorLog}
                    </Button>
                  </>
                )}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button onClick={() => handleOpenChange(false)}>{bm.common.done}</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant?: "success" | "destructive" | "warning";
}) {
  const color =
    variant === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : variant === "destructive"
      ? "border-red-200 bg-red-50 text-red-700"
      : variant === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-border bg-muted/30";
  return (
    <div className={cn("rounded-md border p-2 text-center", color)}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}

function SpecRow({
  label,
  desc,
  required,
  muted,
}: {
  label: string;
  desc: string;
  required?: boolean;
  muted?: boolean;
}) {
  return (
    <div className={cn("flex items-start gap-2 rounded-md px-2 py-1", muted && "bg-muted/40")}>
      <div className="mt-0.5">
        {required ? (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
            *
          </span>
        ) : (
          <span className="inline-block h-4 w-4 text-center text-xs text-muted-foreground">–</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium leading-tight">{label}</p>
        <p className="text-[11px] leading-snug text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function HeaderNamesList({ field }: { field: DelimaFieldKey }) {
  const names = EXPECTED_EXCEL_HEADERS[field];
  return (
    <li className="rounded-md bg-background p-1.5 text-[11px]">
      <span className="font-semibold">{labelForField(field)}:</span>{" "}
      <span className="text-muted-foreground">{names.join(", ")}</span>
    </li>
  );
}

function labelForField(k: DelimaFieldKey): string {
  switch (k) {
    case "delima_id":
      return bm.delima.delimaId;
    case "nama":
      return bm.delima.studentName;
    case "kata_laluan":
      return bm.delima.delimaPassword;
  }
}
