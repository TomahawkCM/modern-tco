/**
 * MDX Wrapper Component - Styling wrapper for MDX content
 * Provides consistent styling for study module content
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
        "prose-headings:text-foreground prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4",
        "prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:text-primary",
        "prose-h3:text-lg prose-h3:font-medium prose-h3:mb-2 prose-h3:text-muted-foreground",
        // Paragraphs and text
        "prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4",
        "prose-strong:text-foreground prose-strong:font-semibold",
        "prose-em:text-muted-foreground",
        // Lists
        "prose-ul:text-muted-foreground prose-ol:text-muted-foreground",
        "prose-li:mb-1 prose-li:leading-relaxed",
        // Links
        "prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary hover:prose-a:underline",
        // Code
        "prose-code:bg-card prose-code:text-primary prose-code:px-2 prose-code:py-1 prose-code:rounded",
        "prose-pre:bg-card prose-pre:border prose-pre:border-border",
        // Blockquotes
        "prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-primary/10",
        "prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:text-muted-foreground prose-blockquote:italic",
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
    <h1 {...props} className="mb-4 flex items-center gap-2 text-2xl font-bold text-foreground">
      📚 {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 {...props} className="mb-3 flex items-center gap-2 text-xl font-semibold text-primary">
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 {...props} className="mb-2 text-lg font-medium text-muted-foreground">
      {children}
    </h3>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      {...props}
      className="rounded-r-lg border-l-4 border-blue-500 bg-primary/10 py-2 pl-4"
    >
      <div className="italic text-muted-foreground">{children}</div>
    </blockquote>
  ),
  ol: ({ children, ...props }: any) => (
    <ol {...props} className="space-y-2 text-muted-foreground">
      {children}
    </ol>
  ),
  ul: ({ children, ...props }: any) => (
    <ul {...props} className="space-y-2 text-muted-foreground">
      {children}
    </ul>
  ),
  li: ({ children, ...props }: any) => (
    <li {...props} className="leading-relaxed">
      {children}
    </li>
  ),
  code: ({ children, ...props }: any) => (
    <code {...props} className="rounded bg-card px-2 py-1 text-sm text-primary">
      {children}
    </code>
  ),
  pre: ({ children, ...props }: any) => (
    <pre {...props} className="overflow-x-auto rounded-lg border border-border bg-card p-4">
      {children}
    </pre>
  ),
  // Custom components use explicit imports in MDX files (not from provider)
};
