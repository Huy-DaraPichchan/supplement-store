"use client";

import type { Product } from "@/lib/types/product";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CART_STORAGE_KEY = "purevita-cart-v1";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  cartCount: number;
  totalUsd: number;
  totalKhr: number | null;
  addToCart: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "null");
    if (stored?.version !== 1 || !Array.isArray(stored.items)) return [];
    return stored.items.filter(
      (item: CartItem) =>
        item?.product &&
        typeof item.product.id === "string" &&
        typeof item.product.name === "string" &&
        typeof item.quantity === "number" &&
        item.quantity > 0,
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setItems(readStoredCart());
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 1, items }));
  }, [hydrated, items]);

  function addToCart(product: Product, quantity = 1) {
    if (product.stock < 1) return;
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (!existing) {
        return [...current, { product, quantity: Math.min(quantity, product.stock) }];
      }
      return current.map((item) =>
        item.product.id === product.id
          ? { ...item, product, quantity: Math.min(item.quantity + quantity, product.stock) }
          : item,
      );
    });
  }

  function setQuantity(productId: string, quantity: number) {
    setItems((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.min(quantity, item.product.stock, 999) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(productId: string) {
    setItems((current) => current.filter((item) => item.product.id !== productId));
  }

  function clearCart() {
    setItems([]);
  }

  const value = useMemo(() => {
    const cartCount = items.reduce((total, item) => total + item.quantity, 0);
    const totalUsd = items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );
    const hasKhrPrices = items.length > 0 && items.every((item) => item.product.priceKhr !== null);
    const totalKhr = hasKhrPrices
      ? items.reduce((total, item) => total + (item.product.priceKhr || 0) * item.quantity, 0)
      : null;

    return {
      items,
      cartCount,
      totalUsd,
      totalKhr,
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
