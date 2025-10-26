/**
 * Knowledge Check System for TCO Prerequisites Assessment
 * Validates foundational knowledge and recommends appropriate learning paths
 */

export interface KnowledgeQuestion {
  id: string;
  category: 'networking' | 'security' | 'systems' | 'basic-it' | 'enterprise';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  weight: number; // Importance for path determination (1-5)
}

export interface AssessmentResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  categoryScores: Record<string, { score: number; total: number; percentage: number }>;
  recommendedPath: LearningPath;
  strengths: string[];
  weaknesses: string[];
  nextSteps: string[];
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'absolute-beginner' | 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  outcomes: string[];
  confidence: number; // 0-100 confidence in recommendation
}

export const KNOWLEDGE_QUESTIONS: KnowledgeQuestion[] = [
  // Basic IT Questions (Foundation Level)
  {
    id: 'basic-it-1',
    category: 'basic-it',
    question: 'What is an operating system?',
    options: [
      'A software that manages computer hardware and software resources',
      'A type of computer virus',
      'A network cable',
      'A programming language'
    ],
    correctAnswer: 0,
    explanation: 'An operating system (OS) is the fundamental software that manages all hardware and software resources on a computer, providing services for computer programs.',
    difficulty: 'beginner',
    weight: 3
  },
  {
    id: 'basic-it-2',
    category: 'basic-it',
    question: 'What does IP address stand for?',
    options: [
      'Internet Protocol address',
      'Internal Program address',
      'Information Processing address',
      'Integrated Platform address'
    ],
    correctAnswer: 0,
    explanation: 'IP stands for Internet Protocol. An IP address is a unique identifier assigned to each device connected to a network that uses the Internet Protocol for communication.',
    difficulty: 'beginner',
    weight: 4
  },
  {
    id: 'basic-it-3',
    category: 'basic-it',
    question: 'What is malware?',
    options: [
      'Malicious software designed to damage or disrupt computer systems',
      'A type of computer hardware',
      'Software that improves computer performance',
      'A network monitoring tool'
    ],
    correctAnswer: 0,
    explanation: 'Malware is short for "malicious software" - any software intentionally designed to cause damage to computers, servers, clients, or computer networks.',
    difficulty: 'beginner',
    weight: 4
  },

  // Networking Questions
  {
    id: 'networking-1',
    category: 'networking',
    question: 'What is a computer network?',
    options: [
      'A collection of interconnected devices that can communicate and share resources',
      'A single powerful computer',
      'A type of software program',
      'A security protocol'
    ],
    correctAnswer: 0,
    explanation: 'A computer network is a group of interconnected devices (computers, servers, etc.) that can communicate with each other and share resources like files, printers, and internet connections.',
    difficulty: 'beginner',
    weight: 5
  },
  {
    id: 'networking-2',
    category: 'networking',
    question: 'What is the difference between a LAN and WAN?',
    options: [
      'LAN covers a small area (like a building), WAN covers a large area (like multiple cities)',
      'LAN is faster, WAN is slower',
      'LAN is for security, WAN is for performance',
      'There is no difference'
    ],
    correctAnswer: 0,
    explanation: 'LAN (Local Area Network) covers a small geographical area like a building or campus, while WAN (Wide Area Network) spans large geographical areas, potentially across countries.',
    difficulty: 'intermediate',
    weight: 3
  },

  // Security Questions
  {
    id: 'security-1',
    category: 'security',
    question: 'What is the primary purpose of cybersecurity?',
    options: [
      'To protect digital information, systems, and networks from threats',
      'To make computers run faster',
      'To create new software applications',
      'To design computer hardware'
    ],
    correctAnswer: 0,
    explanation: 'Cybersecurity focuses on protecting computers, networks, programs, and data from attack, damage, or unauthorized access.',
    difficulty: 'beginner',
    weight: 5
  },
  {
    id: 'security-2',
    category: 'security',
    question: 'What is a vulnerability in cybersecurity?',
    options: [
      'A weakness in a system that could be exploited by attackers',
      'A type of computer virus',
      'A network speed measurement',
      'A software license'
    ],
    correctAnswer: 0,
    explanation: 'A vulnerability is a weakness or flaw in a system, application, or network that could potentially be exploited by cybercriminals to gain unauthorized access or cause damage.',
    difficulty: 'intermediate',
    weight: 4
  },

  // Systems Administration Questions
  {
    id: 'systems-1',
    category: 'systems',
    question: 'What does IT infrastructure typically include?',
    options: [
      'Hardware, software, networks, and facilities that support IT services',
      'Only computer hardware',
      'Only software applications',
      'Only network cables'
    ],
    correctAnswer: 0,
    explanation: 'IT infrastructure encompasses all the hardware, software, networks, facilities, and related equipment and services required for the existence, operation, and management of an enterprise IT environment.',
    difficulty: 'intermediate',
    weight: 3
  },
  {
    id: 'systems-2',
    category: 'systems',
    question: 'What is system monitoring?',
    options: [
      'The process of tracking system performance, availability, and security',
      'Installing new software',
      'Backing up data',
      'Creating user accounts'
    ],
    correctAnswer: 0,
    explanation: 'System monitoring involves continuously tracking the performance, availability, and security status of computer systems and networks to ensure optimal operation.',
    difficulty: 'intermediate',
    weight: 4
  },

  // Enterprise Questions
  {
    id: 'enterprise-1',
    category: 'enterprise',
    question: 'What characterizes an enterprise environment?',
    options: [
      'Large scale operations with hundreds or thousands of devices and users',
      'A single computer setup',
      'Home office networks',
      'Gaming computer systems'
    ],
    correctAnswer: 0,
    explanation: 'Enterprise environments are characterized by large-scale operations involving hundreds to thousands of devices, users, and complex infrastructure requiring professional management.',
    difficulty: 'intermediate',
    weight: 4
  },
  {
    id: 'enterprise-2',
    category: 'enterprise',
    question: 'Why is endpoint management important in enterprises?',
    options: [
      'To maintain security, compliance, and operational efficiency across all devices',
      'To make computers run faster',
      'To reduce electricity costs',
      'To improve internet speed'
    ],
    correctAnswer: 0,
    explanation: 'Endpoint management is crucial for maintaining security, ensuring compliance with policies, deploying software updates, and maintaining operational efficiency across all devices in an organization.',
    difficulty: 'advanced',
    weight: 5
  }
];

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'absolute-beginner',
    name: 'Complete IT Fundamentals',
    description: 'Start from the very beginning with basic computer and networking concepts before approaching Tanium.',
    duration: '4-6 weeks',
    difficulty: 'absolute-beginner',
    prerequisites: ['Basic computer literacy', 'Willingness to learn'],
    outcomes: [
      'Understand basic IT terminology',
      'Grasp fundamental networking concepts',
      'Learn basic security principles',
      'Prepare for Tanium-specific training'
    ],
    confidence: 95
  },
  {
    id: 'beginner-foundation',
    name: 'IT Foundation + Tanium Basics',
    description: 'Build on basic IT knowledge while learning Tanium fundamentals.',
    duration: '3-4 weeks',
    difficulty: 'beginner',
    prerequisites: ['Basic understanding of computers and networks'],
    outcomes: [
      'Understand endpoint management concepts',
      'Learn Tanium platform basics',
      'Master fundamental operations',
      'Prepare for advanced features'
    ],
    confidence: 90
  },
  {
    id: 'intermediate-direct',
    name: 'Direct TCO Preparation',
    description: 'Jump directly into TCO certification topics with targeted study.',
    duration: '2-3 weeks',
    difficulty: 'intermediate',
    prerequisites: ['Solid IT foundation', 'Some enterprise experience'],
    outcomes: [
      'Master all TCO exam domains',
      'Complete hands-on lab exercises',
      'Pass practice exams consistently',
      'Achieve TCO certification'
    ],
    confidence: 85
  },
  {
    id: 'advanced-review',
    name: 'TCO Exam Review & Practice',
    description: 'Final preparation with practice exams and advanced scenarios.',
    duration: '1-2 weeks',
    difficulty: 'advanced',
    prerequisites: ['Strong enterprise IT background', 'Tanium experience'],
    outcomes: [
      'Perfect exam technique',
      'Master complex scenarios',
      'Achieve high confidence',
      'Excel in certification'
    ],
    confidence: 95
  }
];

