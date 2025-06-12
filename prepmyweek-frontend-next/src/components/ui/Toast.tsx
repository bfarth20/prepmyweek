"use client";

import * as React from "react";
import { cn } from "@/lib/utils"; // your classnames helper if you have one

interface ToastProps {
  message: string;
  onClose?: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, 3000); // auto-close after 3s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50",
        "bg-brand text-white opacity-90 rounded-md px-4 py-2 shadow-md",
        "animate-fade-in-out"
      )}
      role="alert"
    >
      {message}
      <button
        onClick={onClose}
        aria-label="Close notification"
        className="ml-2 font-bold"
      >
        ×
      </button>
    </div>
  );
}
