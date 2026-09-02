"use client";

import type { Product } from "@/lib/types/product";
import { motion } from "framer-motion";
import { Heart, Leaf, Plus, Star } from "lucide-react";
import { useCart } from "./ui/context";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const isAvailable = product.stock > 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-900">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-600 dark:from-emerald-950 dark:to-teal-950">
            <Leaf className="h-16 w-16" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.badges.slice(0, 2).map((badge) => (
            <span
              key={badge}
              className={`rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                badge === "Sold out"
                  ? "bg-slate-700 text-white"
                  : "bg-emerald-600 text-white"
              }`}
            >
              {badge}
            </span>
          ))}
        </div>
        <button
          type="button"
          aria-label={`Save ${product.name}`}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-500 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:text-rose-500 dark:bg-slate-900/90"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-1 text-amber-500">
          <Star className="h-3.5 w-3.5 fill-current" />
          <span className="text-xs font-medium text-slate-500">New favorite</span>
        </div>
        <h3 className="line-clamp-2 min-h-12 text-sm font-semibold leading-6 text-slate-900 dark:text-white">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
          {product.description || "Quality supplements for your everyday routine."}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <span className="text-lg font-bold text-slate-950 dark:text-white">
              ${product.price.toFixed(2)}
            </span>
            <p className="text-[11px] text-slate-400">{product.sku}</p>
          </div>
          <button
            type="button"
            disabled={!isAvailable}
            onClick={() => addToCart(product)}
            className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Plus className="h-4 w-4" />
            {isAvailable ? "Add" : "Sold out"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
