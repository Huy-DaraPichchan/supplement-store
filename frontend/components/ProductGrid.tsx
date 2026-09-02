"use client";

import { Product, ProductBadge } from "@/lib/types/product";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

// Sample catalog data. In a real app this would come from a database
// or CMS — swap this array out without touching any component below.
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Daily Multivitamin",
    description: "A complete blend of essential vitamins for everyday energy.",
    price: 24.99,
    imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=500",
    badges: ["Vegan", "Lab Tested"],
  },
  {
    id: "2",
    name: "Omega-3 Fish Oil",
    description: "Supports heart and brain health with purified fish oil.",
    price: 19.99,
    imageUrl: "https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=500",
    badges: ["Lab Tested"],
  },
  {
    id: "3",
    name: "Plant Protein Powder",
    description: "25g of plant-based protein per serving, unflavored.",
    price: 34.99,
    imageUrl: "https://images.unsplash.com/photo-1622484212385-42361794b5f6?w=500",
    badges: ["Vegan", "Best Seller"],
  },
  {
    id: "4",
    name: "Magnesium Complex",
    description: "Supports muscle recovery and restful sleep.",
    price: 17.99,
    imageUrl: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500",
    badges: ["Lab Tested", "New"],
  },
  {
    id: "5",
    name: "Probiotic Blend",
    description: "10 billion CFU per capsule for gut health support.",
    price: 29.99,
    imageUrl: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=500",
    badges: ["Vegan"],
  },
  {
    id: "6",
    name: "Vitamin D3 + K2",
    description: "Supports bone strength and immune function year-round.",
    price: 15.99,
    imageUrl: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=500",
    badges: ["Lab Tested", "Best Seller"],
  },
];

interface ProductGridProps {
  products?: Product[];
  onAddToCart?: (product: Product) => void;
}

export default function ProductGrid({
  products = SAMPLE_PRODUCTS,
  onAddToCart,
}: ProductGridProps) {
  return (
    <section id="shop" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Shop All Supplements</h2>
        <p className="mt-2 text-gray-500">
          Clean formulas, third-party tested, made to fit your routine.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  );
}

// One card, one job: display a product and let the user add it to cart.
function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart?: (product: Product) => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg"
    >
      <div className="relative h-48 w-full overflow-hidden bg-gray-50">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1">
          {product.badges.map((badge) => (
            <BadgePill key={badge} label={badge} />
          ))}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-gray-900">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{product.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={() => onAddToCart?.(product)}
            className="flex items-center gap-1 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Small pill used for callouts like "Vegan" or "Lab Tested".
function BadgePill({ label }: { label: ProductBadge }) {
  return (
    <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-brand shadow-sm">
      {label}
    </span>
  );
}