/**
 * Module Detail Page - Fixed Server Component with MDX
 * Properly handles server-side MDX rendering without client/server conflicts
 */

import { notFound } from 'next/navigation';

import ModuleRenderer from '@/components/modules/ModuleRenderer';
import { getModuleContent } from '@/lib/mdx/server-actions';
import { SLUG_TO_FILENAME } from '@/lib/mdx/slug-map';

interface ModulePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { slug } = await params;

  // Get module content
  const moduleData = await getModuleContent(slug);

  if (!moduleData) {
    notFound();
  }

  return <ModuleRenderer moduleData={moduleData} />;
}

// Generate static params for all modules
export async function generateStaticParams() {
  return Object.keys(SLUG_TO_FILENAME).map((slug) => ({
    slug,
  }));
}

// Metadata generation
export async function generateMetadata({ params }: ModulePageProps) {
  const { slug } = await params;
  const moduleData = await getModuleContent(slug);

  if (!moduleData?.frontmatter) {
    return {
      title: 'Module Not Found',
    };
  }

  return {
    title: `${moduleData.frontmatter?.title || 'Module'} | Tanium TCO Study`,
    description:
      moduleData.frontmatter?.description ||
      `Study module for ${moduleData.frontmatter?.title || 'module'}`,
  };
}
