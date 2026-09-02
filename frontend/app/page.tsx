"use client";

import ProductGrid from "@/components/ProductGrid";
import ProductGridPreview from "@/components/ProductGridPreview";

export default function Home() {
  return (
    <main>
      <ProductGridPreview />
      <section className="border-y border-slate-200 bg-emerald-50/60 dark:border-slate-800 dark:bg-emerald-950/20">
        <ProductGrid />
      </section>
    </main>
  );
}