export class KnowledgeAssessment {
  private questions: KnowledgeQuestion[];
  private results: Map<string, number> = new Map();

  constructor(customQuestions?: KnowledgeQuestion[]) {
    this.questions = customQuestions || KNOWLEDGE_QUESTIONS;
  }

  /**
   * Get a subset of questions for assessment
   */
  getAssessmentQuestions(count: number = 10): KnowledgeQuestion[] {
    // Ensure representation from all categories
    const categoriesNeeded = ['basic-it', 'networking', 'security', 'systems', 'enterprise'];
    const questionsPerCategory = Math.ceil(count / categoriesNeeded.length);
    const selectedQuestions: KnowledgeQuestion[] = [];

    categoriesNeeded.forEach(category => {
      const categoryQuestions = this.questions
        .filter(q => q.category === category)
        .sort(() => Math.random() - 0.5) // Shuffle
        .slice(0, questionsPerCategory);
      
      selectedQuestions.push(...categoryQuestions);
    });

    return selectedQuestions.slice(0, count);
  }

  /**
   * Record an answer and return immediate feedback
   */
  recordAnswer(questionId: string, answerIndex: number): { correct: boolean; explanation: string } {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error(`Question ${questionId} not found`);
    }

    const isCorrect = question.correctAnswer === answerIndex;
    const score = isCorrect ? question.weight : 0;
    this.results.set(questionId, score);

