"use client";

import { getCategories, type Category } from "@/lib/api";
import { ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomeCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <HomeCategoriesSkeleton />;
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-3 py-9 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-5 flex items-start justify-between gap-3 sm:items-end sm:gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">Shop your way</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Browse categories</h2>
        </div>
        <Link href="/products" className="flex min-h-11 shrink-0 items-center gap-1.5 text-base font-semibold text-primary transition-colors hover:text-primary-hover">
          View all <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.id} href={`/products?category=${encodeURIComponent(category.slug)}`} className="group flex min-h-24 items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-card transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-raised">
            <span className="flex size-12 items-center justify-center rounded-lg bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Package className="size-5" />
            </span>
            <span className="min-w-0 flex-1 text-base font-semibold">{category.name}</span>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function HomeCategoriesSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-3 py-9 sm:px-6 sm:py-14 lg:px-8" aria-label="Loading categories" aria-busy="true">
      <div className="mb-5 space-y-2">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-8 w-48 rounded" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex min-h-24 items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="skeleton size-12 shrink-0 rounded-lg" />
            <div className="skeleton h-5 flex-1 rounded" />
          </div>
        ))}
      </div>
    </section>
  );
}
