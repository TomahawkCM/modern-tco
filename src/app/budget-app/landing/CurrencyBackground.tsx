"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const CURRENCIES = [
  { symbol: "$", size: "text-6xl" },
  { symbol: "€", size: "text-5xl" },
  { symbol: "£", size: "text-7xl" },
  { symbol: "¥", size: "text-5xl" },
  { symbol: "₹", size: "text-6xl" },
  { symbol: "₩", size: "text-4xl" },
  { symbol: "₿", size: "text-8xl" },
  { symbol: "Ξ", size: "text-6xl" },
  { symbol: "CHF", size: "text-4xl" },
  { symbol: "A$", size: "text-5xl" },
];

export function CurrencyBackground() {
  const [items, setItems] = useState<
    Array<{
      id: number;
      symbol: string;
      size: string;
      x: number;
      delay: number;
      duration: number;
    }>
  >([]);

  useEffect(() => {
    // Generate random positions for currency symbols
    const newItems = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      symbol: CURRENCIES[Math.floor(Math.random() * CURRENCIES.length)].symbol,
      size: CURRENCIES[Math.floor(Math.random() * CURRENCIES.length)].size,
      x: Math.random() * 100, // Random percentage for x position
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 20, // Slow, floating duration
    }));
    setItems(newItems);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
      {items.map((item) => (
        <motion.div
          key={item.id}
          className={`absolute font-bold text-yellow-400/5 ${item.size} drop-shadow-lg`}
          initial={{
            y: "110vh",
            x: `${item.x}vw`,
            opacity: 0,
            rotate: 0,
          }}
          animate={{
            y: "-10vh",
            opacity: [0, 0.4, 0], // Fade in then out
            rotate: [0, 360], // Gentle rotation
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: "linear",
          }}
          style={{
            textShadow: "0 4px 20px rgba(250, 204, 21, 0.1)", // Glow effect safely
          }}
        >
          {item.symbol}
        </motion.div>
      ))}

      {/* Nano Banana Glow Overlay */}
      <div className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-yellow-500/10 blur-[100px]" />
      <div className="absolute bottom-0 left-0 h-[600px] w-[600px] -translate-x-1/4 translate-y-1/2 rounded-full bg-amber-500/5 blur-[120px]" />
    </div>
  );
}
