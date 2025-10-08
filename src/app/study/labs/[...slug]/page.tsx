import path from "path";
import { promises as fs } from "fs";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LabMarkdown from "@/components/labs/LabMarkdown";
import { ArrowLeft } from "lucide-react";

const LABS_ROOT = path.join(process.cwd(), "src/content/labs");

function resolveLabPath(slugParts: string[]): string | null {
  const tentative = path.join(LABS_ROOT, ...slugParts);
  const normalized = path.normalize(tentative);
  if (!normalized.startsWith(LABS_ROOT)) {
    return null;
  }
  return normalized;
}

async function readFirstMatchingFile(basePath: string): Promise<string | null> {
  const candidates = [
    `${basePath}.md`,
    `${basePath}.mdx`,
    path.join(basePath, "index.md"),
    path.join(basePath, "index.mdx"),
  ];

  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) {
        return await fs.readFile(candidate, "utf8");
      }
    } catch (error) {
      // try next candidate
    }
  }

  return null;
}

function deriveTitle(content: string, fallback: string): string {
  const line = content.split(/\r?\n/).find((entry) => entry.trim().startsWith("# "));
  if (!line) return fallback;
  return line.replace(/^#+\s*/, "").trim();
}

function buildBreadcrumbs(slugParts: string[]) {
  const crumbs: { label: string; href: string }[] = [
    { label: "Study", href: "/study" },
    { label: "Learn (Experimental)", href: "/study/compare-learning" },
  ];

  const moduleRoutes: Record<string, string> = {
    "01-l": "/study/01-learn-experimental",
    "02-l": "/study/02-learn-experimental",
    "03-l": "/study/03-learn-experimental",
    "04-l": "/study/04-learn-experimental",
    "05-l": "/study/05-learn-experimental",
  };

  if (slugParts.length > 0) {
    const moduleKey = slugParts[0];
    if (moduleRoutes[moduleKey]) {
      crumbs.push({ label: moduleKey.toUpperCase(), href: moduleRoutes[moduleKey] });
    }
  }

  return crumbs;
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug: slugParam } = await params;
  const slugParts = slugParam ?? [];
  if (slugParts.length === 0) {
    notFound();
  }

  const basePath = resolveLabPath(slugParts);
  if (!basePath) {
    notFound();
  }

  const content = await readFirstMatchingFile(basePath);
  if (!content) {
    notFound();
  }

  const fallbackTitle = slugParts[slugParts.length - 1]?.replace(/[-_]/g, " ") ?? "Lab";
  const title = deriveTitle(content, fallbackTitle);
  const breadcrumbs = buildBreadcrumbs(slugParts);
  const backHref = breadcrumbs[breadcrumbs.length - 1]?.href ?? "/study";

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.href} className="flex items-center gap-2">
            <Link href={crumb.href} className="hover:text-primary">
              {crumb.label}
            </Link>
            {index < breadcrumbs.length - 1 ? <span className="text-muted-foreground/60">/</span> : null}
          </span>
        ))}
      </nav>

      <Card className="border-border/40 bg-slate-950/40 text-slate-100">
        <CardHeader className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-2xl text-white">{title}</CardTitle>
            <Badge variant="outline" className="mt-2 uppercase tracking-wide">
              Lab Exercise
            </Badge>
          </div>
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 rounded-md border border-border/40 px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/60 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </CardHeader>
        <CardContent>
          <LabMarkdown content={content} />
        </CardContent>
      </Card>
    </div>
  );
}
