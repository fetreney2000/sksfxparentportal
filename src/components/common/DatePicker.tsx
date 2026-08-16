import { forwardRef, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { toDateInputValueKL, fromDateInputValueKL } from "@/lib/date";

interface DatePickerProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value?: string; // yyyy-MM-dd
  onChange: (value: string) => void;
}

/**
 * Date picker ringkas yang mengendalikan zon waktu KL supaya tarikh
 * yang dipilih tidak "tergelincir" sehari.
 * Native HTML input type=date — serasi dengan mudah alih.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, value, onChange, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="date"
        className={className}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    );
  }
);
DatePicker.displayName = "DatePicker";

export { toDateInputValueKL, fromDateInputValueKL };
