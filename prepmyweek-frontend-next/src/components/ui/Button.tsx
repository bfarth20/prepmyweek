// src/components/ui/Button.tsx
"use client";

import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ButtonHTMLAttributes } from "react";
import { AnchorHTMLAttributes } from "react";

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
      danger: "bg-[var(--color-brand)] text-white hover:bg-red-500",
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

type ButtonProps = (
  | ButtonHTMLAttributes<HTMLButtonElement>
  | AnchorHTMLAttributes<HTMLAnchorElement>
) &
  VariantProps<typeof button> & {
    href?: string;
  };

export function Button({
  className,
  variant,
  size,
  href,
  ...props
}: ButtonProps) {
  const classNames = cn(button({ variant, size }), className);

  if (href) {
    return (
      <Link
        href={href}
        className={classNames}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      />
    );
  }

  return (
    <button
      className={classNames}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    />
  );
}
