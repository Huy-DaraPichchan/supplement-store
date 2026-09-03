import { ArrowRight, Building2, MessageCircle, PackageCheck } from "lucide-react";
import Link from "next/link";

const areas = [
  { icon: PackageCheck, title: "Catalog partnerships", text: "Discuss products that are a good fit for the store's current categories and customers." },
  { icon: Building2, title: "Business supply", text: "Start a conversation about recurring or larger product requirements." },
  { icon: MessageCircle, title: "Direct coordination", text: "Keep practical details in one conversation through the store's available chat channels." },
];

export default function BusinessPage() {
  return (
    <main className="min-h-screen">
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-sm font-medium text-primary">Business</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Start a practical conversation with PureVita.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            For catalog, supply, or business enquiries, begin with the products you are interested in and continue through an available store channel.
          </p>
          <Link href="/products" className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover sm:w-auto">
            Browse the catalog <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        {areas.map(({ icon: Icon, title, text }) => (
          <div key={title}>
            <span className="flex size-10 items-center justify-center rounded-md bg-primary-soft text-primary"><Icon className="size-5" /></span>
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-2 text-base leading-7 text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
