"use client";

import type { Product } from "@/lib/types/product";
import { Package, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartProvider";

export function ProductCard({
  product,
  eager = false,
}: {
  product: Product;
  eager?: boolean;
}) {
  const { addToCart } = useCart();
  const isAvailable = product.stock > 0;

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-raised">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden border-b border-border bg-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            loading={eager ? "eager" : "lazy"}
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-contain p-3 sm:p-5"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <Package className="size-10" />
          </span>
        )}
        <span className={`absolute left-2 top-2 rounded-md border px-2 py-1 text-xs font-semibold shadow-card ${isAvailable ? "border-border bg-card text-success" : "border-foreground bg-foreground text-background"}`}>
          {isAvailable ? "In stock" : "Sold out"}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link href={`/products/${product.slug}`} className="line-clamp-2 min-h-12 text-base font-medium leading-6 transition-colors hover:text-primary">
          {product.name}
        </Link>
        <p className="mt-1 truncate text-xs text-muted-foreground">{product.sku}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0">
            <p className="text-base font-semibold tabular-nums sm:text-lg">${product.price.toFixed(2)}</p>
            <p className="truncate text-xs text-muted-foreground">៛{product.priceKhr.toLocaleString()}</p>
          </div>
          <button
            type="button"
            disabled={!isAvailable}
            onClick={() => addToCart(product)}
            className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-card transition-[background-color,box-shadow] duration-150 hover:bg-primary-hover hover:shadow-raised disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none sm:w-auto sm:px-3"
            aria-label={isAvailable ? `Add ${product.name} to cart` : `${product.name} is sold out`}
          >
            <Plus className="size-4" />
            <span className="ml-1.5 hidden text-sm font-semibold sm:inline">Add</span>
          </button>
        </div>
      </div>
    </article>
  );
}
