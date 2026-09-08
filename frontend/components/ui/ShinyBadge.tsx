"use client";

import type { ReactNode } from "react";

export function ShinyBadge({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-flex items-center overflow-hidden rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
      <span className="relative z-10">{children}</span>
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full animate-shine bg-gradient-to-r from-transparent via-white/60 to-transparent"
        aria-hidden="true"
      />
    </span>
  );
}