"use client";

import React from "react";

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-br from-gray-900/90 via-black/95 to-gray-900/90" />
  );
};
