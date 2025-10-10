/**
 * AI Tutor Service
 *
 * 24/7 conversational AI tutor powered by Claude for Tanium TCO students.
 * Provides context-aware assistance, concept explanations, exam strategy,
 * and personalized study support.
 *
 * Features:
 * - Context-aware conversations (knows student's current location in course)
 * - Tanium TCO domain expertise
 * - Exam strategy coaching
 * - "Explain like I'm 5" capability for complex concepts
 * - Motivational support
 */

import { supabase } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';

// ==================== TYPES ====================

export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  conversationType: 'general_help' | 'concept_explanation' | 'exam_strategy' | 'troubleshooting' | 'study_planning' | 'motivation';
  relatedModuleId?: string;
  relatedDomain?: string;
  relatedSectionId?: string;
  status: 'active' | 'archived';
  lastMessageAt: Date;
  aiModel: string;
  systemPrompt?: string;
  messageCount: number;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  tokensUsed?: number;
  processingTimeMs?: number;
  confidenceScore?: number;
  referencedContent?: any;
  codeSnippets?: any;
  wasHelpful?: boolean;
  userFeedback?: string;
  createdAt: Date;
}

export interface TutorContext {
  userId: string;
  currentModuleId?: string;
  currentDomain?: string;
  currentSectionId?: string;
  recentPerformance?: {
    lastQuizScore?: number;
    weakAreas?: string[];
    strongAreas?: string[];
  };
  studyGoals?: {
    targetExamDate?: Date;
    targetScore?: number;
    hoursPerWeek?: number;
  };
}

export interface TutorResponse {
  message: Message;
  suggestedFollowUps?: string[];
  relatedResources?: {
    type: 'module' | 'video' | 'practice' | 'lab';
    id: string;
    title: string;
    url: string;
  }[];
}

// ==================== CONSTANTS ====================

const DEFAULT_MODEL = 'claude-3-5-sonnet-20241022';
const MAX_TOKENS = 2000;
const TEMPERATURE = 0.7;

// System prompts for different conversation types
const SYSTEM_PROMPTS = {
  general_help: `You are an expert AI tutor for the Tanium Certified Operator (TCO) certification exam. Your role is to:

1. Provide accurate, helpful information about Tanium platform concepts
2. Answer questions clearly and concisely
3. Use examples relevant to TCO exam topics
4. Encourage the student and maintain a positive, supportive tone
5. Guide students to discover answers rather than just giving them
6. Reference specific TCO modules and domains when relevant

TCO Exam Domains:
- Asking Questions (22% exam weight) - Natural language queries, sensors
- Refining Questions (23% exam weight) - Targeting, filtering, computer groups
- Taking Action (15% exam weight) - Package deployment, actions
- Navigation & Basic Modules (23% exam weight) - Console navigation, module functions
- Report Generation & Export (17% exam weight) - Creating reports, data export

Keep responses concise (2-3 paragraphs max) unless the student asks for more detail.`,

  concept_explanation: `You are an expert at explaining complex Tanium concepts in simple terms. When explaining:

1. Start with a simple analogy or real-world comparison
2. Break down the concept into smaller parts
3. Use progressive disclosure - simple first, then add complexity
4. Provide concrete examples from Tanium
5. Check for understanding with follow-up questions
6. Offer to explain in different ways if needed

Always relate concepts back to the TCO certification exam and practical use cases.`,

  exam_strategy: `You are a TCO exam preparation expert. Help students with:

1. Test-taking strategies specific to TCO
2. Time management (60 questions in 90 minutes)
3. How to approach different question types (multiple choice, practical)
4. Common mistakes to avoid
5. Last-minute review strategies
6. Anxiety reduction techniques

Provide actionable, specific advice tailored to their current preparation level.`,

  troubleshooting: `You are a Tanium troubleshooting expert. When helping with problems:

1. Ask clarifying questions to understand the issue
2. Walk through systematic troubleshooting steps
3. Explain why certain steps are taken
4. Provide alternative approaches if first method doesn't work
5. Connect issues back to foundational TCO concepts
6. Suggest practice exercises to reinforce learning

Focus on teaching problem-solving skills, not just solving the immediate problem.`,

  study_planning: `You are a study planning expert for TCO certification. Help students:

1. Create realistic study schedules based on their available time
2. Prioritize topics based on exam blueprint weights
3. Balance different learning activities (reading, practice, videos, labs)
4. Build in spaced repetition and review sessions
5. Adjust plans based on performance data
6. Set achievable milestones

Provide specific, actionable plans with dates and time estimates.`,

  motivation: `You are a supportive mentor for TCO students. When providing motivation:

1. Acknowledge challenges and validate feelings
2. Celebrate progress, no matter how small
3. Reframe setbacks as learning opportunities
4. Connect effort to concrete outcomes
5. Share encouragement based on their actual progress
6. Help them visualize success

Be genuine, empathetic, and inspiring without being cheesy.`,
};

