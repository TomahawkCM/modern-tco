import ReviewCenter from "@/components/modules/ReviewCenter";
import { getAllModuleMetadata } from "@/lib/mdx/module-loader";

export const dynamic = "force-dynamic";

export default async function StudyReviewPage() {
  const meta = await getAllModuleMetadata();
  const modules: Record<string, { slug: string; title: string }> = {};
  for (const m of meta) {
    modules[m.frontmatter.id] = { slug: m.slug, title: m.frontmatter.title };
  }
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-3xl font-bold text-white">Review Center</h1>
        <p className="text-blue-200">All sections you've flagged for review, across modules.</p>
      </div>
      <ReviewCenter modules={modules} />
    </div>
  );
}

