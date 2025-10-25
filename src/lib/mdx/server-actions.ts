/**
 * Server-side actions for loading MDX module content.
 * This file is marked as a server-only module to ensure these functions
 * are never included in the client-side bundle.
 */
import 'server-only';

import fs from 'node:fs/promises';
import path from 'node:path';

import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';

import { validateModuleFrontmatter } from '@/lib/mdx/module-schema';
import { SLUG_TO_FILENAME } from './slug-map';

export async function getModuleContent(slug: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = !!process.env.VERCEL;

  if (isVercel || isProduction) {
    console.log('[Module] Loading:', {
      slug,
      environment: process.env.NODE_ENV,
      platform: isVercel ? 'Vercel' : 'Other',
      cwd: process.cwd(),
    });
  }

  try {
    const filename = SLUG_TO_FILENAME[slug];
    if (!filename) {
      console.error(`[Module Error] No filename mapping for slug: ${slug}`);
      return null;
    }

    const cachePath = path.join(process.cwd(), 'public', '.mdx-cache', `${filename}.json`);

    try {
      const cacheContent = await fs.readFile(cachePath, 'utf8');
      const bundled = JSON.parse(cacheContent);

      const validation = validateModuleFrontmatter(bundled.frontmatter, filename);
      if (!validation.success || !validation.data) {
        console.error(
          `[Module Error] Invalid cached frontmatter in ${filename}:`,
          validation.errors
        );
        return null;
      }

      if (isVercel || isProduction) {
        console.log(`[Module] ✓ Loaded from cache: ${filename}`);
      }

      return {
        frontmatter: validation.data,
        content: bundled.content,
        slug,
        filePath: cachePath,
      };
    } catch (cacheError) {
      if (isVercel) {
        console.error(`[Module Error] Cache miss on Vercel for ${filename}:`, {
          error: cacheError instanceof Error ? cacheError.message : cacheError,
          cachePath,
          expectedFile: `${filename}.json`,
        });
        return null;
      }

      console.warn(`[Module Warning] Cache miss, reading source file: ${filename}`);

      const modulePath = path.join(process.cwd(), 'src', 'content', 'modules', filename);

      try {
        await fs.access(modulePath);
      } catch (error) {
        console.error(`[Module Error] Source file not found: ${modulePath}`);
        return null;
      }

      const fileContent = await fs.readFile(modulePath, 'utf8');
      const { data: frontmatter, content } = matter(fileContent);

      const validation = validateModuleFrontmatter(frontmatter, modulePath);
      if (!validation.success || !validation.data) {
        console.error(`[Module Error] Invalid frontmatter in ${filename}:`, validation.errors);
        return null;
      }

      const mdxSource = await serialize(content, {
        mdxOptions: {
          remarkPlugins: [],
          rehypePlugins: [],
          development: false,
          format: 'mdx',
        },
      });

      console.log(`[Module] ✓ Loaded from source: ${filename}`);

      return {
        frontmatter: validation.data,
        content: mdxSource,
        slug,
        filePath: modulePath,
      };
    }
  } catch (error) {
    console.error(`[Module Error] Failed to load module ${slug}:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
}