// ==================== AI CLIENT SETUP ====================

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

// ==================== CONVERSATION MANAGEMENT ====================

export async function createConversation(
  userId: string,
  type: Conversation['conversationType'] = 'general_help',
  context?: TutorContext
): Promise<Conversation> {
  const systemPrompt = buildSystemPrompt(type, context);

  const { data, error } = await supabase
    .from('ai_tutor_conversations')
    .insert({
      user_id: userId,
      conversation_type: type,
      related_module_id: context?.currentModuleId,
      related_domain: context?.currentDomain,
      related_section_id: context?.currentSectionId,
      status: 'active',
      ai_model: DEFAULT_MODEL,
      system_prompt: systemPrompt,
      message_count: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return camelCaseKeys(data) as Conversation;
}

export async function getActiveConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('ai_tutor_conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('last_message_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return (data || []).map(camelCaseKeys) as Conversation[];
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('ai_tutor_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map(camelCaseKeys) as Message[];
}

export async function archiveConversation(conversationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('ai_tutor_conversations')
    .update({ status: 'archived' })
    .eq('id', conversationId)
    .eq('user_id', userId);

  if (error) throw error;
}

// ==================== AI INTERACTION ====================

export async function sendMessage(
  conversationId: string,
  userId: string,
  userMessage: string,
  context?: TutorContext
): Promise<TutorResponse> {
  const startTime = Date.now();

  // Save user message
  const { data: userMessageData, error: userMsgError } = await supabase
    .from('ai_tutor_messages')
    .insert({
      conversation_id: conversationId,
      role: 'user',
      content: userMessage,
    })
    .select()
    .single();

  if (userMsgError) throw userMsgError;

  // Get conversation history
  const messages = await getConversationMessages(conversationId);

  // Get conversation details for system prompt
  const { data: conversation } = await supabase
    .from('ai_tutor_conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (!conversation) throw new Error('Conversation not found');

  // Build context-enhanced system prompt
  const systemPrompt = conversation.system_prompt || buildSystemPrompt(conversation.conversation_type, context);
  const contextualPrompt = enhancePromptWithContext(systemPrompt, context);

  // Call Claude API
  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    system: contextualPrompt,
    messages: messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
  });

  const processingTime = Date.now() - startTime;

  // Extract response
  const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : '';
  const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

  // Save assistant message
  const { data: assistantMessageData, error: assistantMsgError } = await supabase
    .from('ai_tutor_messages')
    .insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: assistantMessage,
      model: DEFAULT_MODEL,
      tokens_used: tokensUsed,
      processing_time_ms: processingTime,
    })
    .select()
    .single();

  if (assistantMsgError) throw assistantMsgError;

  // Update conversation
  await supabase
    .from('ai_tutor_conversations')
    .update({
      last_message_at: new Date().toISOString(),
      message_count: messages.length + 2, // +user msg +assistant msg
    })
    .eq('id', conversationId);

  // Extract suggested follow-ups and related resources
  const suggestedFollowUps = extractSuggestedFollowUps(assistantMessage, context);
  const relatedResources = extractRelatedResources(assistantMessage, context);

  return {
    message: camelCaseKeys(assistantMessageData) as Message,
    suggestedFollowUps,
    relatedResources,
  };
}

// ==================== QUICK QUESTION (ONE-OFF) ====================

export async function askQuickQuestion(
  userId: string,
  question: string,
  context?: TutorContext
): Promise<TutorResponse> {
  // Create temporary conversation
  const conversation = await createConversation(userId, 'general_help', context);

  // Send message
  const response = await sendMessage(conversation.id, userId, question, context);

  // Archive conversation (it's a one-off)
  await archiveConversation(conversation.id, userId);

  return response;
}

// ==================== SPECIALIZED HELPERS ====================

export async function explainConcept(
  userId: string,
  conceptName: string,
  difficultyLevel: 'simple' | 'intermediate' | 'advanced' = 'simple',
  context?: TutorContext
): Promise<TutorResponse> {
  const conversation = await createConversation(userId, 'concept_explanation', context);

  let question = '';
  if (difficultyLevel === 'simple') {
    question = `Can you explain ${conceptName} in simple terms, like I'm new to Tanium?`;
  } else if (difficultyLevel === 'intermediate') {
    question = `Can you explain ${conceptName} with some technical detail?`;
  } else {
    question = `Can you give me an advanced, comprehensive explanation of ${conceptName}?`;
  }

  return sendMessage(conversation.id, userId, question, context);
}

export async function getExamStrategy(
  userId: string,
  daysUntilExam: number,
  currentReadinessScore: number,
  context?: TutorContext
): Promise<TutorResponse> {
  const conversation = await createConversation(userId, 'exam_strategy', context);

  const question = `I have ${daysUntilExam} days until my TCO exam. My current readiness score is ${currentReadinessScore}%. What should my study strategy be?`;

  return sendMessage(conversation.id, userId, question, context);
}

