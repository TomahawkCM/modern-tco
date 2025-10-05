/**
 * MDX Wrapper Component - Styling wrapper for MDX content
 * Provides consistent styling for study module content
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// Dynamic imports to prevent commons chunk extraction
const MicroQuizMDX = dynamic(() => import("./MicroQuizMDX"));
const InfoBox = dynamic(() => import("./InfoBox"));
const PracticeButton = dynamic(() => import("./PracticeButton"));
const QueryPlayground = dynamic(() => import("./QueryPlayground"));
const MicroSection = dynamic(() => import("./MicroSection"));
const ModuleTransition = dynamic(() => import("./ModuleTransition"));

interface MDXWrapperProps {
  children: ReactNode;
  className?: string;
}

export function MDXWrapper({ children, className }: MDXWrapperProps) {
  return (
    <div
      className={cn(
        "prose prose-invert max-w-none",
        // Headings
        "prose-headings:text-white prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4",
        "prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:text-blue-300",
        "prose-h3:text-lg prose-h3:font-medium prose-h3:mb-2 prose-h3:text-blue-200",
        // Paragraphs and text
        "prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4",
        "prose-strong:text-white prose-strong:font-semibold",
        "prose-em:text-blue-200",
        // Lists
        "prose-ul:text-gray-300 prose-ol:text-gray-300",
        "prose-li:mb-1 prose-li:leading-relaxed",
        // Links
        "prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300 hover:prose-a:underline",
        // Code
        "prose-code:bg-slate-800 prose-code:text-blue-300 prose-code:px-2 prose-code:py-1 prose-code:rounded",
        "prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700",
        // Blockquotes
        "prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-500/10",
        "prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:text-blue-200 prose-blockquote:italic",
        className
      )}
    >
      <div className="space-y-6">{children}</div>
    </div>
  );
}

// Custom MDX components for enhanced styling
export const mdxComponents = {
  h1: ({ children, ...props }: any) => (
    <h1 {...props} className="mb-4 flex items-center gap-2 text-2xl font-bold text-white">
      📚 {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 {...props} className="mb-3 flex items-center gap-2 text-xl font-semibold text-blue-300">
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 {...props} className="mb-2 text-lg font-medium text-blue-200">
      {children}
    </h3>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      {...props}
      className="rounded-r-lg border-l-4 border-blue-500 bg-blue-500/10 py-2 pl-4"
    >
      <div className="italic text-blue-200">{children}</div>
    </blockquote>
  ),
  ol: ({ children, ...props }: any) => (
    <ol {...props} className="space-y-2 text-gray-300">
      {children}
    </ol>
  ),
  ul: ({ children, ...props }: any) => (
    <ul {...props} className="space-y-2 text-gray-300">
      {children}
    </ul>
  ),
  li: ({ children, ...props }: any) => (
    <li {...props} className="leading-relaxed">
      {children}
    </li>
  ),
  code: ({ children, ...props }: any) => (
    <code {...props} className="rounded bg-slate-800 px-2 py-1 text-sm text-blue-300">
      {children}
    </code>
  ),
  pre: ({ children, ...props }: any) => (
    <pre {...props} className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-900 p-4">
      {children}
    </pre>
  ),
  // Interactive components - dynamically imported to prevent commons extraction
  MicroQuizMDX,
  InfoBox,
  PracticeButton,
  QueryPlayground,
  MicroSection,
  ModuleTransition,
};
