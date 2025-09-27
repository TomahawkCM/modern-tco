/**
 * Module Detail Page - Renders a single module by slug.
 * Tries filesystem-backed loader first; falls back to dynamic MDX import in production.
 */

import { notFound } from "next/navigation";
import ModuleRenderer from "@/components/modules/ModuleRenderer";
import { loadModuleBySlug } from "@/lib/mdx/module-loader";
import { loadMDXContent, getMDXMetadata } from "@/lib/mdx-loader";

interface ModulePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { slug } = await params;
  // Try filesystem-backed loader
  const moduleData = await loadModuleBySlug(slug);
  if (moduleData) {
    return <ModuleRenderer moduleData={moduleData} />;
  }

  // Fallback: dynamic MDX import (works well on Vercel without fs)
  const mdxModule = await loadMDXContent(slug);
  if (!mdxModule) return notFound();
  const meta = getMDXMetadata(mdxModule);

  const MDXContent = mdxModule.default as any;
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-4xl font-bold text-transparent">
        {meta.title}
      </h1>
      <div className="prose prose-lg prose-invert max-w-none">
        <MDXContent />
      </div>
    </div>
  );
}
