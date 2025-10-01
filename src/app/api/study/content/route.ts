import { type NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { fileURLToPath } from "url";
import type { StudyModuleContent } from "@/data/study-content";

interface ParsedSection {
  id: string;
  title: string;
  content: string;
  sectionType: "overview" | "concepts" | "procedures" | "examples" | "exam_prep";
  orderIndex: number;
  estimatedTime: number;
  keyPoints: string[];
  procedures?: string[];
  troubleshooting?: string[];
  references: string[];
}

interface ParsedModule {
  id: string;
  domain: string;
  title: string;
  description: string;
  examWeight: number;
  estimatedTime: string;
  estimatedTimeMinutes: number;
  learningObjectives: string[];
  sections: ParsedSection[];
}

class ServerSideContentParser {
  private static extractExamWeight(content: string): number {
    const weightMatch = content.match(/(\d+)%\s+Exam\s+Weight/i);
    return weightMatch ? Number.parseInt(weightMatch?.[1] ?? "0", 10) : 0;
  }

  private static extractLearningObjectives(content: string): string[] {
    const objectives: string[] = [];
    const objectivesMatch = content.match(/## 📋 Learning Objectives\n\n(.*?)\n\n---/s);

    const objectivesText = objectivesMatch?.[1];
    if (objectivesText) {
      const matches = objectivesText.match(/\d+\.\s+\*\*(.*?)\*\*\s+-\s+(.*?)(?=\n\d+\.|$)/g);

      if (matches) {
        for (const match of matches) {
          const cleanMatch = match.replace(/^\d+\.\s+\*\*(.*?)\*\*\s+-\s+/, "").trim();
          objectives.push(cleanMatch);
        }
      }
    }

    return objectives;
  }

  private static extractSections(content: string): ParsedSection[] {
    const sections: ParsedSection[] = [];

    // Split content by major section headers (## 🎯 Module)
    const moduleSections = content.split(/## 🎯 Module \d+:/);

    let sectionIndex = 0;

    moduleSections.forEach((moduleContent, index) => {
      if (index === 0) return; // Skip the header part

      const titleMatch = moduleContent.match(/^([^\n]+)/);
      const title = titleMatch ? titleMatch[1].trim() : `Module ${index}`;

      // Determine section type based on content patterns
      let sectionType: "overview" | "concepts" | "procedures" | "examples" | "exam_prep" =
        "concepts";

      const normalizedTitle = title.toLowerCase();

      if (normalizedTitle.includes("fundamental") || normalizedTitle.includes("basic")) {
        sectionType = "concepts";
      } else if (normalizedTitle.includes("procedure") || normalizedTitle.includes("step")) {
        sectionType = "procedures";
      } else if (normalizedTitle.includes("example") || normalizedTitle.includes("practice")) {
        sectionType = "examples";
      } else if (normalizedTitle.includes("exam") || normalizedTitle.includes("assessment")) {
        sectionType = "exam_prep";
      }

      // Extract key points from bullet points and numbered lists
      const keyPoints: string[] = [];
      const bulletMatches = moduleContent.match(/^[\s]*[-\*]\s+(.+)$/gm);
      if (bulletMatches) {
        bulletMatches.forEach((match) => {
          const point = match.replace(/^[\s]*[-\*]\s+/, "").trim();
          keyPoints.push(point);
        });
      }

      // Extract procedures from numbered steps
      const procedures: string[] = [];
      const procedureMatches = moduleContent.match(/^\d+\.\s+(.+)$/gm);
      if (procedureMatches) {
        for (const match of procedureMatches) {
          const procedure = match.replace(/^\d+\.\s+/, "").trim();
          procedures.push(procedure);
        }
      }

      sections.push({
        id: `aq-module-${index}`,
        title,
        content: moduleContent.trim(),
        sectionType,
        orderIndex: ++sectionIndex,
        estimatedTime: 30 + index * 15, // Progressive time estimates
        keyPoints: keyPoints.slice(0, 5), // Limit to top 5 key points
        procedures: procedures.length > 0 ? procedures.slice(0, 8) : undefined,
        references: ["Tanium Core Platform Documentation", "Interact Module User Guide"],
      });
    });

    return sections;
  }

  public static parseDomain1(markdownPath: string): ParsedModule {
    const content = fs.readFileSync(markdownPath, "utf-8");

    // Extract title and description from header
    const titleMatch = content.match(/# Domain 1: (.+)/);
    const title = titleMatch ? `Domain 1: ${titleMatch[1]}` : "Domain 1: Asking Questions";

    const descriptionMatch = content.match(/\*\*TCO Certification Domain 1\*\*: (.+)/);
    const descriptionExcerpt = descriptionMatch?.[1];
    const description = descriptionExcerpt
      ? `Master ${descriptionExcerpt.toLowerCase()} for real-time endpoint data collection. Learn sensor selection, query construction, and result interpretation for effective information gathering across enterprise environments.`
      : "Master natural language questioning in Tanium for real-time endpoint data collection.";

    return {
      id: "asking-questions",
      domain: "Asking Questions",
      title,
      description,
      examWeight: this.extractExamWeight(content),
      estimatedTime: "3-4 hours",
      estimatedTimeMinutes: 210,
      learningObjectives: this.extractLearningObjectives(content),
      sections: this.extractSections(content),
    };
  }

  public static convertToStudyModuleContent(parsed: ParsedModule): StudyModuleContent {
    const sections = parsed.sections.map((section) => ({
      id: section.id,
      title: section.title,
      content: section.content,
      sectionType: section.sectionType,
      orderIndex: section.orderIndex,
      estimatedTime: section.estimatedTime,
      keyPoints: section.keyPoints,
      procedures: section.procedures,
      troubleshooting: section.troubleshooting,
      references: section.references,
    }));

    return {
      id: parsed.id,
      domain: parsed.domain,
      title: parsed.title,
      description: parsed.description,
      examWeight: parsed.examWeight,
      estimatedTime: parsed.estimatedTime,
      estimatedTimeMinutes: parsed.estimatedTimeMinutes,
      learningObjectives: parsed.learningObjectives,
      sections,
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");

    if (domain === "asking-questions" || domain === "1") {
      const markdownUrl = new URL(
        "../../../../content/domains/domain1-asking-questions.md",
        import.meta.url
      );

      let contentPath: string;
      try {
        contentPath = fileURLToPath(markdownUrl);
      } catch {
        console.error("Failed to resolve content URL for Domain 1");
        return NextResponse.json(
          { error: "Study content not found", details: "Unable to resolve content path" },
          { status: 404 }
        );
      }

      if (!fs.existsSync(contentPath)) {
        console.error(`Domain 1 markdown file not found at ${contentPath}`);
        return NextResponse.json(
          { error: "Study content not found", details: `File not found: ${contentPath}` },
          { status: 404 }
        );
      }

      const parsed = ServerSideContentParser.parseDomain1(contentPath);
      const studyContent = ServerSideContentParser.convertToStudyModuleContent(parsed);

      return NextResponse.json({
        success: true,
        content: studyContent,
        metadata: {
          contentLength: studyContent.sections.length,
          totalObjectives: studyContent.learningObjectives.length,
          parseTimestamp: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json(
      { error: "Domain not supported", availableDomains: ["asking-questions"] },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error parsing study content:", error);
    return NextResponse.json(
      {
        error: "Failed to parse study content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
