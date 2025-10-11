/**
 * Modules Page - MDX-backed module index
 * Lists modules discovered in src/content/modules using the MDX loader.
 * Falls back to dynamic MDX imports on production if fs discovery is empty.
 */

import { getAllModuleMetadata } from "@/lib/mdx/module-loader";
import { ModulesBrowser } from "@/components/modules/ModulesBrowser";
import Link from "next/link";
import { AVAILABLE_DOMAINS, getMDXMetadata, loadMDXContent } from "@/lib/mdx-loader";

export default async function Modules() {
  let modules = await getAllModuleMetadata();

  if (!modules || (Array.isArray(modules) && modules.length === 0)) {
    // Fallback: build metadata via dynamic imports
    const dyn: any[] = [];
    for (const slug of AVAILABLE_DOMAINS) {
      const mod = await loadMDXContent(slug);
      if (!mod) continue;
      const meta = getMDXMetadata(mod);
      dyn.push({
        slug,
        frontmatter: {
          id: meta.id,
          title: meta.title,
          description: '',
          difficulty: meta.difficulty || 'Intermediate',
          estimatedTime: meta.estimatedTime || '45 min',
          domainEnum: (meta.domainSlug || slug).toUpperCase().replace(/-/g, '_'),
          learningObjectives: meta.objectives || [],
        },
      });
    }
    modules = dyn as any;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-3 text-4xl font-bold text-foreground">TCO Study Center</h1>
        <p className="mx-auto max-w-3xl text-muted-foreground">
          Explore interactive study modules powered by MDX content.
        </p>
        <div className="mt-4">
          <a
            href="/study/review"
            className="inline-flex items-center rounded-md border border-accent/40 bg-accent/20 px-3 py-1 text-sm text-accent-foreground hover:bg-accent/30 transition-colors"
          >
            Go to Review Center →
          </a>
        </div>
      </div>
      {/* Lightweight resume banner using localStorage (client-side only). */}
      <div className="mb-6 text-center text-sm text-muted-foreground">
        <noscript />
        <span id="resume-banner" />
      </div>
      {(() => {
        const idToSlug = Object.fromEntries((modules as any[]).map((m) => [m.frontmatter.id, m.slug]));
        const mapping = JSON.stringify(idToSlug).replace(/</g, '\u003c');
        return (
          <script
            dangerouslySetInnerHTML={{
              __html: `(() => { try { const map = ${mapping}; const keys = Object.keys(localStorage).filter(k => k.startsWith('tco-study-progress:')); for (const k of keys) { const v = JSON.parse(localStorage.getItem(k) || 'null'); if (v && v.lastViewed) { const moduleId = k.split(':')[1]; const slug = map[moduleId] || ''; if (slug) { const el = document.getElementById('resume-banner'); if (el) { el.innerHTML = '<a class="text-cyan-300 hover:underline" href="/modules/' + slug + '#' + encodeURIComponent(v.lastViewed) + '">Continue where you left off →</a>'; } break; } } } } catch {} })();`,
            }}
          />
        );
      })()}
      <ModulesBrowser modules={modules as any} />
    </div>
  );
}
