"use client";
import ProductGrid from "@/components/ProductGrid";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { Suspense } from "react";
import { TextGenerateEffect } from "@/components/ui/TextGenerateEffect";
import { AnimatedHero } from "@/components/ui/AnimatedHero";

export default function ProductsPage() {
  return (
    <main className="min-h-screen">
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-11 lg:px-8">
          <AnimatedHero
            eyebrow={
              <p className="text-sm font-semibold text-primary">
                PureVita catalog
              </p>
            }
            heading={
              <TextGenerateEffect
                words="Find your everyday essentials"
                className="font-heading mt-1 text-2xl font-semibold tracking-tight sm:text-3xl"
              />
            }
            description={
              <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
                Search the full catalog, narrow it by category, and order
                through your preferred chat channel.
              </p>
            }
          />
        </div>
      </section>
      <Suspense
        fallback={
          <section
            className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8"
            aria-label="Loading products"
            aria-busy="true"
          >
            <div className="mb-5 skeleton h-14 rounded-xl" />
            <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          </section>
        }
      >
        <ProductGrid />
      </Suspense>
    </main>
  );
}
