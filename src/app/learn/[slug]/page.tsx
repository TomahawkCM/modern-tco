import manifest from "@/config/modules.manifest.json";
import type { ModuleManifest } from "@/types/manifest";
import { notFound } from "next/navigation";
import { ModuleVideos } from "@/components/videos/ModuleVideos";
import moduleSkeletons from "@/content/modules/skeletons.json";

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  const data = manifest as ModuleManifest;
  return data.modules.map((m) => ({ slug: m.slug }));
}

export default async function LearnModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = manifest as ModuleManifest;
  const module = data.modules.find((m) => m.slug === slug);
  if (!module) return notFound();

  const skeleton = (moduleSkeletons as any).modules.find((m: any) => m.slug === slug) as
    | { objectives?: string[]; topics?: string[]; labs?: Array<{ title: string; description?: string }> }
    | undefined;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{module.title}</h1>
        {module.description ? (
          <p className="text-slate-600 dark:text-muted-foreground">{module.description}</p>
        ) : null}
      </header>
      <section className="rounded border border-dashed border-slate-300 p-4 dark:border-border">
        <p className="text-sm text-slate-600 dark:text-muted-foreground">
          Lesson outline and labs are in progress. Below is a scaffold for this module.
        </p>
      </section>

      <section aria-labelledby="objectives-title" className="space-y-2">
        <h2 id="objectives-title" className="text-lg font-semibold">Learning Objectives</h2>
        {skeleton?.objectives?.length ? (
          <ul className="list-disc pl-5 text-sm">
            {skeleton.objectives.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600 dark:text-muted-foreground">Objectives will be added soon.</p>
        )}
      </section>

      <section aria-labelledby="topics-title" className="space-y-2">
        <h2 id="topics-title" className="text-lg font-semibold">Key Topics</h2>
        {skeleton?.topics?.length ? (
          <ul className="list-disc pl-5 text-sm">
            {(skeleton as any).topics.map((t: string, i: number) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600 dark:text-muted-foreground">Topics will be added soon.</p>
        )}
      </section>
      <ModuleVideos slug={module.slug} />
      <section aria-labelledby="labs-title" className="space-y-3">
        <h2 id="labs-title" className="text-lg font-semibold">Labs</h2>
        {skeleton?.labs?.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {skeleton.labs.map((lab, i) => (
              <div key={i} className="rounded border p-3">
                <div className="font-medium">{lab.title}</div>
                {lab.description ? (
                  <p className="text-sm text-slate-600 dark:text-muted-foreground">{lab.description}</p>
                ) : null}
                <div className="mt-2">
                  <button className="text-sm text-blue-600 hover:underline" disabled>
                    Coming soon
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-muted-foreground">Labs will be added soon.</p>
        )}
      </section>
    </div>
  );
}
