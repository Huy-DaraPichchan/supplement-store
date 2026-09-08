"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "./CartProvider";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <Navbar />
      <div className="min-h-[calc(100dvh-4rem)]">{children}</div>
      <Footer />
    </CartProvider>
  );
}
