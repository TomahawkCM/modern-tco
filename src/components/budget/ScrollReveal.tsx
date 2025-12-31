"use client";

import { motion } from "framer-motion";
import React from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  width?: "fit-content" | "100%";
}

export const ScrollReveal = ({ children, delay = 0, width = "100%" }: ScrollRevealProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      style={{ width }}
    >
      {children}
    </motion.div>
  );
};
