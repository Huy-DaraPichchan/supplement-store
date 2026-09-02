import { ProductCard } from "./ProductCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/data";

export default function ProductGridPreview() {
  const previewProducts = products.slice(0, 6);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Featured Products
          </h2>
          <Link
            href="/products"
            className="flex items-center gap-2 text-primary hover:gap-3 transition-all"
          >
            View All <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {previewProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}