export async function getMotivation(
  userId: string,
  challenge: string,
  context?: TutorContext
): Promise<TutorResponse> {
  const conversation = await createConversation(userId, 'motivation', context);

  const question = `I'm struggling with: ${challenge}. Can you help me stay motivated?`;

  return sendMessage(conversation.id, userId, question, context);
}

// ==================== FEEDBACK ====================

export async function rateMessage(
  messageId: string,
  userId: string,
  wasHelpful: boolean,
  feedback?: string
): Promise<void> {
  const { error } = await supabase
    .from('ai_tutor_messages')
    .update({
      was_helpful: wasHelpful,
      user_feedback: feedback,
    })
    .eq('id', messageId);

  if (error) throw error;
}

// ==================== HELPER FUNCTIONS ====================

function buildSystemPrompt(type: Conversation['conversationType'], context?: TutorContext): string {
  let basePrompt = SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.general_help;

  if (context) {
    basePrompt = enhancePromptWithContext(basePrompt, context);
  }

  return basePrompt;
}

function enhancePromptWithContext(basePrompt: string, context?: TutorContext): string {
  if (!context) return basePrompt;

  let enhanced = basePrompt + '\n\n**Current Student Context:**\n';

  if (context.currentModuleId || context.currentDomain) {
    enhanced += `- Currently studying: ${context.currentDomain || context.currentModuleId}\n`;
  }

  if (context.recentPerformance) {
    if (context.recentPerformance.lastQuizScore !== undefined) {
      enhanced += `- Recent quiz score: ${context.recentPerformance.lastQuizScore}%\n`;
    }
    if (context.recentPerformance.weakAreas && context.recentPerformance.weakAreas.length > 0) {
      enhanced += `- Weak areas: ${context.recentPerformance.weakAreas.join(', ')}\n`;
    }
    if (context.recentPerformance.strongAreas && context.recentPerformance.strongAreas.length > 0) {
      enhanced += `- Strong areas: ${context.recentPerformance.strongAreas.join(', ')}\n`;
    }
  }

  if (context.studyGoals) {
    if (context.studyGoals.targetExamDate) {
      const daysUntil = Math.ceil((context.studyGoals.targetExamDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      enhanced += `- Days until exam: ${daysUntil}\n`;
    }
    if (context.studyGoals.targetScore) {
      enhanced += `- Target score: ${context.studyGoals.targetScore}%\n`;
    }
    if (context.studyGoals.hoursPerWeek) {
      enhanced += `- Study commitment: ${context.studyGoals.hoursPerWeek} hours/week\n`;
    }
  }

  enhanced += '\nUse this context to personalize your response and make it more relevant to their current situation.';

  return enhanced;
}

function extractSuggestedFollowUps(message: string, context?: TutorContext): string[] {
  // Basic suggestions based on conversation flow
  const suggestions: string[] = [];

  if (message.toLowerCase().includes('practice')) {
    suggestions.push('Show me practice questions on this topic');
  }

  if (message.toLowerCase().includes('example')) {
    suggestions.push('Can you give me another example?');
  }

  if (context?.currentDomain) {
    suggestions.push(`What are common mistakes in ${context.currentDomain}?`);
  }

  return suggestions.slice(0, 3); // Max 3 suggestions
}

function extractRelatedResources(message: string, context?: TutorContext): TutorResponse['relatedResources'] {
  const resources: TutorResponse['relatedResources'] = [];

  // Map domains to modules
  const domainModuleMap: Record<string, { id: string; title: string }> = {
    asking_questions: {
      id: '01-asking-questions',
      title: 'Asking Questions Module',
    },
    refining_questions: {
      id: '02-refining-questions-targeting',
      title: 'Refining Questions Module',
    },
    taking_action: {
      id: '03-taking-action-packages-actions',
      title: 'Taking Action Module',
    },
    navigation_basic_functions: {
      id: '04-navigation-basic-modules',
      title: 'Navigation & Basic Modules',
    },
    report_generation_export: {
      id: '05-reporting-data-export',
      title: 'Reporting & Data Export Module',
    },
  };

  if (context?.currentDomain && domainModuleMap[context.currentDomain]) {
    const module = domainModuleMap[context.currentDomain];
    resources.push({
      type: 'module',
      id: module.id,
      title: module.title,
      url: `/study/${module.id}`,
    });
  }

  return resources;
}

function camelCaseKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(camelCaseKeys);
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      result[camelKey] = camelCaseKeys(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

export default {
  createConversation,
  getActiveConversations,
  getConversationMessages,
  archiveConversation,
  sendMessage,
  askQuickQuestion,
  explainConcept,
  getExamStrategy,
  getMotivation,
  rateMessage,
};
