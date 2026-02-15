import type { Question, TCODomain, Difficulty, QuestionCategory } from "@/types/exam";
import { questionService } from "./questionService";

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{ row: number; error: string; data?: any }>;
  duplicates: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class QuestionBulkService {
  /**
   * Parse CSV content into questions
   */
  parseCSV(csvContent: string): { questions: Partial<Question>[]; errors: string[] } {
    const lines = csvContent.split("\n").filter((line) => line.trim());
    const errors: string[] = [];
    const questions: Partial<Question>[] = [];

    if (lines.length < 2) {
      errors.push("CSV must contain at least a header row and one data row");
      return { questions, errors };
    }

    // Parse header
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredColumns = [
      "question",
      "choice_a",
      "choice_b",
      "choice_c",
      "choice_d",
      "correct_answer",
      "explanation",
      "domain",
      "difficulty",
    ];

    const missingColumns = requiredColumns.filter((col) => !header.includes(col));
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(", ")}`);
      return { questions, errors };
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = this.parseCSVLine(lines[i]);
        if (values.length === 0) continue; // Skip empty lines

        const row: Record<string, string> = {};
        header.forEach((col, index) => {
          row[col] = values[index] || "";
        });

        // Map CSV row to Question object
        const question: Partial<Question> = {
          question: row.question,
          choices: [
            { id: "a", text: row.choice_a },
            { id: "b", text: row.choice_b },
            { id: "c", text: row.choice_c },
            { id: "d", text: row.choice_d },
          ],
          correctAnswerId: row.correct_answer.toLowerCase(),
          explanation: row.explanation,
          domain: row.domain as TCODomain,
          difficulty: row.difficulty as Difficulty,
          category: (row.category || "Platform Fundamentals") as QuestionCategory,
          tags: row.tags ? row.tags.split("|").map((t) => t.trim()) : [],
          studyGuideRef: row.study_guide_ref,
          consoleSteps: row.console_steps
            ? row.console_steps.split("|").map((s) => s.trim())
            : undefined,
        };

        questions.push(question);
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : "Parse error"}`);
      }
    }

    return { questions, errors };
  }

  /**
   * Parse a single CSV line (handles quoted values with commas)
   */
  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  }

  /**
   * Parse JSON content into questions
   */
  parseJSON(jsonContent: string): { questions: Partial<Question>[]; errors: string[] } {
    const errors: string[] = [];
    let questions: Partial<Question>[] = [];

    try {
      const parsed = JSON.parse(jsonContent);

      if (!Array.isArray(parsed)) {
        errors.push("JSON must be an array of questions");
        return { questions, errors };
      }

      questions = parsed;
    } catch (error) {
      errors.push(`Invalid JSON: ${error instanceof Error ? error.message : "Parse error"}`);
    }

    return { questions, errors };
  }

  /**
   * Validate a question object
   */
  validateQuestion(question: Partial<Question>, rowNumber: number): ValidationResult {
    const errors: string[] = [];

    // Required fields
    if (!question.question || question.question.trim().length < 10) {
      errors.push(`Row ${rowNumber}: Question text must be at least 10 characters`);
    }

    if (!question.choices || question.choices.length !== 4) {
      errors.push(`Row ${rowNumber}: Must have exactly 4 choices`);
    } else {
      // Validate each choice
      question.choices.forEach((choice, index) => {
        if (!choice.text || choice.text.trim().length < 2) {
          errors.push(`Row ${rowNumber}: Choice ${index + 1} is too short`);
        }
        if (!choice.id || !["a", "b", "c", "d"].includes(choice.id)) {
          errors.push(`Row ${rowNumber}: Choice ${index + 1} has invalid ID`);
        }
      });
    }

    if (!question.correctAnswerId || !["a", "b", "c", "d"].includes(question.correctAnswerId)) {
      errors.push(`Row ${rowNumber}: Invalid correct answer ID (must be a, b, c, or d)`);
    }

    if (!question.explanation || question.explanation.trim().length < 20) {
      errors.push(`Row ${rowNumber}: Explanation must be at least 20 characters`);
    }

    if (!question.domain) {
      errors.push(`Row ${rowNumber}: Domain is required`);
    }

    if (!question.difficulty) {
      errors.push(`Row ${rowNumber}: Difficulty is required`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check for duplicate questions
   */
  async findDuplicates(questions: Partial<Question>[]): Promise<Set<number>> {
    const existingQuestions = await questionService.getAllQuestions();
    const existingTexts = new Set(existingQuestions.map((q) => q.question.toLowerCase().trim()));
    const duplicates = new Set<number>();

    questions.forEach((q, index) => {
      if (q.question && existingTexts.has(q.question.toLowerCase().trim())) {
        duplicates.add(index);
      }
    });

    return duplicates;
  }

  /**
   * Import questions with validation and error handling
   */
  async importQuestions(
    questions: Partial<Question>[],
    onProgress?: (current: number, total: number) => void
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
      duplicates: 0,
    };

    // Find duplicates
    const duplicateIndices = await this.findDuplicates(questions);
    result.duplicates = duplicateIndices.size;

    // Import each question
    for (let i = 0; i < questions.length; i++) {
      if (onProgress) {
        onProgress(i + 1, questions.length);
      }

      // Skip duplicates
      if (duplicateIndices.has(i)) {
        continue;
      }

      const question = questions[i];

      // Validate
      const validation = this.validateQuestion(question, i + 1);
      if (!validation.valid) {
        result.failed++;
        result.errors.push({
          row: i + 1,
          error: validation.errors.join(", "),
          data: question,
        });
        continue;
      }

      // Import
      try {
        await questionService.addQuestion(question as Omit<Question, "id">);
        result.imported++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : "Failed to save question",
          data: question,
        });
      }
    }

    result.success = result.failed === 0;
    return result;
  }

  /**
   * Export questions to CSV format
   */
  exportToCSV(questions: Question[]): string {
    const header = [
      "question",
      "choice_a",
      "choice_b",
      "choice_c",
      "choice_d",
      "correct_answer",
      "explanation",
      "domain",
      "difficulty",
      "category",
      "tags",
      "study_guide_ref",
      "console_steps",
    ];

    const rows = questions.map((q) => {
      const choices = q.choices || [];
      return [
        this.escapeCSV(q.question),
        this.escapeCSV(choices[0]?.text || ""),
        this.escapeCSV(choices[1]?.text || ""),
        this.escapeCSV(choices[2]?.text || ""),
        this.escapeCSV(choices[3]?.text || ""),
        q.correctAnswerId,
        this.escapeCSV(q.explanation || ""),
        q.domain,
        q.difficulty,
        q.category || "",
        (q.tags || []).join("|"),
        q.studyGuideRef || "",
        (q.consoleSteps || []).join("|"),
      ].join(",");
    });

    return [header.join(","), ...rows].join("\n");
  }

  /**
   * Export questions to JSON format
   */
  exportToJSON(questions: Question[]): string {
    return JSON.stringify(questions, null, 2);
  }

  /**
   * Escape CSV special characters
   */
  private escapeCSV(value: string): string {
    if (!value) return "";

    // If value contains comma, newline, or quote, wrap in quotes and escape internal quotes
    if (value.includes(",") || value.includes("\n") || value.includes('"')) {
      return `"${value.replace(/"/g, '""')}"`;
    }

    return value;
  }

  /**
   * Generate CSV template for bulk import
   */
  generateCSVTemplate(): string {
    const header = [
      "question",
      "choice_a",
      "choice_b",
      "choice_c",
      "choice_d",
      "correct_answer",
      "explanation",
      "domain",
      "difficulty",
      "category",
      "tags",
      "study_guide_ref",
      "console_steps",
    ];

    const exampleRow = [
      "What is the Tanium Linear Chain Architecture?",
      "A peer-to-peer communication model",
      "A client-server architecture",
      "A cloud-based system",
      "A distributed database",
      "a",
      "The Linear Chain Architecture (LCA) is a peer-to-peer communication model where clients communicate with each other in a chain...",
      "Fundamentals",
      "Beginner",
      "Platform Fundamentals",
      "architecture|fundamentals|lca",
      "TCO Study Guide Chapter 2",
      "Open Console|Navigate to Administration|View Architecture Diagram",
    ];

    return [header.join(","), exampleRow.map((v) => this.escapeCSV(v)).join(",")].join("\n");
  }
}

export const questionBulkService = new QuestionBulkService();
