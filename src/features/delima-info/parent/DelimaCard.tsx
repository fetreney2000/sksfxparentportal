import { useState } from "react";
import { Copy, Eye, EyeOff, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { DelimaRow } from "../queries";
import { bm } from "@/lib/i18n";

interface DelimaCardProps {
  student: DelimaRow;
}

export function DelimaCard({ student }: DelimaCardProps) {
  const [showPwd, setShowPwd] = useState(false);

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label}: ${bm.delima.copied}`);
    } catch {
      toast.error("Gagal menyalin");
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-primary/15 to-accent/40 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="truncate text-lg">{student.nama}</CardTitle>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <Badge variant="secondary">{student.tahun}</Badge>
              <Badge variant="outline">{student.kelas}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <FieldRow
          label={bm.delima.delimaId}
          value={student.delima_id}
          onCopy={() => copy(bm.delima.delimaId, student.delima_id)}
        />
        <Separator />
        <FieldRow
          label={bm.delima.delimaPassword}
          value={student.kata_laluan}
          masked={!showPwd}
          onToggle={() => setShowPwd((v) => !v)}
          onCopy={() =>
            copy(bm.delima.delimaPassword, student.kata_laluan)
          }
          toggleLabel={showPwd ? bm.delima.hidePassword : bm.delima.showPassword}
        />
      </CardContent>
    </Card>
  );
}

interface FieldRowProps {
  label: string;
  value: string;
  masked?: boolean;
  onToggle?: () => void;
  onCopy?: () => void;
  toggleLabel?: string;
}

function FieldRow({ label, value, masked, onToggle, onCopy, toggleLabel }: FieldRowProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-md border bg-muted/50 px-3 py-2 text-sm font-mono">
          {masked ? "••••••••" : value}
        </code>
        {onToggle && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onToggle}
            aria-label={toggleLabel}
          >
            {masked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        )}
        {onCopy && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onCopy}
            aria-label={bm.delima.copy}
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Re-export supaya tidak ada dead-code jika tidak digunakan terus
export { Check };
