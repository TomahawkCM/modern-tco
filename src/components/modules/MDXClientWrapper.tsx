"use client";

import React from "react";
import dynamic from "next/dynamic";
import InfoBox from "@/components/mdx/InfoBox";
import PracticeButton from "@/components/mdx/PracticeButton";

interface MDXClientWrapperProps {
  slug: string;
  meta: {
    title: string;
    id: string;
    domainSlug: string;
  };
}

// Dynamically import MDX content based on slug
const mdxModules = {
  "tanium-platform-foundation": dynamic(() => import("@/content/modules/00-tanium-platform-foundation.mdx")),
  "platform-foundation": dynamic(() => import("@/content/modules/00-tanium-platform-foundation.mdx")),
  "asking-questions": dynamic(() => import("@/content/modules/01-asking-questions.mdx")),
  "refining-questions-targeting": dynamic(() => import("@/content/modules/02-refining-questions-targeting.mdx")),
  "taking-action-packages-actions": dynamic(() => import("@/content/modules/03-taking-action-packages-actions.mdx")),
  "navigation-basic-modules": dynamic(() => import("@/content/modules/04-navigation-basic-modules.mdx")),
  "reporting-data-export": dynamic(() => import("@/content/modules/05-reporting-data-export.mdx")),
} as const;

export default function MDXClientWrapper({ slug, meta }: MDXClientWrapperProps) {
  const MDXContent = mdxModules[slug as keyof typeof mdxModules];

  if (!MDXContent) {
    return (
      <div className="text-red-400">
        Module content not found for slug: {slug}
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-4xl font-bold text-transparent">
        {meta.title}
      </h1>
      <div className="prose prose-lg prose-invert max-w-none">
        <MDXContent components={{ InfoBox, PracticeButton }} />
      </div>
    </div>
  );
}