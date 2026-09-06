import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "PureVista",
    template: "%s | PureVita",
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
          <CartProvider>
            <Navbar />
            <div className="min-h-[calc(100dvh-4rem)]">{children}</div>
            <Footer />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
