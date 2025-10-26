/**
 * Server Component for Module Footer
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import PracticeButton from "@/components/mdx/PracticeButton";
import type { ModuleFrontmatter } from "@/lib/mdx/module-schema";

interface ModuleFooterProps {
  frontmatter: ModuleFrontmatter;
  slug: string;
}

export default function ModuleFooter({ frontmatter, slug }: ModuleFooterProps) {
  // Map domain enum to practice domain name
  const domainForPractice = (() => {
    const map: Record<string, string> = {
      ASKING_QUESTIONS: "Asking Questions",
      REFINING_QUESTIONS: "Refining Questions & Targeting",
      TAKING_ACTION: "Taking Action",
      NAVIGATION_MODULES: "Navigation and Basic Module Functions",
      REPORTING_EXPORT: "Report Generation and Data Export",
      PLATFORM_FOUNDATION: "Fundamentals",
    };
    return map[String(frontmatter.domainEnum)] || String(frontmatter.domainEnum);
  })();

  if (!frontmatter.practiceConfig) return null;

  return (
    <div className="mt-12 border-t border-gray-700 pt-8">
      <Card className="border-primary/30 bg-gradient-to-r from-gray-900/50 to-blue-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="h-5 w-5" />
            Ready to Practice?
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Test your knowledge with practice questions based on this module's content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PracticeButton
            variant="primary"
            className="w-full"
            href={`/practice?domain=${encodeURIComponent(domainForPractice)}&count=25&quick=1&reveal=1`}
          >
            Start {frontmatter.title} Practice
          </PracticeButton>
        </CardContent>
      </Card>
    </div>
  );
}