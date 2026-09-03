"use client";

import { Dialog } from "@base-ui/react/dialog";
import { getCategories, type Category } from "@/lib/api";
import { ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import CartDrawer from "./CartDrawer";
import SearchForm from "./SearchForm";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Business", href: "/business" },
];

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return navItems.map((item) => {
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`${mobile ? "flex h-11 items-center rounded-md px-3" : "py-2"} text-base font-medium transition-colors duration-150 ${
          active ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {item.name}
      </Link>
    );
  });
}

function MobileCategoryLinks({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = pathname === "/products" ? searchParams.get("category") : null;
  const shopAllActive = pathname === "/products" && !activeCategory;

  return (
    <>
      <Dialog.Close
        nativeButton={false}
        render={<Link href="/products" />}
        aria-current={shopAllActive ? "page" : undefined}
        className={`flex min-h-11 items-center justify-between rounded-md px-3 text-base font-medium transition-colors ${
          shopAllActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-primary-soft hover:text-primary"
        }`}
      >
        Shop all<ChevronRight className="size-4" />
      </Dialog.Close>
      {categories.map((category) => {
        const active = activeCategory === category.slug;
        return (
          <Dialog.Close
            key={category.id}
            nativeButton={false}
            render={<Link href={`/products?category=${encodeURIComponent(category.slug)}`} />}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center justify-between rounded-md px-3 text-base font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-primary-soft hover:text-primary"
            }`}
          >
            {category.name}<ChevronRight className="size-4" />
          </Dialog.Close>
        );
      })}
    </>
  );
}

function DesktopCategoryLinks({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = pathname === "/products" ? searchParams.get("category") : null;
  const shopAllActive = pathname === "/products" && !activeCategory;

  return (
    <>
      <Link
        href="/products"
        aria-current={shopAllActive ? "page" : undefined}
        className={`flex h-8 shrink-0 items-center rounded-md px-3 text-sm font-semibold transition-colors ${
          shopAllActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-primary-soft hover:text-primary"
        }`}
      >
        Shop all
      </Link>
      {categories.map((category) => {
        const active = activeCategory === category.slug;
        return (
          <Link
            key={category.id}
            href={`/products?category=${encodeURIComponent(category.slug)}`}
            aria-current={active ? "page" : undefined}
            className={`flex h-8 shrink-0 items-center rounded-md px-3 text-sm font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-primary-soft hover:text-primary"
            }`}
          >
            {category.name}
          </Link>
        );
      })}
    </>
  );
}

function MobileNavigation({ categories }: { categories: Category[] }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring md:hidden">
        <Menu className="size-5" />
        <span className="sr-only">Open navigation</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-foreground/30 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed inset-y-0 left-0 z-50 flex w-[min(22rem,90vw)] flex-col overflow-y-auto border-r border-border bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-panel transition-transform duration-200 ease-out data-ending-style:-translate-x-full data-starting-style:-translate-x-full sm:p-5">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold tracking-tight">
              Pure<span className="text-primary">Vita</span>
            </Dialog.Title>
            <Dialog.Close className="flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <X className="size-5" />
              <span className="sr-only">Close navigation</span>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Primary site navigation</Dialog.Description>
          <nav className="mt-6 flex flex-col gap-1">
            <NavLinks mobile />
          </nav>
          {categories.length > 0 && (
            <div className="mt-6 border-t border-border pt-5">
              <p className="mb-2 px-3 text-sm font-semibold text-muted-foreground">Shop categories</p>
              <nav aria-label="Product categories" className="flex flex-col gap-1">
                <Suspense fallback={null}>
                  <MobileCategoryLinks categories={categories} />
                </Suspense>
              </nav>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function Navbar() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 shadow-card backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
        <MobileNavigation categories={categories} />
        <Link href="/" className="shrink-0 text-xl font-bold tracking-tight">
          Pure<span className="text-primary">Vita</span>
        </Link>
        <SearchForm className="hidden min-w-0 flex-1 md:block md:max-w-xl" />
        <nav className="ml-auto hidden items-center gap-6 md:flex">
          <NavLinks />
        </nav>
        <div className="ml-auto flex items-center md:ml-2 md:gap-1">
          <ThemeToggle />
          <CartDrawer />
        </div>
      </div>
      <div className="px-3 pb-3 md:hidden">
        <SearchForm />
      </div>
      {categories.length > 0 && (
        <div className="hidden border-t border-border bg-card md:block">
          <nav aria-label="Product categories" className="mx-auto flex h-10 max-w-7xl items-center gap-1 overflow-x-auto px-6 lg:px-8">
            <Suspense fallback={null}>
              <DesktopCategoryLinks categories={categories} />
            </Suspense>
          </nav>
        </div>
      )}
    </header>
  );
}
