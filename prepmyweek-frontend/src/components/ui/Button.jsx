// components/ui/Button.jsx
import { tv } from "tailwind-variants";
import { cn } from "../../../lib/utils";

const button = tv({
  base: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  variants: {
    variant: {
      default: "bg-[var(--color-brand)] text-white hover:bg-green-600",
      outline:
        "border border-[var(--color-brand)] text-[var(--color-brand)] hover:bg-orange-700 hover:text-white hover:cursor-pointer",
      ghost: "text-[var(--color-brand)] hover:bg-[var(--color-brand)/10]",
      secondary:
        "bg-transparent text-gray-600 hover:text-[color:theme(colors.orange.700)] hover:cursor-pointer",
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3",
      lg: "h-11 px-8",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export function Button({ className, variant, size, ...props }) {
  return (
    <button className={cn(button({ variant, size }), className)} {...props} />
  );
}
