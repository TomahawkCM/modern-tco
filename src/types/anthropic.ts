/**
 * Anthropic AI Integration Types for Modern TCO Study System
 * Enhanced TypeScript definitions for Next.js application
 */

import Anthropic from "@anthropic-ai/sdk";

// Core Anthropic SDK configuration
export interface AnthropicConfig {
  apiKey: string;
  maxRetries?: number;
  timeout?: number;
  baseURL?: string;
}

// Token management and optimization
export interface TokenInfo {
  count: number;
  tokens: number[];
  text: string;
  estimatedCost?: number;
}

// TCO Study-specific response types
export interface StudyResponse {
  content: string;
  tokenCount: number;
  model: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Enhanced question generation for TCO certification
export interface TCOQuestionGeneration {
  id: string;
  question: string;
  answers: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  subtopic?: string;
  taniumVersion?: string;
  practicalScenario: boolean;
  estimatedTime: number; // seconds
  learningObjectives: string[];
  references?: string[];
  isPlaceholder?: boolean; // Add this property
}

// Comprehensive study explanations
export interface StudyExplanation {
  concept: string;
  explanation: string;
  examples: string[];
  relatedTopics: string[];
  practicalApplications: string[];
  commonMistakes: string[];
  tips: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

// Advanced learning analytics
export interface LearningAnalytics {
  userId: string;
  sessionId: string;
  topic: string;
  performanceScore: number;
  timeSpent: number;
  questionsAttempted: number;
  correctAnswers: number;
  weakAreas: string[];
  strongAreas: string[];
  recommendedActions: string[];
  nextTopics: string[];
  confidenceLevel: number;
  masteryLevel: "novice" | "developing" | "proficient" | "expert";
}

// Study session tracking
export interface StudySession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  topics: string[];
  questionsAnswered: TCOQuestionGeneration[];
  userAnswers: number[];
  score: number;
  timeSpent: number;
  analytics: LearningAnalytics;
}

// Bedrock configuration for enterprise deployment
export interface BedrockConfig extends AnthropicConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  modelId?: string;
}

// AI-powered study plan
export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  estimatedDuration: number; // hours
  topics: StudyPlanTopic[];
  prerequisites: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyPlanTopic {
  topic: string;
  subtopics: string[];
  estimatedTime: number; // minutes
  priority: "low" | "medium" | "high";
  completed: boolean;
  score?: number;
  notes?: string;
}

// Real-time chat assistance
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    tokens?: number;
    model?: string;
    confidence?: number;
    relatedTopics?: string[];
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  context: {
    currentTopic?: string;
    userLevel?: string;
    studyGoals?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Utility type definitions
export type AIModel =
  | "claude-3-5-sonnet-20241022"
  | "claude-3-5-haiku-20241022"
  | "claude-3-opus-20240229";

export type DifficultyLevel = "easy" | "medium" | "hard";
export type TopicCategory =
  | "tanium-core"
  | "endpoint-management"
  | "threat-response"
  | "patch-management"
  | "compliance"
  | "architecture"
  | "administration"
  | "troubleshooting";

// Enhanced TCO Study AI class interface
export interface ITCOStudyAI {
  // Core functionality
  countTokens(text: string): TokenInfo;
  optimizePrompt(prompt: string, maxTokens: number): Promise<string>;

  // Question generation
  generateQuestion(
    topic: string,
    difficulty?: DifficultyLevel,
    options?: {
      practicalScenario?: boolean;
      taniumVersion?: string;
      subtopic?: string;
    }
  ): Promise<TCOQuestionGeneration>;

  generateQuestionBatch(
    topics: string[],
    count: number,
    difficulty?: DifficultyLevel
  ): Promise<TCOQuestionGeneration[]>;

  // Content explanation
  explainConcept(
    concept: string,
    userLevel?: "beginner" | "intermediate" | "advanced"
  ): Promise<StudyExplanation>;

  // Analytics and recommendations
  analyzePerformance(userId: string, sessions: StudySession[]): Promise<LearningAnalytics>;

  // Study planning
  createStudyPlan(
    userId: string,
    weakAreas: string[],
    timeAvailable: number,
    targetDate?: Date
  ): Promise<StudyPlan>;

  // Real-time assistance
  chatAssist(message: string, context: ChatSession["context"]): Promise<ChatMessage>;

  // Content validation
  validateContent(content: string): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }>;
}

// React hook types for AI integration
export interface UseAIChat {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

export interface UseQuestionGenerator {
  isGenerating: boolean;
  error: string | null;
  generateQuestion: (topic: string, difficulty?: DifficultyLevel) => Promise<TCOQuestionGeneration>;
  generateBatch: (topics: string[], count: number) => Promise<TCOQuestionGeneration[]>;
}

export interface UseStudyAnalytics {
  analytics: LearningAnalytics | null;
  isAnalyzing: boolean;
  error: string | null;
  analyzeSession: (session: StudySession) => Promise<void>;
  getRecommendations: () => string[];
}

// Utility functions
export declare function countTokens(text: string): number;
export declare function optimizePrompt(prompt: string, maxTokens: number): string;
export declare function validateTokenLimit(content: string, limit: number): boolean;
export declare function estimateTokenCost(tokenCount: number, model: AIModel): number;
export declare function formatTime(seconds: number): string;
export declare function calculateMasteryLevel(
  score: number,
  attempts: number
): LearningAnalytics["masteryLevel"];

export default Anthropic;
