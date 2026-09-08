"use client";

import { Dialog } from "@base-ui/react/dialog";
import { getCategories, type Category } from "@/lib/api";
<<<<<<< Updated upstream
import { ChevronRight, Menu, X } from "lucide-react";
import Image from "next/image";
=======
import { Menu, X } from "lucide-react";
>>>>>>> Stashed changes
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CartDrawer from "./CartDrawer";
// import SearchForm from "./SearchForm";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { name: "Store", href: "/products" },
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Business", href: "/business" },
];

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return navItems.map((item) => {
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
    const className = `${mobile ? "flex h-11 items-center rounded-md px-3" : "py-2"} text-base font-medium transition-colors duration-150 ${
      active ? "text-primary" : "text-muted-foreground hover:text-foreground"
    }`;

    if (mobile) {
      return (
        <Dialog.Close
          key={item.href}
          nativeButton={false}
          render={<Link href={item.href} aria-current={active ? "page" : undefined} />}
          className={className}
        >
          {item.name}
        </Dialog.Close>
      );
    }

    return (
      <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={className}>
        {item.name}
      </Link>
    );
  });
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
            <Dialog.Title>
              <Dialog.Close
                nativeButton={false}
                render={
                  <Link
                    href="/"
                    className="inline-flex rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  />
                }
              >
                <Image
                  src="/vista-care-logo.svg"
                  width={118}
                  height={56}
                  alt="Vista Care"
                  className="h-10 w-auto"
                />
              </Dialog.Close>
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
        <Link
          href="/"
          className="shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Image
            src="/vista-care-logo.svg"
            width={118}
            height={56}
            alt="Vista Care"
            className="h-10 w-auto"
          />
        </Link>
        {/* <SearchForm className="hidden min-w-0 flex-1 md:block md:max-w-xl" /> */}
        <nav className="ml-auto hidden items-center gap-6 md:flex">
          <NavLinks />
        </nav>
        <div className="ml-auto flex items-center md:ml-2 md:gap-1">
          <ThemeToggle />
          <CartDrawer />
        </div>
      </div>
      {/* <div className="px-3 pb-3 md:hidden">
        <SearchForm />
      </div> */}
    </header>
  );
}
