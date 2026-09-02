"use client";

import ProductGrid from "@/components/ProductGrid";
import { motion } from "framer-motion";

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <motion.section
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">
            PureVita collection
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            Supplements for every day
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Explore carefully selected vitamins, minerals, and wellness essentials.
            Keep scrolling to discover more.
          </p>
        </div>
      </motion.section>
      <ProductGrid />
    </main>
  );
}
