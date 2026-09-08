"use client";

import { ApiError, getProduct } from "@/lib/api";
import type { Product } from "@/lib/types/product";
import { ArrowLeft, Minus, Package, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import ProductDetailSkeleton from "@/components/ProductDetailSkeleton";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProduct(slug)
      .then((nextProduct) => {
        if (!cancelled) setProduct(nextProduct);
      })
      .catch((requestError) => {
        if (cancelled) return;
        if (requestError instanceof ApiError && requestError.status === 404) setNotFound(true);
        else setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <ProductDetailSkeleton />;

  if (notFound || error || !product) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <Package className="size-10 text-muted-foreground" />
          <h1 className="font-heading mt-4 text-xl font-semibold">{notFound ? "Product not found" : "Product unavailable"}</h1>
        <p className="mt-2 text-base text-muted-foreground">{notFound ? "This product may have been removed from the catalog." : "We could not load this product. Please try again."}</p>
        <Link href="/products" className="mt-5 inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-base font-semibold text-primary-foreground hover:bg-primary-hover">
          <ArrowLeft className="size-4" /> Back to products
        </Link>
      </main>
    );
  }

  const available = product.stock > 0;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-3 py-6 sm:px-6 sm:py-12 lg:px-8">
      <Link href="/products" className="inline-flex min-h-11 items-center gap-2 text-base text-muted-foreground transition-colors hover:text-primary">
        <ArrowLeft className="size-4" /> Back to marketplace
      </Link>

      <div className="mt-5 grid items-start gap-6 sm:mt-6 sm:gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted shadow-card">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-4 sm:p-10" />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground"><Package className="size-16" /></div>
          )}
        </div>

        <section className="rounded-xl border border-border bg-card p-4 shadow-panel sm:p-7 lg:sticky lg:top-28">
          <div className="flex flex-wrap items-center gap-2 text-base">
            <span className={`rounded-md px-2 py-1 font-medium ${available ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
              {available ? `${product.stock} in stock` : "Sold out"}
            </span>
            <span className="text-muted-foreground">SKU {product.sku}</span>
          </div>
          <h1 className="font-heading mt-4 text-2xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1>
          <div className="mt-5 rounded-lg bg-muted px-4 py-3">
            <p className="text-2xl font-semibold tabular-nums">${product.price.toFixed(2)}</p>
            <p className="mt-1 text-base text-muted-foreground">៛{product.priceKhr.toLocaleString()}</p>
          </div>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
            {product.description || "Product details will be added by the store."}
          </p>

          <div className="mt-7 border-t border-border pt-6">
            <label className="text-base font-medium" htmlFor="quantity">Quantity</label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center rounded-md border border-input bg-card">
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={!available || quantity <= 1} className="flex size-11 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40" aria-label="Decrease quantity"><Minus className="size-4" /></button>
                <input id="quantity" type="number" min={1} max={Math.min(product.stock, 999)} value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(Number(event.target.value) || 1, product.stock, 999)))} disabled={!available} className="h-11 min-w-12 flex-1 border-0 bg-transparent text-center text-base tabular-nums outline-none sm:w-12 sm:flex-none" />
                <button type="button" onClick={() => setQuantity((value) => Math.min(value + 1, product.stock, 999))} disabled={!available || quantity >= product.stock} className="flex size-11 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40" aria-label="Increase quantity"><Plus className="size-4" /></button>
              </div>
              <button type="button" disabled={!available} onClick={() => addToCart(product, quantity)} className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-base font-semibold text-primary-foreground shadow-card transition-[background-color,box-shadow] hover:bg-primary-hover hover:shadow-raised disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none sm:max-w-xs sm:flex-1">
                <ShoppingBag className="size-4" /> {available ? "Add to cart" : "Sold out"}
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">No customer account is needed. Review your cart and create an order to continue in chat.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
