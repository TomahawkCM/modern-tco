'use client';

/**
 * AI Tutor Chat Interface
 *
 * Interactive chat component for 24/7 AI tutoring support.
 * Features context-aware conversations, suggested follow-ups, and resource recommendations.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, ThumbsUp, ThumbsDown, Sparkles, Book, Video, TestTube, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import {
  sendMessage,
  createConversation,
  getConversationMessages,
  rateMessage,
  type Message,
  type Conversation,
  type TutorContext,
  type TutorResponse,
} from '@/lib/ai/aiTutor';

interface AITutorChatProps {
  userId: string;
  conversationId?: string;
  conversationType?: Conversation['conversationType'];
  context?: TutorContext;
  onClose?: () => void;
}

export function AITutorChat({
  userId,
  conversationId: initialConversationId,
  conversationType = 'general_help',
  context,
  onClose,
}: AITutorChatProps) {
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);
  const [relatedResources, setRelatedResources] = useState<TutorResponse['relatedResources']>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize conversation
  useEffect(() => {
    async function initialize() {
      setIsInitializing(true);
      try {
        if (conversationId) {
          // Load existing conversation
          const msgs = await getConversationMessages(conversationId);
          setMessages(msgs);
        } else {
          // Create new conversation
          const conv = await createConversation(userId, conversationType, context);
          setConversationId(conv.id);

          // Add welcome message
          const welcomeMessage: Message = {
            id: 'welcome',
            conversationId: conv.id,
            role: 'assistant',
            content: getWelcomeMessage(conversationType),
            createdAt: new Date(),
          };
          setMessages([welcomeMessage]);
          setSuggestedFollowUps(getInitialSuggestions(conversationType, context));
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize AI tutor. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsInitializing(false);
      }
    }

    initialize();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message handler
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Optimistically add user message
    const optimisticUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      role: 'user',
      content: userMessage,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);

    try {
      const response = await sendMessage(conversationId, userId, userMessage, context);

      // Update messages with actual server response
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticUserMsg.id),
        optimisticUserMsg, // Keep user message with temp ID
        response.message,
      ]);

      // Update suggested follow-ups and resources
      if (response.suggestedFollowUps) {
        setSuggestedFollowUps(response.suggestedFollowUps);
      }
      if (response.relatedResources) {
        setRelatedResources(response.relatedResources);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUserMsg.id));
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Send suggested question
  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    textareaRef.current?.focus();
  };

  // Rate message
  const handleRateMessage = async (messageId: string, wasHelpful: boolean) => {
    try {
      await rateMessage(messageId, userId, wasHelpful);
      toast({
        title: 'Thanks for your feedback!',
        description: 'Your input helps us improve the AI tutor.',
      });
    } catch (error) {
      console.error('Error rating message:', error);
    }
  };

  if (isInitializing) {
    return (
      <Card className="flex flex-col h-full p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold">AI Tutor</h2>
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-500" />
          <div>
            <h2 className="text-lg font-semibold">AI Tutor</h2>
            <p className="text-sm text-muted-foreground">
              {conversationType === 'general_help' && 'Ask me anything about Tanium TCO'}
              {conversationType === 'concept_explanation' && 'Let me explain complex concepts'}
              {conversationType === 'exam_strategy' && 'Get exam preparation guidance'}
              {conversationType === 'troubleshooting' && 'Work through problems together'}
              {conversationType === 'study_planning' && 'Plan your study schedule'}
              {conversationType === 'motivation' && 'Stay motivated and on track'}
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-muted'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>

              {/* Message metadata for assistant */}
              {message.role === 'assistant' && message.id !== 'welcome' && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">Was this helpful?</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => handleRateMessage(message.id, true)}
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => handleRateMessage(message.id, false)}
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-4 max-w-[80%]">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Follow-ups */}
      {suggestedFollowUps.length > 0 && !isLoading && (
        <div className="px-4 py-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedFollowUps.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedQuestion(suggestion)}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Related Resources */}
      {relatedResources && relatedResources.length > 0 && (
        <div className="px-4 py-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Related resources:</p>
          <div className="flex flex-wrap gap-2">
            {relatedResources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                {resource.type === 'module' && <Book className="w-3 h-3" />}
                {resource.type === 'video' && <Video className="w-3 h-3" />}
                {resource.type === 'lab' && <TestTube className="w-3 h-3" />}
                {resource.type === 'practice' && <FileText className="w-3 h-3" />}
                {resource.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about Tanium TCO..."
            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </Card>
  );
}

// ==================== HELPER FUNCTIONS ====================

function getWelcomeMessage(type: Conversation['conversationType']): string {
  const messages = {
    general_help: "Hi! I'm your AI tutor for the Tanium TCO certification. I'm here to help you understand concepts, practice skills, and prepare for your exam. What would you like to learn about today?",
    concept_explanation: "Hi! I specialize in breaking down complex Tanium concepts into simple, easy-to-understand explanations. What concept would you like me to explain?",
    exam_strategy: "Hi! I'm here to help you develop a winning exam strategy for the TCO certification. Whether it's time management, question approach, or last-minute tips, I've got you covered. What's on your mind?",
    troubleshooting: "Hi! Let's work through any Tanium problems or challenges you're facing. I'll guide you step-by-step to understand not just the solution, but the underlying concepts. What are you working on?",
    study_planning: "Hi! I'll help you create a personalized study plan that fits your schedule and learning goals. Let's build a path to TCO certification success together. Tell me about your target exam date and available study time.",
    motivation: "Hi! I'm here to support you on your TCO certification journey. Whether you're facing challenges, feeling overwhelmed, or just need encouragement, I'm here to help. What's going on?",
  };

  return messages[type] || messages.general_help;
}

function getInitialSuggestions(type: Conversation['conversationType'], context?: TutorContext): string[] {
  const suggestions: Record<Conversation['conversationType'], string[]> = {
    general_help: [
      'What is the TCO exam structure?',
      'What are the 5 main exam domains?',
      'How should I start my TCO prep?',
    ],
    concept_explanation: [
      'Explain Tanium\'s Linear Chain Architecture',
      'What are sensors in Tanium?',
      'How does question targeting work?',
    ],
    exam_strategy: [
      'How should I manage my time during the exam?',
      'What are common TCO exam mistakes?',
      'Last-minute exam preparation tips',
    ],
    troubleshooting: [
      'I\'m struggling with targeting and filters',
      'I don\'t understand computer groups',
      'Help me with package deployment',
    ],
    study_planning: [
      'Create a 4-week study plan for me',
      'Which domains should I prioritize?',
      'How many practice questions should I do?',
    ],
    motivation: [
      'I feel overwhelmed by the content',
      'I keep failing practice exams',
      'I\'m worried about exam readiness',
    ],
  };

  // Add context-specific suggestions
  const baseSuggestions = suggestions[type] || suggestions.general_help;

  if (context?.currentDomain) {
    baseSuggestions.unshift(`Help me with ${context.currentDomain.replace(/_/g, ' ')}`);
  }

  return baseSuggestions;
}

export default AITutorChat;