    return {
      correct: isCorrect,
      explanation: question.explanation
    };
  }

  /**
   * Calculate final assessment results and recommend learning path
   */
  calculateResults(questionsUsed: KnowledgeQuestion[]): AssessmentResult {
    const categoryScores: Record<string, { score: number; total: number; percentage: number }> = {};
    let totalScore = 0;
    let maxScore = 0;

    // Calculate category scores
    questionsUsed.forEach(question => {
      const {category} = question;
      const questionScore = this.results.get(question.id) || 0;
      const maxQuestionScore = question.weight;

      if (!categoryScores[category]) {
        categoryScores[category] = { score: 0, total: 0, percentage: 0 };
      }

      categoryScores[category].score += questionScore;
      categoryScores[category].total += maxQuestionScore;
      totalScore += questionScore;
      maxScore += maxQuestionScore;
    });

    // Calculate percentages
    Object.keys(categoryScores).forEach(category => {
      const categoryData = categoryScores[category];
      categoryData.percentage = categoryData.total > 0 
        ? Math.round((categoryData.score / categoryData.total) * 100)
        : 0;
    });

    const overallPercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Determine recommended path
    const recommendedPath = this.determineRecommendedPath(overallPercentage, categoryScores);

    // Identify strengths and weaknesses
    const { strengths, weaknesses } = this.analyzePerformance(categoryScores);

    // Generate next steps
    const nextSteps = this.generateNextSteps(recommendedPath, weaknesses);

    return {
      totalScore,
      maxScore,
      percentage: overallPercentage,
      categoryScores,
      recommendedPath,
      strengths,
      weaknesses,
      nextSteps
    };
  }

  private determineRecommendedPath(
    overallPercentage: number, 
    categoryScores: Record<string, { score: number; total: number; percentage: number }>
  ): LearningPath {
    const basicItScore = categoryScores['basic-it']?.percentage || 0;
    const networkingScore = categoryScores['networking']?.percentage || 0;
    const securityScore = categoryScores['security']?.percentage || 0;

    // Absolute beginner: Struggling with basic IT concepts
    if (basicItScore < 60 || overallPercentage < 40) {
      return LEARNING_PATHS.find(p => p.id === 'absolute-beginner')!;
    }

    // Beginner foundation: Decent basics but weak in specialized areas
    if (overallPercentage < 65 || networkingScore < 50 || securityScore < 50) {
      return LEARNING_PATHS.find(p => p.id === 'beginner-foundation')!;
    }

    // Intermediate: Good foundation, ready for direct TCO prep
    if (overallPercentage < 85) {
      return LEARNING_PATHS.find(p => p.id === 'intermediate-direct')!;
    }

    // Advanced: Strong performance, just needs exam practice
    return LEARNING_PATHS.find(p => p.id === 'advanced-review')!;
  }

  private analyzePerformance(categoryScores: Record<string, { score: number; total: number; percentage: number }>): 
    { strengths: string[]; weaknesses: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    const categoryNames: Record<string, string> = {
      'basic-it': 'Basic IT Concepts',
      'networking': 'Networking Fundamentals',
      'security': 'Security Principles',
      'systems': 'Systems Administration',
      'enterprise': 'Enterprise Operations'
    };

    Object.entries(categoryScores).forEach(([category, scores]) => {
      const categoryName = categoryNames[category] || category;
      
      if (scores.percentage >= 70) {
        strengths.push(categoryName);
      } else if (scores.percentage < 50) {
        weaknesses.push(categoryName);
      }
    });

    return { strengths, weaknesses };
  }

  private generateNextSteps(recommendedPath: LearningPath, weaknesses: string[]): string[] {
    const nextSteps: string[] = [];

    // Add path-specific recommendations
    nextSteps.push(`Follow the "${recommendedPath.name}" learning path`);

    if (recommendedPath.id === 'absolute-beginner') {
      nextSteps.push('Start with the "What is Tanium?" foundation module');
      nextSteps.push('Complete basic IT terminology review');
      nextSteps.push('Practice with guided tutorials');
    } else if (recommendedPath.id === 'beginner-foundation') {
      nextSteps.push('Review endpoint management concepts');
      nextSteps.push('Complete hands-on lab exercises');
      nextSteps.push('Study Tanium platform overview');
    } else if (recommendedPath.id === 'intermediate-direct') {
      nextSteps.push('Begin TCO domain-specific study modules');
      nextSteps.push('Practice with mock exams');
      nextSteps.push('Focus on hands-on lab scenarios');
    } else {
      nextSteps.push('Take full-length practice exams');
      nextSteps.push('Review advanced scenarios');
      nextSteps.push('Schedule your TCO certification exam');
    }

    // Add weakness-specific recommendations
    if (weaknesses.includes('Basic IT Concepts')) {
      nextSteps.push('Review fundamental computing concepts');
    }
    if (weaknesses.includes('Networking Fundamentals')) {
      nextSteps.push('Study networking basics and protocols');
    }
    if (weaknesses.includes('Security Principles')) {
      nextSteps.push('Learn cybersecurity fundamentals');
    }

    return nextSteps;
  }

  /**
   * Reset assessment for retaking
   */
  reset(): void {
    this.results.clear();
  }
}