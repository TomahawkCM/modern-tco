"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Send, 
  Sparkles, 
  MessageCircle, 
  BookOpen, 
  Target, 
  Lightbulb,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'explanation' | 'practice' | 'quiz' | 'general';
}

interface AIAssistantProps {
  moduleSlug?: string;
  isOpen: boolean;
  onClose: () => void;
}

const quickActions = [
  {
    icon: BookOpen,
    label: 'Explain Concept',
    prompt: 'Can you explain this concept in simple terms?',
    type: 'explanation' as const
  },
  {
    icon: Target,
    label: 'Practice Questions',
    prompt: 'Give me practice questions on this topic',
    type: 'practice' as const
  },
  {
    icon: Lightbulb,
    label: 'Study Tips',
    prompt: 'What are the best ways to study this material?',
    type: 'general' as const
  },
  {
    icon: MessageCircle,
    label: 'Quiz Me',
    prompt: 'Create a quick quiz to test my knowledge',
    type: 'quiz' as const
  }
];

export default function AIAssistant({ moduleSlug, isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (content: string, type: Message['type'] = 'general') => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
      type
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simulate AI response - in real implementation, this would call your AI service
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const aiResponse = generateAIResponse(content, type, moduleSlug);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        type
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        type: 'general'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (userInput: string, type: Message['type'], moduleSlug?: string): string => {
    // This is a placeholder for demonstration. In a real implementation,
    // you would integrate with Claude API or another AI service
    
    const responses = {
      explanation: [
        "Let me break this down for you step by step...",
        "This concept is fundamental to Tanium operations. Here's how it works...",
        "Think of it this way - imagine you're managing thousands of endpoints..."
      ],
      practice: [
        "Great! Here are some practice questions to test your understanding:\n\n1. What is the primary purpose of computer groups in Tanium?\n2. How do dynamic groups differ from static groups?\n3. When would you use nested filter conditions?",
        "Let's practice with some scenario-based questions:\n\n1. You need to target Windows servers with missing security patches. What targeting approach would you use?\n2. A deployment failed on 50% of targets. What troubleshooting steps would you take?"
      ],
      quiz: [
        "Quick Quiz Time! 🎯\n\n1. (Multiple Choice) In Tanium, what happens when you create a dynamic computer group?\nA) It updates manually\nB) It updates automatically based on criteria\nC) It requires approval\nD) It expires after 24 hours\n\nThink about it and let me know your answer!",
        "Let's test your knowledge! 📚\n\nTrue or False: Saved questions in Tanium can be shared across different content sets.\n\nExplain your reasoning when you answer!"
      ],
      general: [
        "For studying TCO material effectively, I recommend the active recall method. Try explaining concepts out loud as if teaching someone else.",
        "Here are my top study tips for Tanium certification:\n\n1. Practice hands-on in a lab environment\n2. Focus on understanding workflows, not just memorizing\n3. Review official documentation regularly\n4. Join study groups or forums for discussion",
        "The key to mastering Tanium is understanding the relationships between different components. Start with the basics and build up complexity gradually."
      ]
    };

    const moduleSpecificResponses: Record<string, string[]> = {
      'asking-questions': [
        "For the Asking Questions module, focus on understanding natural language query construction and the sensor library. The key is knowing when to use which sensors and how to interpret results effectively."
      ],
      'refining-questions': [
        "Refining Questions & Targeting is crucial - it's 23% of the exam! Master the difference between dynamic and static computer groups, and practice complex filter logic with AND/OR/NOT operators."
      ],
      'taking-action': [
        "Taking Action focuses on safe deployment practices. Always remember the pilot-test-deploy workflow and know your rollback procedures. Package validation is critical."
      ],
      'navigation-modules': [
        "Platform navigation might seem basic, but efficient workflow management is essential for real-world operations. Know your keyboard shortcuts and module transitions."
      ],
      'reporting-export': [
        "For Reporting & Data Export, understand the different output formats and when to use each. Performance considerations become important with large datasets."
      ]
    };

    let responseArray = responses[type ?? 'general'] || responses.general;
    
    if (moduleSlug && moduleSpecificResponses[moduleSlug]) {
      responseArray = [...moduleSpecificResponses[moduleSlug], ...responseArray];
    }

    return responseArray[Math.floor(Math.random() * responseArray.length)];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(inputValue);
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    void sendMessage(action.prompt, action.type);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed bottom-4 right-4 h-[600px] w-[400px] md:w-[500px]">
        <Card className="h-full border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:border-cyan-800 dark:from-cyan-900/20 dark:to-cyan-800/20 backdrop-blur-md">
          <CardHeader className="pb-3 border-b border-cyan-200 dark:border-cyan-700/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-cyan-900 dark:text-cyan-100">
                <Brain className="h-5 w-5" />
                AI Study Assistant
                <Sparkles className="h-4 w-4 text-amber-500" />
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearMessages}
                  className="text-cyan-700 hover:text-cyan-900 dark:text-primary dark:hover:text-cyan-100"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-cyan-700 hover:text-cyan-900 dark:text-primary dark:hover:text-cyan-100"
                >
                  ×
                </Button>
              </div>
            </div>
            {moduleSlug && (
              <Badge variant="outline" className="w-fit border-cyan-300 bg-cyan-100 text-cyan-700 dark:border-cyan-600 dark:bg-cyan-900/30 dark:text-primary">
                {moduleSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            )}
          </CardHeader>

          <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-cyan-600 dark:text-primary" />
                  <h3 className="text-lg font-semibold text-cyan-900 dark:text-cyan-100 mb-2">
                    Welcome to your AI Study Assistant!
                  </h3>
                  <p className="text-cyan-700 dark:text-primary text-sm mb-4">
                    I'm here to help you master Tanium concepts. Ask me anything about the study material.
                  </p>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={action.label}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAction(action)}
                          className="flex items-center gap-2 border-cyan-300 text-cyan-700 hover:bg-cyan-100 dark:border-cyan-600 dark:text-primary dark:hover:bg-cyan-900/30"
                        >
                          <Icon className="h-4 w-4" />
                          {action.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                      message.sender === 'user'
                        ? 'bg-primary text-foreground dark:bg-cyan-500'
                        : 'bg-white/90 text-cyan-900 border border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-100 dark:border-cyan-700'
                    )}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/90 rounded-lg px-4 py-2 border border-cyan-200 dark:bg-cyan-950/50 dark:border-cyan-700">
                    <div className="flex items-center gap-2 text-cyan-700 dark:text-primary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI is thinking...
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-cyan-200 dark:border-cyan-700/50 p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything about Tanium..."
                  className="flex-1 bg-white/90 border-cyan-200 text-cyan-900 placeholder-cyan-600 dark:bg-cyan-950/50 dark:border-cyan-700 dark:text-cyan-100 dark:placeholder-cyan-400"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-primary hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-primary"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}