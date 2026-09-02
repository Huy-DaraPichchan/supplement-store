"use client";

import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "./ui/context";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";

const navItems = [
  { name: "Shop", href: "/products" },
  { name: "About Us", href: "/about" },
  { name: "Business", href: "/business" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="bg-emerald-700 px-4 py-2 text-center text-[11px] font-semibold tracking-wide text-white sm:text-xs">
        Free shipping on orders over $50 · Your daily wellness, delivered
      </div>
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 text-xl font-black tracking-tight text-emerald-700 dark:text-emerald-400">
          Pure<span className="text-slate-900 dark:text-white">Vita</span>
        </Link>

        <div className="hidden flex-1 md:block md:max-w-md md:px-6">
          <Link href="/products" className="flex h-10 items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-400 transition-colors hover:border-emerald-500 dark:border-slate-700 dark:bg-slate-900">
            <Search className="h-4 w-4" />
            Search vitamins, minerals, and more
          </Link>
        </div>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex dark:text-slate-300">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className="transition-colors hover:text-emerald-600">
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <AnimatedThemeToggler className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" />
          <button type="button" aria-label={`Shopping bag with ${cartCount} items`} className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-slate-800">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold text-white">{cartCount}</span>}
          </button>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 md:hidden dark:text-slate-200" onClick={() => setIsOpen((open) => !open)} aria-label="Toggle menu">
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isOpen && (
        <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="border-t border-slate-200 px-4 py-4 md:hidden dark:border-slate-800">
          <Link href="/products" className="mb-4 flex h-10 items-center gap-3 rounded-full border border-slate-200 px-4 text-sm text-slate-500 dark:border-slate-700" onClick={() => setIsOpen(false)}>
            <Search className="h-4 w-4" /> Search products
          </Link>
          <div className="flex flex-col gap-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>{item.name}</Link>
            ))}
          </div>
        </motion.nav>
      )}
    </header>
  );
}
