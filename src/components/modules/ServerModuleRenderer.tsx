/**
 * Server Component for rendering MDX modules
 * This properly handles MDX content in React Server Components
 */

import { MDXRemote } from "next-mdx-remote/rsc";
import { serverSafeMdxComponents } from "@/components/mdx/mdx-components";
import ModuleHeader from "./ModuleHeader";
import ModuleFooter from "./ModuleFooter";
import type { ModuleFrontmatter } from "@/lib/mdx/module-schema";

interface ServerModuleRendererProps {
  content: string;
  frontmatter: ModuleFrontmatter;
  slug: string;
}

export default function ServerModuleRenderer({
  content,
  frontmatter,
  slug,
}: ServerModuleRendererProps) {
  // Add PracticeButton as a client component that can be used in MDX
  const components = {
    ...serverSafeMdxComponents,
    // Client components need to be imported dynamically
    PracticeButton: require("@/components/mdx/PracticeButton").default,
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Module Header */}
      <ModuleHeader frontmatter={frontmatter} />

      {/* MDX Content - Server Rendered */}
      <div className="prose prose-lg prose-invert max-w-none">
        <MDXRemote source={content} components={components} />
      </div>

      {/* Module Footer with Practice Button */}
      <ModuleFooter frontmatter={frontmatter} slug={slug} />
    </div>
  );
}