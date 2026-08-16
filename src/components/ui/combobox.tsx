import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  emptyText?: string;
  allowCustom?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/**
 * Combobox mesra mudah alih.
 * - Pilih dari senarai (options)
 * - Jika allowCustom=true, boleh taip nilai baharu
 */
export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  emptyText = "Tiada pilihan",
  allowCustom = true,
  disabled = false,
  className,
  id,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const displayLabel =
    options.find((o) => o.value === value)?.label ?? value ?? "";

  const select = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{displayLabel || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="flex flex-col">
          {allowCustom && (
            <div className="flex items-center gap-1 border-b p-2">
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="h-8"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && allowCustom && query.trim()) {
                    e.preventDefault();
                    select(query.trim());
                  }
                }}
              />
              {query && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                {emptyText}
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                    opt.value === value && "bg-accent/50"
                  )}
                  onClick={() => select(opt.value)}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      opt.value === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{opt.label}</span>
                </button>
              ))
            )}
            {allowCustom && query.trim() &&
              !options.some((o) => o.value === query.trim()) && (
                <button
                  type="button"
                  className="mt-1 flex w-full items-center gap-2 rounded-sm border-t px-2 py-1.5 text-left text-sm text-primary hover:bg-accent"
                  onClick={() => select(query.trim())}
                >
                  Tambah: "{query.trim()}"
                </button>
              )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
