import { Difficulty, QuestionCategory, TCODomain, type Question } from "@/types/exam";
import Anthropic from "@anthropic-ai/sdk";

interface GenerationConfig {
  domain: TCODomain;
  difficulty: Difficulty;
  category: QuestionCategory;
  count: number;
  batchSize?: number;
}

interface GeneratedQuestionData {
  question: string;
  choices: Array<{ id: string; text: string }>;
  correctAnswerId: string;
  explanation: string;
  tags: string[];
  studyGuideRef?: string;
  consoleSteps?: string[];
}

export class QuestionGeneratorService {
  private anthropic: Anthropic;
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000; // 1 second

  constructor(apiKey?: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY || "",
    });
  }

  /**
   * Generate questions for a specific TCO domain
   */
  async generateQuestions(config: GenerationConfig): Promise<Question[]> {
    const questions: Question[] = [];
    const batchSize = config.batchSize || 5;
    const batches = Math.ceil(config.count / batchSize);

    console.log(`🤖 Generating ${config.count} questions for ${config.domain}`);
    console.log(`📦 Processing ${batches} batches of ${batchSize} questions each`);

    for (let batch = 0; batch < batches; batch++) {
      const questionsInBatch = Math.min(batchSize, config.count - batch * batchSize);
      console.log(`🔄 Processing batch ${batch + 1}/${batches} (${questionsInBatch} questions)`);

      try {
        const batchQuestions = await this.generateQuestionBatch(config, questionsInBatch);
        questions.push(...batchQuestions);

        // Rate limiting: wait between batches
        if (batch < batches - 1) {
          await this.delay(this.baseDelay);
        }
      } catch (error) {
        console.error(`❌ Error in batch ${batch + 1}:`, error);
        // Continue with next batch instead of failing completely
      }
    }

    console.log(`✅ Generated ${questions.length} questions successfully`);
    return questions;
  }

  /**
   * Generate a single batch of questions
   */
  private async generateQuestionBatch(
    config: GenerationConfig,
    count: number
  ): Promise<Question[]> {
    const prompt = this.buildPrompt(config, count);

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 4000,
          temperature: 0.7,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const content = response.content[0];
        if (content.type === "text") {
          return this.parseGeneratedQuestions(content.text, config);
        }
      } catch (error) {
        console.warn(`⚠️ Attempt ${attempt}/${this.maxRetries} failed:`, error);
        if (attempt === this.maxRetries) {
          throw error;
        }
        await this.delay(this.baseDelay * attempt);
      }
    }

    return [];
  }

  /**
   * Build domain-specific prompt for question generation
   */
  private buildPrompt(config: GenerationConfig, count: number): string {
    const domainContext = this.getDomainContext(config.domain);
    const difficultyContext = this.getDifficultyContext(config.difficulty);
    const categoryContext = this.getCategoryContext(config.category);

    return `You are an expert Tanium Certified Operator (TCO) exam question writer. Generate ${count} high-quality multiple-choice questions for the TCO certification exam.

DOMAIN CONTEXT:
${domainContext}

DIFFICULTY LEVEL: ${config.difficulty}
${difficultyContext}

QUESTION CATEGORY: ${config.category}
${categoryContext}

REQUIREMENTS:
1. Each question must have exactly 4 answer choices (A, B, C, D)
2. Only ONE answer should be correct
3. Questions must test practical knowledge and real-world scenarios
4. Include detailed explanations for the correct answer
5. Add relevant tags for categorization
6. Follow official Tanium terminology and procedures
7. Questions should be appropriate for ${config.difficulty} difficulty level

OUTPUT FORMAT:
Return ONLY a valid JSON array of questions in this exact format:

[
  {
    "question": "Question text here?",
    "choices": [
      {"id": "a", "text": "First choice"},
      {"id": "b", "text": "Second choice"},
      {"id": "c", "text": "Third choice"},
      {"id": "d", "text": "Fourth choice"}
    ],
    "correctAnswerId": "b",
    "explanation": "Detailed explanation of why this answer is correct and others are wrong.",
    "tags": ["tag1", "tag2", "tag3"],
    "studyGuideRef": "Optional reference to study materials",
    "consoleSteps": ["Optional step-by-step console procedures"]
  }
]

Generate ${count} questions following this format exactly. Ensure variety in question types and scenarios within the domain.`;
  }

  /**
   * Get domain-specific context and requirements
   */
  private getDomainContext(domain: TCODomain): string {
    const contexts = {
      [TCODomain.ASKING_QUESTIONS]: `
Focus on Tanium's Linear Chain Architecture and real-time question asking capabilities:
- Natural language question construction and optimization
- Sensor usage and configuration
- Question performance and troubleshooting
- Multi-sensor questions and complex queries
- Question result interpretation and filtering
- Real-time data collection best practices
- Parameter usage and question refinement`,

      [TCODomain.REFINING_QUESTIONS]: `
Focus on question refinement and endpoint targeting:
- Computer group creation and management
- Dynamic targeting based on system properties
- Question filtering and result refinement
- Boolean operators in targeting
- Saved question management
- Performance optimization for large environments
- Advanced targeting scenarios`,

      [TCODomain.TAKING_ACTION]: `
Focus on Tanium packages and action deployment:
- Package deployment and management
- Action execution and monitoring
- Scheduled actions and maintenance windows
- Package parameters and customization
- Action targeting and verification
- Troubleshooting deployment issues
- Security considerations for actions`,

      [TCODomain.NAVIGATION_MODULES]: `
Focus on Tanium console navigation and module usage:
- Console interface and navigation
- Module functionality and features
- User roles and permissions
- Dashboard creation and management
- Reporting and data visualization
- Integration with other Tanium modules
- Administrative functions`,

      [TCODomain.REPORTING_EXPORT]: `
Focus on data reporting and export capabilities:
- Report generation and scheduling
- Data export formats and methods
- Historical data analysis
- Custom report creation
- Compliance reporting requirements
- Data retention and archiving
- Integration with external systems`,

      [TCODomain.SECURITY]: `
Focus on security-related aspects of Tanium, including threat detection, vulnerability management, and incident response.
- Threat hunting and IOC scanning
- Vulnerability assessment and patching
- Incident response and remediation
- Compliance and audit reporting
- Security posture management
- Integrations with SIEM and other security tools`,

      [TCODomain.FUNDAMENTALS]: `
Focus on the fundamental concepts of Tanium, its architecture, and basic operations.
- Linear Chain Architecture (LCA)
- Core platform components (Client, Server, Zone Server)
- Basic question and action workflows
- Console navigation and common functionalities
- Tanium client installation and management
- Data flow and communication within the platform`,

      [TCODomain.TROUBLESHOOTING]: `
Focus on common troubleshooting scenarios for Tanium deployments and operations.
- Client health and communication issues
- Server and Zone Server diagnostics
- Sensor and package deployment problems
- Network connectivity and firewall considerations
- Performance tuning and optimization
- Log analysis and error interpretation
- Advanced diagnostic tools and techniques`,

      [TCODomain.REFINING_TARGETING]: `
Focus on Tanium's 'Refining Questions & Targeting' module:
- Computer group creation and management
- Dynamic targeting based on system properties
- Question filtering and result refinement
- Boolean operators in targeting
- Saved question management
- Performance optimization for large environments
- Advanced targeting scenarios`,
    };

    return (contexts as any)[domain] || "";
  }

  /**
   * Get difficulty-specific guidelines
   */
  private getDifficultyContext(difficulty: Difficulty): string {
    const contexts = {
      [Difficulty.BEGINNER]: `
- Focus on fundamental concepts and basic procedures
- Test understanding of core terminology and features
- Include straightforward scenarios with clear solutions
- Emphasize foundational knowledge required for TCO certification`,

      [Difficulty.INTERMEDIATE]: `
- Test practical application of concepts in realistic scenarios
- Include multi-step procedures and problem-solving
- Combine multiple concepts in single questions
- Focus on common troubleshooting and optimization tasks`,

      [Difficulty.ADVANCED]: `
        - Present complex scenarios requiring deep understanding
        - Test edge cases and advanced troubleshooting
        - Include performance optimization and advanced configuration
        - Require synthesis of multiple concepts and best practices`,
      [Difficulty.EXPERT]: `
        - Expert-level scenarios requiring deep domain knowledge and cross-module reasoning
        - Highly complex, multi-system troubleshooting and optimization
        - Strategic decision-making and architecture-level considerations
        - Expect integration of multiple Tanium modules and advanced configurations`,
    };

    return (contexts as any)[difficulty] || "";
  }

  /**
   * Get category-specific guidelines
   */
  private getCategoryContext(category: QuestionCategory): string {
    const contexts = {
      [QuestionCategory.PLATFORM_FUNDAMENTALS]: `
Focus on core Tanium platform concepts, architecture, and foundational knowledge.`,

      [QuestionCategory.CONSOLE_PROCEDURES]: `
Focus on step-by-step console procedures, navigation, and user interface interactions.`,

      [QuestionCategory.TROUBLESHOOTING]: `
Focus on problem identification, diagnostic procedures, and resolution strategies.`,

      [QuestionCategory.PRACTICAL_SCENARIOS]: `
Focus on real-world use cases, business scenarios, and practical application of knowledge.`,

      [QuestionCategory.LINEAR_CHAIN]: `
Focus on Linear Chain Architecture concepts, question flow, and data processing.`,
    };

    return contexts[category];
  }

  /**
   * Parse the AI-generated response into Question objects
   */
  private parseGeneratedQuestions(response: string, config: GenerationConfig): Question[] {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }

      const generatedData: GeneratedQuestionData[] = JSON.parse(jsonMatch[0]);

      return generatedData.map((data, index) => {
        const questionId = this.generateQuestionId(config.domain, config.difficulty, index);

        return {
          id: questionId,
          question: data.question,
          choices: data.choices,
          correctAnswerId: data.correctAnswerId,
          domain: config.domain,
          difficulty: config.difficulty,
          category: config.category,
          explanation: data.explanation,
          tags: data.tags,
          studyGuideRef: data.studyGuideRef,
          consoleSteps: data.consoleSteps,
        } as Question;
      });
    } catch (error) {
      console.error("❌ Failed to parse generated questions:", error);
      throw new Error(`Failed to parse AI response: ${error}`);
    }
  }

  /**
   * Generate unique question ID
   */
  private generateQuestionId(domain: TCODomain, difficulty: Difficulty, index: number): string {
    const domainCodes = {
      [TCODomain.ASKING_QUESTIONS]: "AQ",
      [TCODomain.REFINING_QUESTIONS]: "RT",
      [TCODomain.TAKING_ACTION]: "TA",
      [TCODomain.NAVIGATION_MODULES]: "NM",
      [TCODomain.REPORTING_EXPORT]: "RE",
      [TCODomain.SECURITY]: "SC", // Add missing domain
      [TCODomain.FUNDAMENTALS]: "FU", // Add missing domain
      [TCODomain.TROUBLESHOOTING]: "TR", // Add missing domain
      [TCODomain.REFINING_TARGETING]: "RF", // Add missing TCODomain member
    };

    const difficultyCodes = {
      [Difficulty.BEGINNER]: "B",
      [Difficulty.INTERMEDIATE]: "I",
      [Difficulty.ADVANCED]: "A",
      [Difficulty.EXPERT]: "E",
    };

    const timestamp = Date.now().toString().slice(-6);
  const domainCode = domainCodes[domain];
  const difficultyCode = difficultyCodes[difficulty] || "U";

    return `TCO-${domainCode}-${difficultyCode}${timestamp}${index.toString().padStart(2, "0")}`;
  }

  /**
   * Validate generated questions
   */
  validateQuestions(questions: Question[]): { valid: Question[]; invalid: any[] } {
    const valid: Question[] = [];
    const invalid: any[] = [];

    questions.forEach((question) => {
      const issues = this.findQuestionIssues(question);
      if (issues.length === 0) {
        valid.push(question);
      } else {
        invalid.push({ question, issues });
      }
    });

    return { valid, invalid };
  }

  /**
   * Find issues with a generated question
   */
  private findQuestionIssues(question: Question): string[] {
    const issues: string[] = [];

    // Check required fields
    if (!question.question || question.question.trim().length < 10) {
      issues.push("Question text too short or missing");
    }

    if (!question.choices || question.choices.length !== 4) {
      issues.push("Must have exactly 4 choices");
    }

    if (!question.correctAnswerId) {
      issues.push("Missing correct answer ID");
    }

    // Validate choices
    if (question.choices) {
      const choiceIds = question.choices.map((c) => c.id);
      const expectedIds = ["a", "b", "c", "d"];

      if (!expectedIds.every((id) => choiceIds.includes(id))) {
        issues.push("Choices must have IDs: a, b, c, d");
      }

      if (!choiceIds.includes(question.correctAnswerId)) {
        issues.push("Correct answer ID not found in choices");
      }

      question.choices.forEach((choice) => {
        if (!choice.text || choice.text.trim().length < 3) {
          issues.push(`Choice ${choice.id} text too short`);
        }
      });
    }

    // Check explanation
    if (!question.explanation || question.explanation.length < 20) {
      issues.push("Explanation too short or missing");
    }

    return issues;
  }

  /**
   * Utility: Add delay for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
