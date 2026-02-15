"use client";

/**
 * Success Checkmark Animation Component (Phase 4.1.2)
 * Animated SVG checkmark for successful actions using Framer Motion
 *
 * Usage:
 * <SuccessCheckmark show={isSuccess} onComplete={() => setIsSuccess(false)} />
 */

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface SuccessCheckmarkProps {
  show: boolean;
  onComplete?: () => void;
  size?: "sm" | "md" | "lg";
  message?: string;
}

const sizes = {
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-24 h-24",
};

const iconSizes = {
  sm: 24,
  md: 32,
  lg: 48,
};

export function SuccessCheckmark({
  show,
  onComplete,
  size = "md",
  message,
}: SuccessCheckmarkProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          onAnimationComplete={() => {
            if (onComplete) {
              setTimeout(onComplete, 1500); // Auto-hide after 1.5s
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={onComplete}
        >
          <motion.div
            className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
          >
            {/* Animated checkmark circle */}
            <motion.div
              className={`${sizes[size]} relative flex items-center justify-center overflow-hidden rounded-full bg-green-500`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              {/* Ripple effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-green-400"
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />

              {/* Checkmark icon */}
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <Check className="text-white" size={iconSizes[size]} strokeWidth={3} />
              </motion.div>
            </motion.div>

            {/* Optional success message */}
            {message && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg font-semibold text-gray-900"
              >
                {message}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Inline success checkmark (smaller, for toast-like notifications)
 */
export function InlineSuccessCheckmark({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-500"
        >
          <Check className="text-white" size={16} strokeWidth={3} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
