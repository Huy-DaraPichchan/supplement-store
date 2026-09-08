import Link from "next/link";

const links = [
  { label: "All products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Business", href: "/business" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-3 py-10 sm:px-6 sm:py-12 md:grid-cols-[1.4fr_0.6fr_0.7fr] lg:px-8">
        <div className="max-w-sm">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Vista <span className="text-primary">Care</span>
          </Link>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            A cleaner, more straightforward way to browse wellness essentials and order directly with the store.
          </p>
        </div>
        <div>
          <p className="text-base font-semibold">Explore</p>
          <nav aria-label="Footer navigation" className="mt-3 flex flex-col items-start gap-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="flex min-h-11 items-center text-base text-muted-foreground transition-colors hover:text-primary sm:min-h-0">
              {link.label}
            </Link>
          ))}
          </nav>
        </div>
        <div>
          <p className="text-base font-semibold">Ordering</p>
          <p className="mt-3 text-base leading-7 text-muted-foreground">No account required. Add products to your cart and continue your order through chat.</p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Vista Care</p>
          <p>Wellness shopping made clear.</p>
        </div>
      </div>
    </footer>
  );
}
