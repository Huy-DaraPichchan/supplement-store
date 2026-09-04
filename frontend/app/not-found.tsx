import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[65dvh] items-center justify-center px-4 py-16 sm:px-6 sm:py-24">
      <section className="w-full max-w-xl rounded-xl border border-border bg-card px-6 py-10 text-center shadow-raised sm:px-10 sm:py-14">
        <span className="mx-auto flex size-12 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Search className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-6 text-sm font-semibold text-primary">Error 404</p>
        <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground">
          This page may have moved or no longer exists. You can return home or continue browsing the catalog.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-input bg-background px-5 text-base font-semibold transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Go home
          </Link>
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-base font-semibold text-primary-foreground shadow-card transition-[background-color,box-shadow] hover:bg-primary-hover hover:shadow-raised"
          >
            Browse products
          </Link>
        </div>
      </section>
    </main>
  );
}
