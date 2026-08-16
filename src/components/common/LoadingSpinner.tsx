import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
}

export function LoadingSpinner({ className, label }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 p-6", className)}>
      <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
      <p className="text-sm text-muted-foreground">
        {label ?? "Sedang Memuatkan..."}
      </p>
    </div>
  );
}
