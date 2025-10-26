"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { LearningNavigation } from '@/components/learning/LearningNavigation';
import { LearningProgressProvider } from '@/components/learning/LearningProgressProvider';

interface LearningLayoutProps {
  children: React.ReactNode;
}

export default function LearningLayout({ children }: LearningLayoutProps) {
  return (
    <LearningProgressProvider>
        <div className="mx-auto max-w-7xl">
          {/* Learning-specific top navigation with progress */}
          <LearningNavigation />
          
          {/* Learning content with consistent spacing and styling */}
          <main className="relative z-10 min-h-[calc(100vh-12rem)] pt-6">
            <div className="learning-content-wrapper">
              {children}
            </div>
          </main>
        </div>
    </LearningProgressProvider>
  );
}
