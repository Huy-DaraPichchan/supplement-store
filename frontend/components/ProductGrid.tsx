"use client";

import { getCategories, getProducts } from "@/lib/api";
import type { Category } from "@/lib/api";
import type { Product } from "@/lib/types/product";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProductCard } from "./ProductCard";

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;

    getProducts(0, category)
      .then((nextProducts) => {
        if (cancelled) return;
        setProducts(nextProducts);
        setHasMore(nextProducts.length === 12);
      })
      .catch(() => {
        if (!cancelled) setError("We could not load products. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || loading || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setLoadingMore(true);
        getProducts(products.length, category)
          .then((nextProducts) => {
            setProducts((current) => [...current, ...nextProducts]);
            setHasMore(nextProducts.length === 12);
          })
          .catch(() => setError("More products could not be loaded."))
          .finally(() => setLoadingMore(false));
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [category, hasMore, loading, loadingMore, products.length]);

  const visibleProducts = products.filter((product) => {
    const query = searchTerm.trim().toLowerCase();
    return !query || `${product.name} ${product.description} ${product.sku}`.toLowerCase().includes(query);
  });

  function handleCategoryChange(nextCategory: string) {
    setCategory(nextCategory);
    setLoading(true);
    setError(null);
    setProducts([]);
    setHasMore(true);
  }

  return (
    <section id="shop" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 sm:py-14">
      <div className="mb-8 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search supplements"
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="h-4 w-4 text-slate-500" />
          <label htmlFor="category" className="sr-only">Filter by category</label>
          <select
            id="category"
            value={category}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className="h-11 min-w-44 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>{item.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-8 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <ProductGridSkeleton />
      ) : visibleProducts.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence initial={false}>
            {visibleProducts.map((product) => (
              <motion.div key={product.id} layout transition={{ duration: 0.35 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 py-20 text-center text-sm text-slate-500">
          No supplements match your search.
        </div>
      )}

      <div ref={sentinelRef} className="flex min-h-24 items-center justify-center py-8" aria-live="polite">
        {loadingMore && <LoadingDots />}
        {!loading && !loadingMore && !hasMore && products.length > 0 && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">You have reached the end</p>
        )}
      </div>
    </section>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-2 text-emerald-600" aria-label="Loading more products">
      {[0, 1, 2].map((item) => (
        <motion.span
          key={item}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: item * 0.12 }}
          className="h-2 w-2 rounded-full bg-current"
        />
      ))}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="aspect-square bg-slate-100 dark:bg-slate-800" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-5 w-4/5 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-8 w-full rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
