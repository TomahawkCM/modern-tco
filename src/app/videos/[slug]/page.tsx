import { notFound } from "next/navigation";
import videoManifest from "@/content/videos/manifest.json";
import { ModuleVideos } from "@/components/videos/ModuleVideos";
import Link from "next/link";

export function generateStaticParams() {
  const data = videoManifest as unknown as { modules: Array<{ slug: string }> };
  return data.modules.map((m) => ({ slug: m.slug }));
}

export default async function VideosByModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = videoManifest as unknown as { modules: Array<{ slug: string }> };
  const exists = data.modules.some((m) => m.slug === slug);
  if (!exists) return notFound();

  const title = slug.replace(/-/g, " ");
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{title} — Videos</h1>
        <Link href={`/learn/${slug}`} className="text-sm text-blue-300 hover:underline">
          Open Study Module
        </Link>
      </div>
      <ModuleVideos slug={slug} />
    </div>
  );
}

