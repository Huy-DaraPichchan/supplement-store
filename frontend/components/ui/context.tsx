"use client";

import { createContext, useContext, useState } from "react";
import type { Product } from "@/lib/types/product";

// Just a count + an add function — no reducer, no external library.
// This exists because Navbar (shows the count) and ProductGrid (adds items)
// are no longer nested inside each other once Navbar moved into layout.tsx.
interface CartContextValue {
  cartCount: number;
  addToCart: (product: Product) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);

  function addToCart(product: Product) {
    setCartCount((count) => count + 1);
    console.log("Added to cart:", product.name);
  }

  return (
    <CartContext.Provider value={{ cartCount, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}

// Small helper so components just call useCart() instead of importing
// useContext + CartContext every time.
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside a <CartProvider>");
  }
  return context;
}