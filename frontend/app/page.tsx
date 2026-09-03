import HomeCategories from "@/components/HomeCategories";
import ProductGridPreview from "@/components/ProductGridPreview";
import SearchForm from "@/components/SearchForm";
import { ArrowRight, MessageCircle, Search, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";

const benefits = [
  { icon: Search, title: "Easy discovery", text: "Search and filter without digging through crowded menus." },
  { icon: ShieldCheck, title: "Clear information", text: "See pricing and availability before choosing a product." },
  { icon: MessageCircle, title: "Simple ordering", text: "Create your order and continue with the store through chat." },
];

export default function Home() {
  return (
    <main>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <div className="relative overflow-hidden rounded-2xl border border-border-strong bg-background shadow-panel">
            <div className="absolute inset-y-0 right-0 hidden w-[38%] bg-primary-soft lg:block" />
            <div className="relative grid gap-7 px-4 py-7 sm:gap-8 sm:px-9 sm:py-12 lg:grid-cols-[1.35fr_0.65fr] lg:items-center lg:px-12 lg:py-14">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Sparkles className="size-4" /> Everyday wellness, thoughtfully selected
                </p>
                <h1 className="mt-4 max-w-2xl text-2xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
                  Find supplements that fit your routine—not the noise.
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                  Browse practical vitamins, nutrition, and personal-care essentials with clear pricing and simple chat ordering.
                </p>
                <SearchForm variant="hero" className="mt-7 max-w-xl" />
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-primary" /> No account required</span>
                  <span className="flex items-center gap-1.5"><ShoppingBag className="size-4 text-primary" /> Clear stock status</span>
                </div>
              </div>

              <div className="relative lg:pl-5">
                <div className="rounded-xl border border-primary/20 bg-card p-6 shadow-raised sm:p-7">
                  <span className="inline-flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-card">
                    <MessageCircle className="size-5" />
                  </span>
                  <p className="mt-5 text-sm font-semibold text-primary">A simpler way to shop</p>
                  <p className="mt-2 text-xl font-semibold leading-snug">Build your cart, then finish your order directly with the store.</p>
                  <Link href="/products" className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-base font-semibold text-primary-foreground shadow-card transition-[background-color,box-shadow] hover:bg-primary-hover hover:shadow-raised sm:w-auto">
                    Shop the catalog <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeCategories />
      <ProductGridPreview />

      <section className="mx-auto max-w-7xl px-3 pb-10 sm:px-6 sm:pb-16 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-primary/20 bg-primary-soft px-5 py-7 shadow-card sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Shopping should feel straightforward</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Choose your essentials now. Confirm the details in chat.</h2>
            </div>
            <Link href="/products" className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-5 text-base font-semibold text-primary-foreground shadow-card transition-[background-color,box-shadow] hover:bg-primary-hover hover:shadow-raised sm:w-auto">
              Start shopping <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-7 px-3 py-9 sm:px-6 sm:py-10 md:grid-cols-3 lg:px-8">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-base leading-7 text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
