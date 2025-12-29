"use client";

import { useEffect, useState } from "react";

/**
 * Tailwind CSS default breakpoints (in pixels)
 * These values match Tailwind's default configuration
 * DO NOT modify tailwind.config.ts - use these constants instead
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/**
 * Device classification based on screen width
 * - phone: < 768px (below md breakpoint)
 * - tablet: 768px - 1023px (md to below lg)
 * - desktop: >= 1024px (lg and above)
 */
export type DeviceClass = "phone" | "tablet" | "desktop";

/**
 * Get device class based on viewport width
 * @param width - Viewport width in pixels
 * @returns DeviceClass classification
 *
 * @example
 * getDeviceClass(375)  // 'phone'
 * getDeviceClass(768)  // 'tablet'
 * getDeviceClass(1024) // 'desktop'
 */
export function getDeviceClass(width: number): DeviceClass {
  if (width < BREAKPOINTS.md) {
    return "phone";
  }
  if (width < BREAKPOINTS.lg) {
    return "tablet";
  }
  return "desktop";
}

/**
 * React hook to get current device class based on window width
 * Updates on window resize with debouncing for performance
 *
 * @returns Current DeviceClass or null during SSR
 *
 * @example
 * function MyComponent() {
 *   const deviceClass = useDeviceClass();
 *
 *   if (deviceClass === 'phone') {
 *     return <MobileLayout />;
 *   }
 *   return <DesktopLayout />;
 * }
 */
export function useDeviceClass(): DeviceClass | null {
  const [deviceClass, setDeviceClass] = useState<DeviceClass | null>(null);

  useEffect(() => {
    // Initial calculation
    const updateDeviceClass = () => {
      setDeviceClass(getDeviceClass(window.innerWidth));
    };

    // Set initial value
    updateDeviceClass();

    // Debounced resize handler for performance
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDeviceClass, 150);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return deviceClass;
}
