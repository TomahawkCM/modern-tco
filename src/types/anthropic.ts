/**
 * Anthropic AI SDK Type Definitions
 * Comprehensive TypeScript definitions for Claude API integration
 */

import { Anthropic } from "@anthropic-ai/sdk";
import type {
  Tool,
  ToolUseBlock,
  ToolResultBlockParam,
  ContentBlock,
  TextBlock,
  Message,
  MessageCreateParams,
  ImageBlockParam,
} from "@anthropic-ai/sdk/resources/messages/messages";
import type {
  APIError,
  APIConnectionError,
  APIUserAbortError,
  BadRequestError,
  AuthenticationError,
  PermissionDeniedError,
  NotFoundError,
  RateLimitError,
  InternalServerError,
} from "@anthropic-ai/sdk/core/error";

// Re-export core Anthropic types
export type {
  MessageCreateParams,
  Message,
  TextBlock,
  ImageBlockParam,
  ToolUseBlock,
  ToolResultBlockParam,
  ContentBlock,
  Tool,
  APIError,
  APIConnectionError,
  APIUserAbortError,
  BadRequestError,
  AuthenticationError,
  PermissionDeniedError,
  NotFoundError,
  RateLimitError,
  InternalServerError,
};

// Re-export with legacy names for backward compatibility
export type ImageBlock = ImageBlockParam;
export type ToolResultBlock = ToolResultBlockParam;

// Difficulty levels for questions and content
export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "easy" | "medium" | "hard";

// AI Model types
export type AIModel = "claude-3-5-sonnet-20241022" | "claude-3-5-haiku-20241022" | "claude-3-opus-20240229";

// Token counting and information
export interface TokenInfo {
  count: number;
  tokens: string[];
  text: string;
  estimatedCost: number;
}

// TCO Question Generation
export interface TCOQuestionGeneration {
  id?: string;
  topic?: string;
  subtopic?: string;
  question: string;
  answers: string[];
  correctAnswer: number;
  explanation: string;
  difficulty?: DifficultyLevel;
  practicalScenario?: boolean;
  estimatedTime?: number;
  learningObjectives?: string[];
  references?: string[];
  taniumVersion?: string;
  isPlaceholder?: boolean;
}

// Study Explanation
export interface StudyExplanation {
  concept: string;
  explanation: string;
  examples?: string[];
  references?: string[];
  relatedTopics?: string[];
  practicalApplications?: string[];
  commonMistakes?: string[];
  tips?: string[];
  difficulty: DifficultyLevel;
}

// Learning Analytics
export interface LearningAnalytics {
  userId?: string;
  sessionId?: string;
  topic?: string;
  overallScore?: number;
  performanceScore?: number;
  domainScores?: Record<string, number>;
  strengths?: string[];
  weaknesses?: string[];
  weakAreas?: string[];
  strongAreas?: string[];
  recommendations?: string[];
  recommendedActions?: string[];
  nextTopics?: string[];
  timeSpent?: number;
  questionsAttempted?: number;
  correctAnswers?: number;
  confidenceLevel?: number;
  masteryLevel?: string;
  questionStats?: {
    total: number;
    correct: number;
    incorrect: number;
    skipped: number;
    averageTime: number;
  };
}

// Study Session
export interface StudySession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  topics: string[];
  questionsAttempted: number;
  correctAnswers: number;
  duration: number;
  questionsAnswered?: any[];
  userAnswers?: any[];
  timeSpent?: number;
}

// Study Plan
export interface StudyPlan {
  id?: string;
  title?: string;
  description?: string;
  userId?: string;
  currentLevel?: DifficultyLevel;
  difficulty?: DifficultyLevel;
  completedModules?: string[];
  weakAreas?: string[];
  recommendedNext?: string[];
  topics?: string[];
  estimatedTime?: number;
  estimatedDuration?: number;
  prerequisites?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  studyPath?: {
    moduleId: string;
    priority: "high" | "medium" | "low";
    estimatedTime: number;
    prerequisites?: string[];
  }[];
}

// Chat Message
export interface ChatMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: any;
}

// Chat Session Context
export interface ChatSessionContext {
  currentTopic?: string;
  userLevel?: DifficultyLevel;
  studyGoals?: string[];
}

// Chat Session
export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  context?: string | ChatSessionContext;
  createdAt: Date;
  updatedAt: Date;
}

