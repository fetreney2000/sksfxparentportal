import { Eye, EyeOff } from "lucide-react";
import { useState, forwardRef, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PasswordInputProps = ComponentProps<typeof Input>;

/**
 * Input kata laluan dengan togol papar/sembunyi.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, type: _type, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("pr-10", className)}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-foreground"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? "Sembunyi Kata Laluan" : "Papar Kata Laluan"}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
