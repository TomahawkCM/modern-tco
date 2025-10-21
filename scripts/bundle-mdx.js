#!/usr/bin/env node
/**
 * Pre-bundle MDX files for Vercel deployment
 *
 * This script runs before `next build` and serializes all MDX files
 * into JSON format that can be bundled with the deployment.
 *
 * Why: Vercel serverless functions don't have access to src/ directory
 * at runtime, so we must bundle MDX content at build time.
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const { serialize } = require('next-mdx-remote/serialize');

async function bundleAllMDX() {
  console.log('📦 Starting MDX bundling process...\n');

  const modulesDir = path.join(process.cwd(), 'src', 'content', 'modules');
  // Use public/.mdx-cache which is accessible at runtime and deployed to Vercel
  const outputDir = path.join(process.cwd(), 'public', '.mdx-cache');

  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });
  console.log(`✅ Created cache directory: ${outputDir}\n`);

  // Read all MDX files
  const files = await fs.readdir(modulesDir);
  const mdxFiles = files.filter((f) => f.endsWith('.mdx'));

  console.log(`📚 Found ${mdxFiles.length} MDX files:\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const file of mdxFiles) {
    try {
      const fullPath = path.join(modulesDir, file);
      const content = await fs.readFile(fullPath, 'utf8');
      const { data, content: mdxContent } = matter(content);

      // Serialize MDX (same as runtime serialization)
      const serialized = await serialize(mdxContent, {
        mdxOptions: {
          remarkPlugins: [],
          rehypePlugins: [],
          development: false,
        },
      });

      // Extract slug from frontmatter or filename
      const slug = data.id || file.replace(/\.mdx$/, '');

      const bundled = {
        frontmatter: data,
        content: serialized,
        filename: file,
        slug,
        bundledAt: new Date().toISOString(),
      };

      // Write to cache with same filename
      const outputPath = path.join(outputDir, `${file}.json`);
      await fs.writeFile(outputPath, JSON.stringify(bundled, null, 2));

      console.log(`  ✓ ${file.padEnd(50)} → ${path.basename(outputPath)}`);
      successCount++;
    } catch (error) {
      console.error(`  ✗ ${file}: ${error.message || error}`);
      errorCount++;
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`✅ Bundled ${successCount} MDX files successfully`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} files failed to bundle`);
  }
  console.log(`📁 Cache location: ${outputDir}`);
  console.log(`${'='.repeat(70)}\n`);

  // Create index file for quick lookup
  const index = mdxFiles.map((file) => ({
    filename: file,
    cachedFile: `${file}.json`,
  }));

  await fs.writeFile(path.join(outputDir, '_index.json'), JSON.stringify(index, null, 2));

  console.log(`✅ Created cache index at ${outputDir}/_index.json\n`);

  if (errorCount > 0) {
    process.exit(1); // Fail build if any files couldn't be bundled
  }
}

// Run bundling
bundleAllMDX().catch((error) => {
  console.error('\n❌ MDX bundling failed:', error);
  process.exit(1);
});
