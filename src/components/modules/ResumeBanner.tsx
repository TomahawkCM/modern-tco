"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ResumeData {
  lastViewed: string;
}

interface ResumeBannerProps {
  idToSlugMap: Record<string, string>;
}

export default function ResumeBanner({ idToSlugMap }: ResumeBannerProps) {
  const [resumeLink, setResumeLink] = useState<{ href: string; moduleId: string } | null>(null);

  useEffect(() => {
    // Client-side only: read localStorage to find last viewed module
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith("tco-study-progress:"));

      for (const key of keys) {
        const value = localStorage.getItem(key);
        if (!value) continue;

        const data: ResumeData = JSON.parse(value);
        if (data?.lastViewed) {
          const moduleId = key.split(":")[1];
          const slug = idToSlugMap[moduleId] || moduleId;

          if (slug) {
            setResumeLink({
              href: `/modules/${slug}#${encodeURIComponent(data.lastViewed)}`,
              moduleId,
            });
            break;
          }
        }
      }
    } catch (error) {
      console.error("[ResumeBanner] Failed to load progress:", error);
    }
  }, [idToSlugMap]);

  // Return null on server and before data is loaded to avoid hydration mismatch
  if (!resumeLink) {
    return null;
  }

  return (
    <div className="mb-6 text-center text-sm text-muted-foreground">
      <Link href={resumeLink.href} className="text-primary hover:underline">
        Continue where you left off →
      </Link>
    </div>
  );
}
