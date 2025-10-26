'use client';

import React from 'react';
import { LearningProgressProvider } from '@/components/learning/LearningProgressProvider';

interface StudyLayoutProps {
  children: React.ReactNode;
}

export default function StudyLayout({ children }: StudyLayoutProps) {
  return (
    <LearningProgressProvider>
      {children}
    </LearningProgressProvider>
  );
}