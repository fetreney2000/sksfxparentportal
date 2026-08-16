import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Ralat",
  description = "Sesuatu telah berlaku. Sila cuba lagi.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center",
        className
      )}
      role="alert"
    >
      <div className="rounded-full bg-background p-3 text-destructive shadow-sm">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-destructive">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Cuba Semula
        </Button>
      )}
    </div>
  );
}
