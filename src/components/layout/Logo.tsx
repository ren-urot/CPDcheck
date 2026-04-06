import { cn } from "../../lib/utils";

export function Logo({ inverted = false, size = "default", className }) {
  const sizes = {
    sm: "h-6",
    default: "h-8",
    lg: "h-10",
  };

  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-md font-bold text-white",
          sizes[size],
          inverted ? "bg-white text-brand-dark-blue" : "bg-brand-dark-blue",
          size === "sm" ? "w-6 text-xs" : size === "lg" ? "w-10 text-base" : "w-8 text-sm"
        )}
      >
        CPD
      </div>
      <span
        className={cn(
          "font-semibold tracking-tight",
          size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base",
          inverted ? "text-white" : "text-brand-dark-blue"
        )}
      >
        CPDcheck
      </span>
    </div>
  );
}
