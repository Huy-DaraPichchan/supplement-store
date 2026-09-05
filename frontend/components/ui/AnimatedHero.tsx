"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

type AnimatedHeroProps = {
  eyebrow: ReactNode;
  heading: ReactNode;
  description?: ReactNode;
  children?: ReactNode; // search form, badges, CTAs — anything below the copy
  className?: string;
};

export function AnimatedHero({ eyebrow, heading, description, children, className }: AnimatedHeroProps) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className={className}>
      <motion.div variants={item}>{eyebrow}</motion.div>
      <motion.div variants={item}>{heading}</motion.div>
      {description && <motion.div variants={item}>{description}</motion.div>}
      {children && <motion.div variants={item}>{children}</motion.div>}
    </motion.div>
  );
}
