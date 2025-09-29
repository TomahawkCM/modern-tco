/**
 * Server Component for Module Header
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Target, CheckCircle } from "lucide-react";
import type { ModuleFrontmatter } from "@/lib/mdx/module-schema";

interface ModuleHeaderProps {
  frontmatter: ModuleFrontmatter;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-900/50 text-green-200 border-green-500/50";
    case "Intermediate":
      return "bg-yellow-900/50 text-yellow-200 border-yellow-500/50";
    case "Advanced":
      return "bg-red-900/50 text-red-200 border-red-500/50";
    default:
      return "bg-gray-900/50 text-gray-200 border-gray-500/50";
  }
};

export default function ModuleHeader({ frontmatter }: ModuleHeaderProps) {
  return (
    <div className="mb-8">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="border-blue-500/50 bg-blue-900/50 text-blue-200">
          {frontmatter.domainEnum.replace(/_/g, " ")}
        </Badge>
        <Badge variant="outline" className={getDifficultyColor(frontmatter.difficulty)}>
          {frontmatter.difficulty}
        </Badge>
        <div className="flex items-center gap-1 text-gray-400">
          <Clock className="h-4 w-4" />
          <span className="text-sm">{frontmatter.estimatedTime}</span>
        </div>
      </div>

      <h1 className="mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-4xl font-bold text-transparent">
        {frontmatter.title}
      </h1>

      {frontmatter.description && (
        <p className="mb-6 text-xl leading-relaxed text-gray-300">{frontmatter.description}</p>
      )}

      {/* Learning Objectives */}
      {frontmatter.learningObjectives && frontmatter.learningObjectives.length > 0 && (
        <Card className="mb-6 border-blue-500/30 bg-gradient-to-r from-blue-950/30 to-cyan-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-200">
              <Target className="h-5 w-5" />
              Learning Objectives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {frontmatter.learningObjectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-200">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}