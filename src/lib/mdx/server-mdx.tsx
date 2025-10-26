/**
 * Server-side MDX rendering with RSC support
 * Properly handles MDX content rendering in React Server Components
 */

import { compileMDX } from "next-mdx-remote/rsc";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";

// Re-export types for convenience
export type { MDXRemoteProps };

/**
 * Compile MDX content for server-side rendering
 * This properly handles MDX in React Server Components without client-side hydration issues
 */
export async function compileMDXContent(
  source: string,
  options?: {
    components?: Record<string, React.ComponentType>;
    scope?: Record<string, any>;
  }
) {
  const { content, frontmatter } = await compileMDX({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [],
        rehypePlugins: [],
      },
    },
    components: options?.components,
  });

  return { content, frontmatter };
}

/**
 * Server Component wrapper for MDX content
 * This ensures proper RSC boundaries
 */
export function ServerMDXContent({
  content,
  components
}: {
  content: React.ReactElement;
  components?: Record<string, React.ComponentType>;
}) {
  // The content is already compiled, just return it
  return content;
}