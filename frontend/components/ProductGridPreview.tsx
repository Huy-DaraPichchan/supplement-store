"use client";

import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/types/product";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";

export default function ProductGridPreview() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts(0).then((items) => setProducts(items.slice(0, 4))).catch(() => setProducts([]));
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Start here</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Popular essentials</h2>
        </div>
        <Link href="/products" className="flex shrink-0 items-center gap-2 text-sm font-bold text-emerald-700 transition-all hover:gap-3 dark:text-emerald-400">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => <motion.div key={product.id} variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}><ProductCard product={product} /></motion.div>)}
      </motion.div>
    </section>
  );
}