// TCO Study AI Interface
export interface ITCOStudyAI {
  countTokens(text: string): TokenInfo;
  generateQuestion(
    topic: string,
    difficulty: DifficultyLevel,
    options?: { practicalScenario?: boolean; taniumVersion?: string; subtopic?: string }
  ): Promise<TCOQuestionGeneration>;
}

// Extended types for our application
export interface AnthropicConfig {
  apiKey: string;
  baseURL?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  timeout?: number;
  maxRetries?: number;
}

export interface StudyAssistantConfig extends AnthropicConfig {
  systemPrompt?: string;
  studyContext?: string;
  userLevel?: "beginner" | "intermediate" | "advanced";
  examMode?: boolean;
}

export interface QuestionGenerationParams {
  topic: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  questionType: "multiple-choice" | "true-false" | "scenario" | "fill-blank";
  count: number;
  examWeight?: number;
  objectives?: string[];
  context?: string;
}

export interface GeneratedQuestion {
  id: string;
  type: "multiple-choice" | "true-false" | "scenario" | "fill-blank";
  difficulty: "beginner" | "intermediate" | "advanced";
  topic: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  references?: string[];
  timeEstimate?: number;
  examWeight: number;
}

export interface ExplanationRequest {
  concept: string;
  userLevel: "beginner" | "intermediate" | "advanced";
  context?: string;
  includeExamples?: boolean;
  includeReferences?: boolean;
}

export interface StudyPathRecommendation {
  currentLevel: "beginner" | "intermediate" | "advanced";
  completedModules: string[];
  weakAreas: string[];
  recommendedNext: string[];
  estimatedTime: number;
  studyPlan: {
    moduleId: string;
    priority: "high" | "medium" | "low";
    estimatedTime: number;
    prerequisites?: string[];
  }[];
}

export interface PerformanceAnalysis {
  overallScore: number;
  domainScores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  timeSpent: number;
  questionStats: {
    total: number;
    correct: number;
    incorrect: number;
    skipped: number;
    averageTime: number;
  };
}

// AI Service Response Types
export interface AIServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost?: number;
  };
  metadata?: {
    model: string;
    temperature: number;
    maxTokens: number;
    requestId: string;
    timestamp: string;
  };
}

export interface StreamingResponse {
  content: string;
  isComplete: boolean;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

// Tool definitions for function calling
export interface StudyTool extends Tool {
  name: "generate_question" | "explain_concept" | "analyze_performance" | "recommend_study_path";
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, any>;
    required: string[];
  };
}

// Error types specific to our application
export interface StudyServiceError {
  code: "INVALID_CONFIG" | "API_ERROR" | "RATE_LIMIT" | "QUOTA_EXCEEDED" | "NETWORK_ERROR";
  message: string;
  details?: any;
  retryAfter?: number;
}

// Token counting and optimization
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface TokenOptimizationSettings {
  maxContextLength: number;
  reserveTokensForResponse: number;
  truncationStrategy: "beginning" | "end" | "middle" | "smart";
  compressionLevel: "none" | "light" | "moderate" | "aggressive";
}

// Streaming types
export interface StreamingOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
  onTokenUsage?: (usage: TokenUsage) => void;
}

// Utility types
export type APIMethod = "POST" | "GET" | "PUT" | "DELETE";
export type ContentType = "text" | "image" | "tool_use" | "tool_result";

// Model-specific configurations
export interface ModelCapabilities {
  maxTokens: number;
  supportsImages: boolean;
  supportsFunctions: boolean;
  supportsStreaming: boolean;
  costPerToken: {
    input: number;
    output: number;
  };
}

export const CLAUDE_MODELS: Record<string, ModelCapabilities> = {
  "claude-3-5-sonnet-20241022": {
    maxTokens: 200000,
    supportsImages: true,
    supportsFunctions: true,
    supportsStreaming: true,
    costPerToken: {
      input: 0.003,
      output: 0.015,
    },
  },
  "claude-3-haiku-20240307": {
    maxTokens: 200000,
    supportsImages: true,
    supportsFunctions: true,
    supportsStreaming: true,
    costPerToken: {
      input: 0.00025,
      output: 0.00125,
    },
  },
};

// Export the main Anthropic client type
export type AnthropicClient = Anthropic;

// Default export for the main types
export default Anthropic;
