import { Check } from "lucide-react";

const principles = [
  ["Practical selection", "A catalog organized around products people can understand and compare."],
  ["Clear information", "Straightforward pricing, availability, and product details without unnecessary claims."],
  ["Human ordering", "A simple cart that hands the final conversation to the store's chat channel."],
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-sm font-medium text-primary">About PureVita</p>
          <h1 className="font-heading mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            A simpler way to browse everyday wellness products.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            PureVita is designed to make product discovery feel familiar, focused, and easy to continue from any device.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="font-heading text-xl font-semibold">What guides the experience</h2>
        <div className="mt-6 divide-y divide-border border-y border-border">
          {principles.map(([title, description]) => (
            <div key={title} className="grid gap-2 py-6 sm:grid-cols-[14rem_1fr]">
              <h3 className="flex items-center gap-2 font-medium"><Check className="size-4 text-primary" />{title}</h3>
              <p className="text-base leading-7 text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
