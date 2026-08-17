import { cn } from "@/lib/utils";

interface BrandLogoProps {
  /** Saiz keseluruhan logo (class h/w). Contoh: "h-10 w-10". */
  size?: string;
  imgClassName?: string;
  className?: string;
}

/**
 * Logo rasmi PassDELIMa — paparkan imej logo dengan latar putih,
 * kemasan bulat dan bayangan halus untuk penampilan profesional.
 */
export function BrandLogo({ size = "h-10 w-10", imgClassName, className }: BrandLogoProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5",
        size,
        className
      )}
    >
      <img
        src="/logo.png"
        alt="PassDELIMa"
        draggable={false}
        className={cn("h-full w-full object-contain", imgClassName)}
      />
    </div>
  );
}
