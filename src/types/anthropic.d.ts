/**
 * Anthropic AI SDK Type Definitions
 * Comprehensive TypeScript definitions for Claude API integration
 */

import { Anthropic } from "@anthropic-ai/sdk";

// Re-export core Anthropic types
export type {
  MessageCreateParams,
  Message,
  TextBlock,
  ImageBlock,
  ToolUseBlock,
  ToolResultBlock,
  ContentBlock,
  MessageParam,
  TextBlockParam,
  ImageBlockParam,
  ToolUseBlockParam,
  ToolResultBlockParam,
  Tool,
  ToolChoice,
  Model,
  APIError,
  APIConnectionError,
  APIUserAbortError,
  BadRequestError,
  AuthenticationError,
  PermissionDeniedError,
  NotFoundError,
  RateLimitError,
  InternalServerError,
} from "@anthropic-ai/sdk";

// Extended types for our application
export interface AnthropicConfig {
  apiKey: string;
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
