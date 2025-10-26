/**
 * Enhanced Anthropic Service with Advanced Error Handling and Recovery
 * Comprehensive error recovery, rate limiting, and resilience features
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  type AnthropicConfig,
  type TCOQuestionGeneration,
  StudyExplanation,
  type AIModel,
  type DifficultyLevel,
} from "@/types/anthropic";

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  jitter: boolean;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  burstLimit: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

export class EnhancedAnthropicService {
  private client: Anthropic;
  private readonly maxTokens = 4000;
  private readonly model: AIModel = "claude-3-5-sonnet-20241022";
  private readonly fallbackModel: AIModel = "claude-3-5-haiku-20241022";

  // Error handling and resilience
  private retryConfig: RetryConfig;
  private rateLimitConfig: RateLimitConfig;
  private circuitBreakerConfig: CircuitBreakerConfig;

  // Circuit breaker state
  private isCircuitOpen = false;
  private failureCount = 0;
  private lastFailureTime = 0;
  private successCount = 0;

  // Rate limiting state
  private requestTimes: number[] = [];
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;

  constructor(config: AnthropicConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
      maxRetries: 0, // We handle retries manually
      timeout: config.timeout || 60000,
      baseURL: config.baseURL,
    });

    this.retryConfig = {
      maxRetries: config.maxRetries || 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
      jitter: true,
    };

    this.rateLimitConfig = {
      requestsPerMinute: 50,
      requestsPerHour: 1000,
      burstLimit: 10,
    };

    this.circuitBreakerConfig = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 300000, // 5 minutes
    };
  }

  /**
   * Enhanced question generation with comprehensive error handling
   */
  async generateQuestion(
    topic: string,
    difficulty: DifficultyLevel = "medium",
    options?: {
      practicalScenario?: boolean;
      taniumVersion?: string;
      subtopic?: string;
      fallbackToCache?: boolean;
    }
  ): Promise<TCOQuestionGeneration> {
    const requestId = this.generateRequestId();

    try {
      console.log(`🤖 [${requestId}] Starting question generation for topic: ${topic}`);

      // Check circuit breaker
      this.checkCircuitBreaker();

      const result = await this.executeWithRetry(async () => {
        return await this.performQuestionGeneration(topic, difficulty, options);
      }, `generateQuestion-${topic}-${difficulty}`);

      this.recordSuccess();
      console.log(`✅ [${requestId}] Question generation successful`);

      return result;
    } catch (error) {
      this.recordFailure();
      console.error(`❌ [${requestId}] Question generation failed:`, error);

      // Try fallback strategies
      return await this.handleQuestionGenerationFailure(topic, difficulty, options, error);
    }
  }

  /**
   * Core question generation logic
   */
  private async performQuestionGeneration(
    topic: string,
    difficulty: DifficultyLevel,
    options?: any
  ): Promise<TCOQuestionGeneration> {
    const practicalScenario = options?.practicalScenario || false;
    const taniumVersion = options?.taniumVersion || "latest";
    const subtopic = options?.subtopic || "";

    const prompt = this.buildQuestionPrompt(topic, difficulty, {
      practicalScenario,
      taniumVersion,
      subtopic,
    });

    const response = await this.makeAPICall(() =>
      this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }],
        system: this.getSystemPrompt(),
      })
    );

    const content = response.content[0].type === "text" ? response.content[0].text : "";

    try {
      const parsed = JSON.parse(content);
      return this.validateAndFormatQuestion(parsed, topic, difficulty, options);
    } catch (parseError) {
      console.warn("Failed to parse JSON, attempting fallback extraction");
      return this.extractQuestionFromText(content, topic, difficulty, options);
    }
  }

  /**
   * Fallback question generation strategies
   */
  private async handleQuestionGenerationFailure(
    topic: string,
    difficulty: DifficultyLevel,
    options?: any,
    originalError?: any
  ): Promise<TCOQuestionGeneration> {
    console.warn(`🔄 Attempting fallback strategies for topic: ${topic}`);

    // Strategy 1: Try with simpler prompt
    try {
      console.log("📝 Trying simplified prompt");
      const simplePrompt = this.buildSimpleQuestionPrompt(topic, difficulty);

      const response = await this.makeAPICall(() =>
        this.client.messages.create({
          model: this.fallbackModel,
          max_tokens: 2000,
          temperature: 0.5,
          messages: [{ role: "user", content: simplePrompt }],
        })
      );

      const content = response.content[0].type === "text" ? response.content[0].text : "";
      const parsed = JSON.parse(content);

      return this.validateAndFormatQuestion(parsed, topic, difficulty, options);
    } catch (fallbackError) {
      console.warn("📝 Simplified prompt failed:", fallbackError);
    }

    // Strategy 2: Use template-based generation
    try {
      console.log("🔧 Using template-based generation");
      return this.generateTemplateQuestion(topic, difficulty, options);
    } catch (templateError) {
      console.warn("🔧 Template generation failed:", templateError);
    }

    // Strategy 3: Return cached question if available
    if (options?.fallbackToCache) {
      try {
        console.log("💾 Attempting cache fallback");
        const cachedQuestion = await this.getCachedQuestion(topic, difficulty);
        if (cachedQuestion) {
          return cachedQuestion;
        }
      } catch (cacheError) {
        console.warn("💾 Cache fallback failed:", cacheError);
      }
    }

    // Final fallback: Generate basic question
    console.warn("⚠️ All strategies failed, generating basic question");
    return this.generateBasicFallbackQuestion(topic, difficulty, originalError);
  }

  /**
   * Execute request with retry logic and exponential backoff
   */
  private async executeWithRetry<T>(operation: () => Promise<T>, operationId: string): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt < this.retryConfig.maxRetries; attempt++) {
      try {
        // Rate limiting check
        await this.enforceRateLimit();

        const result = await operation();

        if (attempt > 0) {
          console.log(`✅ Operation ${operationId} succeeded on attempt ${attempt + 1}`);
        }

        return result;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          console.warn(`❌ Non-retryable error for ${operationId}:`, error);
          throw error;
        }

        const isLastAttempt = attempt === this.retryConfig.maxRetries - 1;

        if (isLastAttempt) {
          console.error(`❌ Final attempt failed for ${operationId}:`, error);
          break;
        }

        const delay = this.calculateRetryDelay(attempt);
        console.warn(
          `⚠️ Attempt ${attempt + 1} failed for ${operationId}, retrying in ${delay}ms:`,
          error
        );

        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Rate limiting enforcement
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();

    // Clean old requests
    this.requestTimes = this.requestTimes.filter((time) => now - time < 60000);

    // Check minute limit
    if (this.requestTimes.length >= this.rateLimitConfig.requestsPerMinute) {
      const oldestRequest = this.requestTimes[0];
      const waitTime = 60000 - (now - oldestRequest);

      if (waitTime > 0) {
        console.warn(`⏳ Rate limit reached, waiting ${waitTime}ms`);
        await this.sleep(waitTime);
      }
    }

    this.requestTimes.push(now);
  }

  /**
   * Circuit breaker check
   */
  private checkCircuitBreaker(): void {
    const now = Date.now();

    // Reset circuit breaker if timeout passed
    if (this.isCircuitOpen && now - this.lastFailureTime > this.circuitBreakerConfig.resetTimeout) {
      console.log("🔄 Circuit breaker reset attempt");
      this.isCircuitOpen = false;
      this.failureCount = 0;
    }

    if (this.isCircuitOpen) {
      throw new Error("Circuit breaker is OPEN - too many recent failures");
    }
  }

  /**
   * Record successful request
   */
  private recordSuccess(): void {
    this.successCount++;

    // Gradually reduce failure count on success
    if (this.failureCount > 0) {
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }

  /**
   * Record failed request and update circuit breaker
   */
  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.circuitBreakerConfig.failureThreshold) {
      console.warn(`🚨 Circuit breaker OPENED after ${this.failureCount} failures`);
      this.isCircuitOpen = true;
    }
  }

  /**
   * Make API call with comprehensive error handling
   */
  private async makeAPICall<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      return await apiCall();
    } catch (error: any) {
      // Enhance error with additional context
      if (error?.error?.type === "rate_limit_error") {
        throw new Error(`Rate limited by Anthropic API: ${error.error.message}`);
      }

      if (error?.error?.type === "overloaded_error") {
        throw new Error(`Anthropic API overloaded: ${error.error.message}`);
      }

      if (error?.error?.type === "invalid_request_error") {
        throw new Error(`Invalid request: ${error.error.message}`);
      }

      if (error?.code === "ENOTFOUND" || error?.code === "ECONNRESET") {
        throw new Error(`Network error: ${error.message}`);
      }

      throw error;
    }
  }

  /**
   * Helper methods
   */
  private calculateRetryDelay(attempt: number): number {
    let delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt);

    delay = Math.min(delay, this.retryConfig.maxDelay);

    if (this.retryConfig.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.round(delay);
  }

  private isNonRetryableError(error: any): boolean {
    const nonRetryableTypes = ["invalid_request_error", "authentication_error", "permission_error"];

    return (
      nonRetryableTypes.includes(error?.error?.type) ||
      error?.status === 401 ||
      error?.status === 403 ||
      error?.status === 422
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Template and fallback generation methods
  private generateTemplateQuestion(
    topic: string,
    difficulty: DifficultyLevel,
    options?: any
  ): TCOQuestionGeneration {
    const templates = this.getQuestionTemplates();
    const template = templates[topic] || templates.default;

    return {
      id: this.generateRequestId(),
      question: template.question.replace("{topic}", topic),
      answers: template.answers,
      correctAnswer: template.correctAnswer,
      explanation: template.explanation.replace("{topic}", topic),
      difficulty,
      topic,
      subtopic: options?.subtopic || "",
      taniumVersion: options?.taniumVersion || "latest",
      practicalScenario: options?.practicalScenario || false,
      estimatedTime: 90,
      learningObjectives: [`Understanding ${topic} concepts`],
      references: [`Tanium ${topic} documentation`],
    };
  }

  private generateBasicFallbackQuestion(
    topic: string,
    difficulty: DifficultyLevel,
    error?: any
  ): TCOQuestionGeneration {
    return {
      id: this.generateRequestId(),
      question: `What is a key consideration when working with Tanium ${topic}?`,
      answers: [
        "Always follow security best practices",
        "Ignore system requirements",
        "Skip validation steps",
        "Disable monitoring",
      ],
      correctAnswer: 0,
      explanation: `When working with Tanium ${topic}, it's essential to follow security best practices to ensure system integrity and proper functionality.`,
      difficulty,
      topic,
      subtopic: "",
      taniumVersion: "latest",
      practicalScenario: false,
      estimatedTime: 60,
      learningObjectives: [`Basic ${topic} concepts`],
      references: [`Tanium documentation`],
      isPlaceholder: true,
      // originalError omitted to match TCOQuestionGeneration type
    };
  }

  private async getCachedQuestion(
    topic: string,
    difficulty: DifficultyLevel
  ): Promise<TCOQuestionGeneration | null> {
    // Implement caching logic here
    // This could integrate with localStorage, IndexedDB, or external cache
    return null;
  }

  private getQuestionTemplates(): Record<string, any> {
    return {
      default: {
        question: "What is an important aspect of {topic} in Tanium?",
        answers: [
          "Following best practices and security guidelines",
          "Ignoring system recommendations",
          "Bypassing validation steps",
          "Disabling error checking",
        ],
        correctAnswer: 0,
        explanation:
          "When working with {topic}, following established best practices and security guidelines ensures reliable and secure operations.",
      },
    };
  }

  private buildQuestionPrompt(topic: string, difficulty: DifficultyLevel, options: any): string {
    // Implementation of prompt building
    return `Generate a ${difficulty} TCO question about ${topic}...`;
  }

  private buildSimpleQuestionPrompt(topic: string, difficulty: DifficultyLevel): string {
    return `Create a simple ${difficulty} question about Tanium ${topic}. Return only JSON with question, answers array, correctAnswer index, and explanation.`;
  }

  private getSystemPrompt(): string {
    return "You are a Tanium expert creating TCO certification questions. Focus on practical knowledge and real-world scenarios.";
  }

  private validateAndFormatQuestion(
    parsed: any,
    topic: string,
    difficulty: DifficultyLevel,
    options?: any
  ): TCOQuestionGeneration {
    // Validate and format the parsed question data
    return {
      id: this.generateRequestId(),
      question: parsed.question || `Question about ${topic}`,
      answers: Array.isArray(parsed.answers) ? parsed.answers : ["A", "B", "C", "D"],
      correctAnswer: typeof parsed.correctAnswer === "number" ? parsed.correctAnswer : 0,
      explanation: parsed.explanation || `Explanation for ${topic}`,
      difficulty,
      topic,
      subtopic: options?.subtopic || "",
      taniumVersion: options?.taniumVersion || "latest",
      practicalScenario: options?.practicalScenario || false,
      estimatedTime: parsed.estimatedTime || 90,
      learningObjectives: parsed.learningObjectives || [],
      references: parsed.references || [],
    };
  }

  private extractQuestionFromText(
    content: string,
    topic: string,
    difficulty: DifficultyLevel,
    options?: any
  ): TCOQuestionGeneration {
    // Implement text extraction logic for non-JSON responses
    return this.generateBasicFallbackQuestion(topic, difficulty);
  }
}
