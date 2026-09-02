"use client";

import AboutHeroSlider from "@/components/HeroSlider";
import { motion } from "framer-motion";
import { div } from "framer-motion/client";

export default function AboutPage() {
  return (
    <div>
      <AboutHeroSlider />

    <div className="min-h-screen py-16">
      <div className="mx-auto max-w-4xl px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-6"
        >
          About Us
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose dark:prose-invert"
        >
          <p>
            We are a team dedicated to providing high-quality products and
            services. Our mission is to innovate and exceed customer
            expectations.
          </p>
          <p>
            Founded in 2024, we have grown from a small startup to a trusted
            brand. Our values include integrity, innovation, and customer
            focus.
          </p>
        </motion.div>
      </div>
    </div>
    </div>
  );
}