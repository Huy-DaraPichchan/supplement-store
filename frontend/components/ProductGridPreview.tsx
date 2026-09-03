"use client";

import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/types/product";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";

export default function ProductGridPreview() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getProducts()
      .then((items) => {
        if (!cancelled) setProducts(items.slice(0, 4));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-3 py-9 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-6 flex items-start justify-between gap-3 sm:items-end sm:gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">Fresh in the catalog</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">New arrivals</h2>
          <p className="mt-1 hidden text-base text-muted-foreground sm:block">Recently added products for everyday routines.</p>
        </div>
        <Link href="/products" className="flex min-h-11 shrink-0 items-center gap-1.5 text-base font-medium text-primary transition-colors hover:text-primary-hover">
          View all <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 md:grid-cols-4 md:gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <ProductCardSkeleton key={index} />)
          : products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
