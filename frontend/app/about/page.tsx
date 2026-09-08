"use client";

import { useState, MouseEvent, useEffect } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import Image from "next/image";
import { AnimatedHero } from "@/components/ui/AnimatedHero";
import { TextGenerateEffect } from "@/components/ui/TextGenerateEffect";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const viewport = { once: true, margin: "-80px" };

function SpotlightPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <motion.div
      variants={fadeUp}
      onMouseMove={handleMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className="relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-colors"
      style={{
        background: active
          ? `radial-gradient(360px circle at ${pos.x}% ${pos.y}%, hsl(var(--primary) / 0.08), transparent 70%), hsl(var(--card))`
          : undefined,
      }}
    >
      <h3 className="font-heading text-lg font-semibold tracking-tight">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </motion.div>
  );
}

/* ---------- Divided tag row ---------- */
function TagRow({ items }: { items: string[] }) {
  return (
    <motion.ul
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      className="flex flex-wrap items-center gap-x-6 gap-y-3"
    >
      {items.map((item, i) => (
        <motion.li
          key={item}
          variants={fadeUp}
          className="flex items-center gap-6"
        >
          <span className="text-sm font-medium text-foreground">{item}</span>
          {i < items.length - 1 && (
            <span className="h-4 w-px bg-border" aria-hidden="true" />
          )}
        </motion.li>
      ))}
    </motion.ul>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-4 mx-auto max-w-7xl">
      {/* Hero — split layout: copy + image */}
      <section className="border-b border-border bg-card max-w-7xl mx-auto">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 px-4 py-6 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <AnimatedHero
            eyebrow={
              <p className="text-sm font-medium text-primary">
                About VISTA Care
              </p>
            }
            heading={
              <TextGenerateEffect
                words="VISTA Care Co., Ltd."
                className="font-heading mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
              />
            }
            description={
              <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
                A Cambodia-based health and wellness company specializing in the
                import, distribution, marketing, and retail of vitamins, dietary
                supplements, and wellness products. We source from reputable
                manufacturers and wholesalers in the USA, Australia, UK, and
                other established markets, and are building a multi-channel
                business across pharmacies, health stores, retailers, B2B
                distribution, e-commerce, and social commerce — a trusted,
                professional distribution business in Cambodia built on strong
                international supplier partnerships.
              </p>
            }
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="relative aspect-[4/5] w-full overflow-hidden rounded-lg sm:aspect-[4/3] lg:aspect-[4/5]"
          >
            <Image
              src="/about.jpg"
              alt="VISTA Care product display"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="border-b border-border"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:gap-0 lg:px-8">
          <motion.div
            variants={fadeUp}
            className="md:border-r md:border-border md:pr-10"
          >
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Our Mission
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              To make trusted, high-quality vitamins and nutritional products
              more accessible to consumers in Cambodia — through responsible
              sourcing, authentic products, quality standards, and
              customer-focused service.
            </p>
          </motion.div>
          <motion.div variants={fadeUp} className="md:pl-10">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Our Vision
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              To become a trusted, leading distributor of international
              vitamins, supplements, and wellness products in Cambodia. In the
              long term, VISTA Care will also develop selected VISTA
              private-label products through qualified international OEM
              manufacturers.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Full-bleed image strip — breaks up the text-heavy middle */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={viewport}
        transition={{ duration: 0.6 }}
        className="border-b border-border rounded-4xl"
      >
        <ImagesSlider images={["/banner.jpg", "/about.jpg"]} />
      </motion.section>

      {/* OEM & Supplier Partnerships */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="border-b border-border bg-card"
      >
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.h2
            variants={fadeUp}
            className="font-heading text-xl font-semibold tracking-tight"
          >
            International OEM & Supplier Partnerships
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground"
          >
            VISTA Care is actively seeking reputable USA, Australian, and
            international manufacturers and wholesalers for long-term
            cooperation. Our purchasing strategy begins with selected products
            for market introduction, then increases order volumes through repeat
            purchases and portfolio expansion as demand grows. We're
            particularly interested in manufacturers who can offer reliable
            product quality, competitive pricing, and the documentation required
            for the Cambodian market.
          </motion.p>
          <div className="mt-6">
            <TagRow
              items={[
                "International Brands",
                "Wholesale Supply",
                "OEM / Private Label",
                "Distribution Partnerships",
              ]}
            />
          </div>
        </div>
      </motion.section>

      {/* Why Partner */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="border-b border-border"
      >
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.h2
            variants={fadeUp}
            className="font-heading text-xl font-semibold tracking-tight"
          >
            Why Partner With VISTA Care?
          </motion.h2>
          <motion.div
            variants={stagger}
            className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <SpotlightPanel
              title="Local Market Knowledge"
              description="Understanding of Cambodian consumer demand and purchasing behavior."
            />
            <SpotlightPanel
              title="Multi-Channel Distribution"
              description="Pharmacy, retail, B2B, e-commerce, and social commerce channels."
            />
            <SpotlightPanel
              title="Long-Term Growth Strategy"
              description="Focus on repeat purchasing and increasing volumes as products gain market acceptance."
            />
            <SpotlightPanel
              title="OEM Development"
              description="Opportunity to develop VISTA-branded products with qualified international manufacturers."
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Commitment */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="border-b border-border bg-card"
      >
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <motion.h2
            variants={fadeUp}
            className="font-heading text-xl font-semibold tracking-tight"
          >
            Our Commitment
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-3 text-base leading-7 text-muted-foreground"
          >
            We believe successful partnerships are built on quality, trust,
            transparency, and long-term growth. VISTA Care welcomes partnerships
            with manufacturers and wholesalers who want to develop the Cambodian
            vitamins and wellness market together.
          </motion.p>
          <div className="mt-6 flex justify-center">
            <TagRow
              items={["Quality", "Trust", "Transparency", "Long-Term Growth"]}
            />
          </div>
        </div>
      </motion.section>

      {/* Closing band */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        <div className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <p className="font-heading text-base font-semibold tracking-tight">
            VISTA Care Co., Ltd.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Cambodia</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Vitamins · Supplements · Wellness
          </p>
          <p className="mt-1 text-sm font-medium text-primary">
            Better Health, Better Life
          </p>
        </div>
      </motion.section>
    </main>
  );
}

function ImagesSlider({
  images,
  autoplayMs = 5000,
}: {
  images: string[];
  autoplayMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, autoplayMs);
    return () => clearInterval(id);
  }, [images.length, autoplayMs]);

  return (
    <div className="relative aspect-[21/9] w-full overflow-hidden sm:aspect-[3/1]">
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={images[index]}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1.06 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1 },
            scale: { duration: autoplayMs / 1000, ease: "linear" },
          }}
          className="absolute inset-0"
        >
          <Image
            src={images[index]}
            alt="VISTA Care"
            fill
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* subtle scrim so future overlay text/dots stay legible */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
