import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Vista Care",
    template: "%s | Vista Care",
  },
  description: "A straightforward marketplace for everyday wellness products.",
  icons: {
    icon: "/pure-vista.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
