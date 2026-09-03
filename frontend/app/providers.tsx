"use client";

import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  const scriptType = typeof window === "undefined" ? "text/javascript" : "text/plain";

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      scriptProps={{ type: scriptType }}
    >
      {children}
    </ThemeProvider>
  );
}
