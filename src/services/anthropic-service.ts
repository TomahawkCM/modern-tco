/**
 * Advanced Anthropic AI Service for Modern TCO Study System
 * Next.js optimized with React Server Components and streaming support
 */

import Anthropic from "@anthropic-ai/sdk";
import type {
  AnthropicConfig,
  TCOQuestionGeneration,
  StudyExplanation,
  LearningAnalytics,
  StudySession,
  StudyPlan,
  ChatMessage,
  ChatSession,
  TokenInfo,
  ITCOStudyAI,
  AIModel,
  DifficultyLevel,
} from "@/types/anthropic";

export class ModernTCOStudyAI implements ITCOStudyAI {
  private client: Anthropic;
  private readonly maxTokens = 4000;
  private readonly model: AIModel = "claude-3-5-sonnet-20241022";
  private readonly streamingModel: AIModel = "claude-3-5-haiku-20241022";

  constructor(config: AnthropicConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
      maxRetries: config.maxRetries || 3,
      timeout: config.timeout || 60000,
      baseURL: config.baseURL,
    });
  }

  /**
   * Enhanced token counting with cost estimation
   */
  countTokens(text: string): TokenInfo {
    // Approximate token count (4 characters per token average)
    const approxTokens = Math.ceil(text.length / 4);
    return {
      count: approxTokens,
      tokens: [],
      text,
      estimatedCost: this.estimateTokenCost(approxTokens, this.model),
    };
  }

  /**
   * Generate single TCO exam question with enhanced metadata
   */
  async generateQuestion(
    topic: string,
    difficulty: DifficultyLevel = "medium",
    options?: {
      practicalScenario?: boolean;
      taniumVersion?: string;
      subtopic?: string;
    }
  ): Promise<TCOQuestionGeneration> {
    const practicalScenario = options?.practicalScenario || false;
    const taniumVersion = options?.taniumVersion || "latest";
    const subtopic = options?.subtopic || "";

    const prompt = `Generate a ${difficulty} level TCO certification question about Tanium ${topic}${subtopic ? ` - ${subtopic}` : ""}.

Requirements:
- Target Tanium version: ${taniumVersion}
- ${practicalScenario ? "Include practical, hands-on scenario" : "Focus on conceptual understanding"}
- 4 multiple choice answers (A, B, C, D)
- Detailed explanation with reasoning
- Real-world enterprise context
- Include learning objectives and time estimate

Format as JSON:
{
  "question": "Clear, specific question",
  "answers": ["A) option", "B) option", "C) option", "D) option"],
  "correctAnswer": 0-3,
  "explanation": "Detailed explanation with reasoning",
  "practicalScenario": boolean,
  "estimatedTime": seconds,
  "learningObjectives": ["objective1", "objective2"],
  "references": ["reference1", "reference2"]
}`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        system: `You are a Tanium Expert and TCO Certification Specialist. Create accurate, practical exam questions that test real-world Tanium operational knowledge.

Focus areas:
- Tanium Console operations
- Sensor deployment and management  
- Question building and targeting
- Patch management workflows
- Threat Response procedures
- Performance optimization
- Troubleshooting common issues

Ensure all questions are:
- Technically accurate for specified Tanium version
- Relevant to enterprise deployment scenarios
- Aligned with official TCO exam blueprint
- Challenging but fair for the difficulty level`,
      });

      const content = response.content[0].type === "text" ? response.content[0].text : "";
      const parsed = JSON.parse(content);

      return {
        id: this.generateId(),
        question: parsed.question,
        answers: parsed.answers,
        correctAnswer: parsed.correctAnswer,
        explanation: parsed.explanation,
        difficulty,
        topic,
        subtopic,
        taniumVersion,
        practicalScenario: parsed.practicalScenario || practicalScenario,
        estimatedTime: parsed.estimatedTime || 90,
        learningObjectives: parsed.learningObjectives || [],
        references: parsed.references || [],
      };
    } catch (error) {
      console.error("Question generation failed:", error);
      throw new Error(
        `Failed to generate question: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Generate batch of questions for comprehensive study sessions
   */
  async generateQuestionBatch(
    topics: string[],
    count: number,
    difficulty?: DifficultyLevel
  ): Promise<TCOQuestionGeneration[]> {
    const questions: TCOQuestionGeneration[] = [];
    const questionsPerTopic = Math.ceil(count / topics.length);

    for (const topic of topics) {
      for (let i = 0; i < questionsPerTopic && questions.length < count; i++) {
        try {
          const question = await this.generateQuestion(topic, difficulty);
          questions.push(question);

          // Add delay to avoid rate limiting
          await this.delay(500);
        } catch (error) {
          console.warn(`Failed to generate question for topic ${topic}:`, error);
        }
      }
    }

    return questions;
  }

  /**
   * Enhanced concept explanation with user level adaptation
   */
  async explainConcept(
    concept: string,
    userLevel: "beginner" | "intermediate" | "advanced" = "intermediate"
  ): Promise<StudyExplanation> {
    const prompt = `Explain the Tanium concept "${concept}" for a ${userLevel} level TCO candidate.

Provide comprehensive explanation including:
1. Clear definition and core principles
2. 2-3 practical examples with step-by-step details
3. Related Tanium concepts and how they connect
4. Real-world enterprise applications
5. Common mistakes and how to avoid them  
6. Pro tips for effective implementation
7. Troubleshooting guidance

Adapt complexity and depth for ${userLevel} level understanding.
Focus on practical, actionable information for TCO certification success.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        system: `You are a Tanium Expert and TCO Training Specialist. Provide clear, accurate explanations tailored to the user's experience level.

Adapt your teaching style:
- Beginner: Basic concepts, simple examples, foundational knowledge
- Intermediate: Moderate complexity, practical scenarios, best practices  
- Advanced: Complex implementations, optimization techniques, advanced troubleshooting

Always include:
- Step-by-step guidance
- Real-world context
- Practical tips from enterprise experience
- Connection to other Tanium features`,
      });

      const content = response.content[0].type === "text" ? response.content[0].text : "";

      return {
        concept,
        explanation: content,
        examples: this.extractExamples(content),
        relatedTopics: this.extractRelatedTopics(content),
        practicalApplications: this.extractPracticalApplications(content),
        commonMistakes: this.extractCommonMistakes(content),
        tips: this.extractTips(content),
        difficulty: userLevel,
      };
    } catch (error) {
      console.error("Concept explanation failed:", error);
      throw new Error(
        `Failed to explain concept: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Advanced performance analytics with ML insights
   */
  async analyzePerformance(userId: string, sessions: StudySession[]): Promise<LearningAnalytics> {
    if (sessions.length === 0) {
      throw new Error("No study sessions provided for analysis");
    }

    const totalQuestions = sessions.reduce((sum, s) => sum + (s.questionsAnswered?.length ?? 0), 0);
    const correctAnswers = sessions.reduce(
      (sum, s) =>
        sum +
        (s.userAnswers?.filter((ans, idx) => ans === s.questionsAnswered?.[idx]?.correctAnswer).length ?? 0),
      0
    );
    const totalTime = sessions.reduce((sum, s) => sum + (s.timeSpent ?? 0), 0);
    const performanceScore = (correctAnswers / totalQuestions) * 100;

    // Analyze weak areas
    const topicPerformance: Record<string, { correct: number; total: number }> = {};
    sessions.forEach((session) => {
      session.questionsAnswered?.forEach((question, idx) => {
        const { topic } = question;
        if (!topicPerformance[topic]) {
          topicPerformance[topic] = { correct: 0, total: 0 };
        }
        topicPerformance[topic].total++;
        if (session.userAnswers?.[idx] === question.correctAnswer) {
          topicPerformance[topic].correct++;
        }
      });
    });

    const weakAreas = Object.entries(topicPerformance)
      .filter(([_, perf]) => perf.correct / perf.total < 0.7)
      .map(([topic, _]) => topic);

    const strongAreas = Object.entries(topicPerformance)
      .filter(([_, perf]) => perf.correct / perf.total >= 0.8)
      .map(([topic, _]) => topic);

    // AI-powered analysis for personalized recommendations
    const prompt = `Analyze TCO study performance data:

Performance Metrics:
- Overall Score: ${performanceScore.toFixed(1)}%
- Questions Attempted: ${totalQuestions}
- Correct Answers: ${correctAnswers}
- Total Study Time: ${Math.round(totalTime / 60)} minutes
- Weak Areas: ${weakAreas.join(", ") || "None identified"}
- Strong Areas: ${strongAreas.join(", ") || "None identified"}

Provide personalized recommendations:
1. 3 specific improvement actions
2. Next 3 priority topics to study
3. Study strategy adjustments
4. Confidence level assessment (0-100)
5. Mastery level evaluation

Format as JSON:
{
  "recommendedActions": ["action1", "action2", "action3"],
  "nextTopics": ["topic1", "topic2", "topic3"], 
  "confidenceLevel": 0-100,
  "masteryLevel": "novice|developing|proficient|expert"
}`;

    try {
      const response = await this.client.messages.create({
        model: this.streamingModel, // Use faster model for analysis
        max_tokens: 2000,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        system:
          "You are a Learning Analytics Expert specializing in TCO certification preparation. Provide data-driven, personalized recommendations.",
      });

      const content = response.content[0].type === "text" ? response.content[0].text : "";
      const aiAnalysis = JSON.parse(content);

      return {
        userId,
        sessionId: sessions[sessions.length - 1].id,
        topic: "Overall Performance Analysis",
        performanceScore,
        timeSpent: totalTime,
        questionsAttempted: totalQuestions,
        correctAnswers,
        weakAreas,
        strongAreas,
        recommendedActions: aiAnalysis.recommendedActions || [],
        nextTopics: aiAnalysis.nextTopics || [],
        confidenceLevel:
          aiAnalysis.confidenceLevel || this.calculateConfidenceLevel(performanceScore),
        masteryLevel:
          aiAnalysis.masteryLevel || this.calculateMasteryLevel(performanceScore, totalQuestions),
      };
    } catch (error) {
      console.error("Performance analysis failed:", error);

      // Fallback to rule-based analysis
      return {
        userId,
        sessionId: sessions[sessions.length - 1].id,
        topic: "Overall Performance Analysis",
        performanceScore,
        timeSpent: totalTime,
        questionsAttempted: totalQuestions,
        correctAnswers,
        weakAreas,
        strongAreas,
        recommendedActions: this.generateFallbackRecommendations(performanceScore, weakAreas),
        nextTopics: weakAreas.slice(0, 3),
        confidenceLevel: this.calculateConfidenceLevel(performanceScore),
        masteryLevel: this.calculateMasteryLevel(performanceScore, totalQuestions),
      };
    }
  }

  /**
   * AI-powered personalized study plan creation
   */
  async createStudyPlan(
    userId: string,
    weakAreas: string[],
    timeAvailable: number,
    targetDate?: Date
  ): Promise<StudyPlan> {
    const prompt = `Create a personalized TCO study plan:

Parameters:
- Weak areas to focus on: ${weakAreas.join(", ")}
- Available study time: ${timeAvailable} hours
- Target exam date: ${targetDate ? targetDate.toDateString() : "Not specified"}
- Goal: TCO certification success

Create comprehensive study plan with:
1. Prioritized topic sequence (5-7 main topics)
2. Time allocation per topic
3. Prerequisites and learning progression
4. Practice question recommendations
5. Review and reinforcement schedule

Format as JSON with topics array containing:
- topic: string
- subtopics: string[]  
- estimatedTime: minutes
- priority: "low"|"medium"|"high"
- prerequisites: string[]`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 3000,
        temperature: 0.4,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        system:
          "You are a TCO Certification Expert and Study Plan Specialist. Create effective, personalized study plans based on individual needs and time constraints.",
      });

      const content = response.content[0].type === "text" ? response.content[0].text : "";
      const planData = JSON.parse(content);

      return {
        id: this.generateId(),
        userId,
        title: `Personalized TCO Study Plan - ${new Date().toLocaleDateString()}`,
        description: `Customized study plan focusing on ${weakAreas.length} key areas over ${timeAvailable} hours`,
        estimatedDuration: timeAvailable,
        topics: planData.topics.map((topic: any) => ({
          topic: topic.topic,
          subtopics: topic.subtopics || [],
          estimatedTime: topic.estimatedTime || 60,
          priority: topic.priority || "medium",
          completed: false,
          score: undefined,
          notes: "",
        })),
        prerequisites: planData.prerequisites || [],
        difficulty: this.determinePlanDifficulty(weakAreas.length),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error("Study plan creation failed:", error);
      throw new Error(
        `Failed to create study plan: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Real-time chat assistance with context awareness
   */
  async chatAssist(message: string, context: ChatSession["context"]): Promise<ChatMessage> {
    // Type guard for ChatSessionContext
    const sessionContext = typeof context === 'string' ? undefined : context;

    const prompt = `User question: "${message}"

Context:
- Current topic: ${sessionContext?.currentTopic || "General TCO study"}
- User level: ${sessionContext?.userLevel || "intermediate"}
- Study goals: ${sessionContext?.studyGoals?.join(", ") || "TCO certification"}

Provide helpful, accurate response as a Tanium TCO expert. 
Be conversational but authoritative.
Include practical examples when relevant.
If the question is outside Tanium/TCO scope, politely redirect to certification topics.`;

    try {
      const response = await this.client.messages.create({
        model: this.streamingModel,
        max_tokens: 2000,
        temperature: 0.6,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        system:
          "You are a friendly Tanium TCO Expert providing real-time study assistance. Be helpful, encouraging, and accurate.",
      });

      const content = response.content[0].type === "text" ? response.content[0].text : "";
      const tokenCount = this.countTokens(content).count;

      return {
        id: this.generateId(),
        role: "assistant",
        content,
        timestamp: new Date(),
        metadata: {
          tokens: tokenCount,
          model: this.streamingModel,
          confidence: 0.9,
          relatedTopics: this.extractRelatedTopics(content),
        },
      };
    } catch (error) {
      console.error("Chat assistance failed:", error);
      throw new Error(
        `Failed to provide chat assistance: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Content validation for study materials
   */
  async validateContent(content: string): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    const prompt = `Validate this TCO study content for accuracy and quality:

"${content}"

Check for:
1. Technical accuracy for Tanium platform
2. Alignment with TCO certification requirements
3. Clarity and comprehension
4. Completeness of information
5. Potential misconceptions

Provide validation results with specific issues and improvement suggestions.`;

    try {
      const response = await this.client.messages.create({
        model: this.streamingModel,
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        system:
          "You are a TCO Content Quality Assurance Expert. Validate study materials for technical accuracy and educational effectiveness.",
      });

      const result = response.content[0].type === "text" ? response.content[0].text : "";

      return {
        isValid:
          !result.toLowerCase().includes("inaccurate") &&
          !result.toLowerCase().includes("incorrect"),
        issues: this.extractIssues(result),
        suggestions: this.extractSuggestions(result),
      };
    } catch (error) {
      console.error("Content validation failed:", error);
      return {
        isValid: false,
        issues: ["Validation service temporarily unavailable"],
        suggestions: ["Please verify content manually or try again later"],
      };
    }
  }

  /**
   * Optimize prompts for token efficiency
   */
  async optimizePrompt(prompt: string, maxTokens: number): Promise<string> {
    const approxTokens = Math.ceil(prompt.length / 4);
    if (approxTokens <= maxTokens) return prompt;

    // Smart truncation preserving key information
    const maxChars = maxTokens * 4;
    return prompt.substring(0, maxChars);
  }

  // Helper methods
  private generateId(): string {
    return `tco_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private estimateTokenCost(tokenCount: number, model: AIModel): number {
    // Approximate costs per 1K tokens (update with current pricing)
    const costs = {
      "claude-3-5-sonnet-20241022": 0.003,
      "claude-3-5-haiku-20241022": 0.00025,
      "claude-3-opus-20240229": 0.015,
    };
    return (tokenCount / 1000) * (costs[model] || 0.003);
  }

  private calculateConfidenceLevel(score: number): number {
    if (score >= 90) return 95;
    if (score >= 80) return 85;
    if (score >= 70) return 75;
    if (score >= 60) return 65;
    return Math.max(30, score - 10);
  }

  private calculateMasteryLevel(
    score: number,
    questions: number
  ): LearningAnalytics["masteryLevel"] {
    if (score >= 90 && questions >= 50) return "expert";
    if (score >= 80 && questions >= 30) return "proficient";
    if (score >= 70 && questions >= 20) return "developing";
    return "novice";
  }

  private determinePlanDifficulty(
    weakAreasCount: number
  ): "beginner" | "intermediate" | "advanced" {
    if (weakAreasCount <= 2) return "advanced";
    if (weakAreasCount <= 4) return "intermediate";
    return "beginner";
  }

  private generateFallbackRecommendations(score: number, weakAreas: string[]): string[] {
    if (score >= 80)
      return ["Focus on advanced scenarios", "Practice time management", "Review edge cases"];
    if (score >= 60)
      return ["Strengthen weak areas", "Increase practice frequency", "Seek additional resources"];
    return ["Review fundamentals", "Start with easier topics", "Consider additional training"];
  }

  // Content extraction helpers
  private extractExamples(content: string): string[] {
    const examples =
      content.match(/(?:Example|For example)[\s\S]*?(?=\n\n|\nExample|\n[A-Z]|$)/gi) || [];
    return examples.map((ex) => ex.trim()).slice(0, 3);
  }

  private extractRelatedTopics(content: string): string[] {
    const topics =
      content.match(/(?:related|connect|similar|also|see also)[\s\S]*?(?=\.|,|\n|$)/gi) || [];
    return topics
      .map((topic) => topic.replace(/(?:related|connect|similar|also|see also)/gi, "").trim())
      .slice(0, 5);
  }

  private extractPracticalApplications(content: string): string[] {
    const apps = content.match(/(?:application|use case|scenario)[\s\S]*?(?=\n|\.|$)/gi) || [];
    return apps.map((app) => app.trim()).slice(0, 4);
  }

  private extractCommonMistakes(content: string): string[] {
    const mistakes = content.match(/(?:mistake|error|pitfall|avoid)[\s\S]*?(?=\n|\.|$)/gi) || [];
    return mistakes.map((mistake) => mistake.trim()).slice(0, 3);
  }

  private extractTips(content: string): string[] {
    const tips = content.match(/(?:tip|pro tip|best practice)[\s\S]*?(?=\n|\.|$)/gi) || [];
    return tips.map((tip) => tip.trim()).slice(0, 4);
  }

  private extractIssues(content: string): string[] {
    const issues =
      content.match(/(?:issue|problem|inaccurate|incorrect)[\s\S]*?(?=\n|\.|$)/gi) || [];
    return issues.map((issue) => issue.trim()).slice(0, 5);
  }

  private extractSuggestions(content: string): string[] {
    const suggestions = content.match(/(?:suggest|recommend|improve)[\s\S]*?(?=\n|\.|$)/gi) || [];
    return suggestions.map((suggestion) => suggestion.trim()).slice(0, 5);
  }
}

// Utility functions for external use
export function countTokens(text: string): number {
  // Approximate token count (4 characters per token average)
  return Math.ceil(text.length / 4);
}

export function optimizePrompt(prompt: string, maxTokens: number): string {
  const approxTokens = Math.ceil(prompt.length / 4);
  if (approxTokens <= maxTokens) return prompt;

  const maxChars = maxTokens * 4;
  return prompt.substring(0, maxChars);
}

export function validateTokenLimit(content: string, limit: number): boolean {
  return Math.ceil(content.length / 4) <= limit;
}

export function estimateTokenCost(tokenCount: number, model: AIModel): number {
  const costs = {
    "claude-3-5-sonnet-20241022": 0.003,
    "claude-3-5-haiku-20241022": 0.00025,
    "claude-3-opus-20240229": 0.015,
  };
  return (tokenCount / 1000) * (costs[model] || 0.003);
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export function calculateMasteryLevel(
  score: number,
  attempts: number
): LearningAnalytics["masteryLevel"] {
  if (score >= 90 && attempts >= 50) return "expert";
  if (score >= 80 && attempts >= 30) return "proficient";
  if (score >= 70 && attempts >= 20) return "developing";
  return "novice";
}
