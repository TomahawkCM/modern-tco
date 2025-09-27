// Content Parser Utility for TCO Study Materials
// Converts markdown files to structured TypeScript data

import fs from "fs";
import path from "path";
import type { StudyModuleContent, StudySectionContent } from "@/data/study-content";

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

export class ContentParser {
  private static extractExamWeight(content: string): number {
    const weightMatch = content.match(/(\d+)%\s+Exam\s+Weight/i);
    return weightMatch ? parseInt(weightMatch[1]) : 0;
  }

  private static extractLearningObjectives(content: string): string[] {
    const objectives: string[] = [];
    const objectivesMatch = content.match(/## 📋 Learning Objectives\n\n(.*?)\n\n---/s);

    if (objectivesMatch) {
      const objectivesText = objectivesMatch[1];
      const matches = objectivesText.match(/\d+\.\s+\*\*(.*?)\*\*\s+-\s+(.*?)(?=\n\d+\.|$)/g);

      if (matches) {
        matches.forEach((match) => {
          const cleanMatch = match.replace(/^\d+\.\s+\*\*(.*?)\*\*\s+-\s+/, "");
          objectives.push(cleanMatch.trim());
        });
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

      if (title.toLowerCase().includes("fundamental") || title.toLowerCase().includes("basic")) {
        sectionType = "concepts";
      } else if (
        title.toLowerCase().includes("procedure") ||
        title.toLowerCase().includes("step")
      ) {
        sectionType = "procedures";
      } else if (
        title.toLowerCase().includes("example") ||
        title.toLowerCase().includes("practice")
      ) {
        sectionType = "examples";
      } else if (
        title.toLowerCase().includes("exam") ||
        title.toLowerCase().includes("assessment")
      ) {
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
        procedureMatches.forEach((match) => {
          const procedure = match.replace(/^\d+\.\s+/, "").trim();
          procedures.push(procedure);
        });
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
    const description = descriptionMatch
      ? `Master ${descriptionMatch[1].toLowerCase()} for real-time endpoint data collection. Learn sensor selection, query construction, and result interpretation for effective information gathering across enterprise environments.`
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
    const sections: StudySectionContent[] = parsed.sections.map((section) => ({
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

  public static parseDomain1Content(): StudyModuleContent {
    // Note: This function is designed for server-side use only
    // File system operations are not available during webpack compilation
    if (typeof window !== "undefined") {
      throw new Error("parseDomain1Content can only be called on the server side");
    }

    try {
      const markdownPath = path.join(
        process.cwd(),
        "src",
        "content",
        "domains",
        "domain1-asking-questions.md"
      );

      if (!fs.existsSync(markdownPath)) {
        throw new Error(`Domain 1 markdown file not found at ${markdownPath}`);
      }

      const parsed = this.parseDomain1(markdownPath);
      return this.convertToStudyModuleContent(parsed);
    } catch (error) {
      console.error("Error parsing Domain 1 content:", error);
      throw error;
    }
  }
}

// Export utility functions
export const { parseDomain1Content } = ContentParser;
