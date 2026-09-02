"use client";

import { motion } from "framer-motion";

export default function BusinessPage() {
  return (
    <div className="min-h-screen py-16">
      <div className="mx-auto max-w-4xl px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-6"
        >
          Our Business
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-muted-foreground"
        >
          We work with partners worldwide to deliver solutions that drive
          growth and efficiency.
        </motion.p>
        {/* Add more business-oriented content, stats, etc. */}
      </div>
    </div>
  );
}