"use client";

import { ImagesSlider } from "@/components/ui/images-slider"; // Ensure this is the patched version
import { motion } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

// Replace with your actual logo path
const LOGO_SRC = "/logo.png"; // Place a logo file in public/

const images = [
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071",
];

export default function AboutHeroSlider() {
  const logoRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative h-[90vh] min-h-[600px] overflow-hidden">
      {/* Background image slider with Ken Burns effect */}
      <ImagesSlider
        images={images}
        autoplay={true}
        direction="up"
        overlay={false} // We'll use our own overlay
        className="absolute inset-0"
      >
        {/* This children will be rendered on top of the slider, but we don't need to put content here */}
        <div />
      </ImagesSlider>

      {/* Custom gradient overlay for better text visibility */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/40 to-black/70" />

      {/* Animated logo & text content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center">
        {/* Logo with entry animation */}
        <motion.div
          ref={logoRef}
          initial={{ scale: 0, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="mb-8"
        >
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center shadow-2xl">
            <Image
              src={LOGO_SRC}
              alt="Company Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg"
        >
          About Our Company
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-6 max-w-2xl text-lg md:text-xl text-gray-200"
        >
          We are a team of passionate innovators dedicated to crafting exceptional
          digital experiences. Our mission is to push boundaries and deliver
          solutions that truly make a difference.
        </motion.p>

        {/* Call-to-action button */}
        <motion.a
          href="/business"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-10 inline-block rounded-full bg-primary px-10 py-4 text-sm font-semibold text-white shadow-lg hover:bg-primary/90 transition-colors"
        >
          Learn More
        </motion.a>
      </div>

      {/* Custom navigation dots overlay (optional, but we can add if needed) */}
      {/* The ImagesSlider already has keyboard support; we can also add dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-3">
        {images.map((_, index) => (
          <button
            key={index}
            className="h-2 w-8 rounded-full bg-white/30 hover:bg-white/60 transition-colors"
            aria-label={`Slide ${index + 1}`}
            // We would need to control currentIndex from ImagesSlider, but it doesn't expose it.
            // This is just visual; you can implement your own slider state if needed.
          />
        ))}
      </div>
    </div>
  );
}
