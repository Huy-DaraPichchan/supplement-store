"use client";

import ProductGrid from "@/components/ProductGrid";
import ProductGridPreview from "@/components/ProductGridPreview";

export default function Home() {
  return (
    <main>
      <ProductGridPreview />
      <ProductGrid />
    </main>
  );
}
