'use client';

import React from 'react';

interface StepItemProps {
  title: string;
  children: React.ReactNode;
}

/**
 * StepItem Component - Flattened version of Steps.Step
 * Used in MDX content as a standalone component to avoid compound component issues
 * with Next.js 15 server components and next-mdx-remote
 */
export default function StepItem({ title, children }: StepItemProps) {
  return (
    <div className="step-item flex gap-4" data-step>
      {/* Step number indicator - uses CSS counter */}
      <div className="flex flex-col items-center">
        <div className="step-number flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-sm font-semibold text-primary" />
        {/* Connecting line */}
        <div className="mt-1 h-full w-0.5 bg-border step-connector" />
      </div>

      {/* Step content */}
      <div className="flex-1 pb-6">
        <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
        <div className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
}