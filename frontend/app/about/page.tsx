import { AnimatedHero } from "@/components/ui/AnimatedHero";
import { Marquee } from "@/components/ui/Marquee";
import { TextGenerateEffect } from "@/components/ui/TextGenerateEffect";
import { Check } from "lucide-react";

const principles = [
  [
    "Practical selection",
    "A catalog organized around products people can understand and compare.",
  ],
  [
    "Clear information",
    "Straightforward pricing, availability, and product details without unnecessary claims.",
  ],
  [
    "Human ordering",
    "A simple cart that hands the final conversation to the store's chat channel.",
  ],
];

function PrincipleCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex w-80 shrink-0 flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-card">
      <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Check className="size-4" />
      </span>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

// Add this new section in AboutPage, after the principles Marquee
function ImageMarqueeRow({
  reverse,
  seed,
}: {
  reverse?: boolean;
  seed: number;
}) {
  const images = Array.from(
    { length: 6 },
    (_, i) => `https://picsum.photos/seed/purevita-${seed}-${i}/400/280`,
  );

  return (
    <Marquee
      reverse={reverse}
      speed={reverse ? 45 : 38}
      pauseOnHover
      className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
    >
      {images.map((src, i) => (
        <div
          key={i}
          className="h-40 w-56 shrink-0 overflow-hidden rounded-xl border border-border shadow-card sm:h-48 sm:w-64"
        >
          <img
            src={src}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </Marquee>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <AnimatedHero
            eyebrow={
              <p className="text-sm font-medium text-primary">About Vista Care</p>
            }
            heading={
              <TextGenerateEffect
                words="A simpler way to browse everyday wellness products."
                className="font-heading mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
              />
            }
            description={
              <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
                Vista Care is designed to make product discovery feel familiar,
                focused, and easy to continue from any device.
              </p>
            }
          />
        </div>
      </section>
      <section className="border-t border-border bg-background py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-semibold">
            What guides the experience
          </h2>
        </div>
        <div className="mt-6">
          <Marquee
            speed={35}
            className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
          >
            {principles.map(([title, description]) => (
              <PrincipleCard
                key={title}
                title={title}
                description={description}
              />
            ))}
          </Marquee>
        </div>
      </section>

      <section className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-semibold">A closer look</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            A glimpse of the everyday essentials people come to Vista Care for.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <ImageMarqueeRow seed={1} />
          <ImageMarqueeRow seed={2} reverse />
        </div>
      </section>
    </main>
  );
}
