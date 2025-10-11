import videoManifest from "@/content/videos/manifest.json";
import { ModuleVideos } from "@/components/videos/ModuleVideos";
import Link from "next/link";

export default function VideosIndexPage() {
  const data = videoManifest as unknown as {
    modules: Array<{ slug: string; videos: Array<{ id: string; title: string; youtubeId: string; start?: number }> }>;
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="mb-3 text-3xl font-bold text-foreground">Video Library</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Curated videos organized by module. Play inline and track progress.
        </p>
      </div>

      <div className="grid gap-8">
        {data.modules.map((m) => (
          <section key={m.slug} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold capitalize text-foreground">{m.slug.replace(/-/g, " ")}</h2>
              <Link
                href={`/videos/${m.slug}`}
                className="text-sm text-primary hover:underline"
                aria-label={`View all videos for ${m.slug}`}
              >
                View all
              </Link>
            </div>
            <ModuleVideos slug={m.slug} />
          </section>
        ))}
      </div>
    </div>
  );
}

