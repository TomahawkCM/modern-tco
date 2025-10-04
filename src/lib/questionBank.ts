/**
 * Question Bank System for Active Recall
 *
 * Provides targeted questions during review sessions based on:
 * - Micro-section content
 * - Student difficulty level
 * - Question format variety
 */

export interface Question {
  id: string;
  moduleId: string;
  sectionId: string;
  concept: string;

  // Question content
  question: string;
  type: "multiple-choice" | "true-false" | "fill-blank";

  // Multiple choice specific
  options?: string[];
  correctAnswer: string;

  // Metadata
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  tags?: string[];
}

export interface QuestionSet {
  moduleId: string;
  sectionId: string;
  concept: string;
  questions: Question[];
}

/**
 * Get questions for a review item
 * Selects questions based on difficulty level and concept
 */
export function getQuestionsForReview(
  moduleId: string,
  sectionId: string,
  concept: string,
  difficulty: "easy" | "medium" | "hard" = "medium",
  count: number = 3
): Question[] {
  const allQuestions = getQuestionBank();

  // Filter questions for this concept
  let conceptQuestions = allQuestions.filter(
    q => q.moduleId === moduleId &&
         q.sectionId === sectionId &&
         q.concept === concept
  );

  // If no exact matches, try just module and concept
  if (conceptQuestions.length === 0) {
    conceptQuestions = allQuestions.filter(
      q => q.moduleId === moduleId && q.concept === concept
    );
  }

  // If still no matches, try just module
  if (conceptQuestions.length === 0) {
    conceptQuestions = allQuestions.filter(q => q.moduleId === moduleId);
  }

  // Prioritize questions matching difficulty level
  const matchingDifficulty = conceptQuestions.filter(q => q.difficulty === difficulty);
  const otherQuestions = conceptQuestions.filter(q => q.difficulty !== difficulty);

  // Shuffle and combine
  const shuffled = [
    ...shuffle(matchingDifficulty),
    ...shuffle(otherQuestions)
  ];

  return shuffled.slice(0, count);
}

/**
 * Get random question for a concept
 */
export function getRandomQuestion(
  moduleId: string,
  concept: string
): Question | null {
  const questions = getQuestionsForReview(moduleId, "", concept, "medium", 1);
  return questions.length > 0 ? questions[0] : null;
}

/**
 * Shuffle array
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get question bank (initially from localStorage, later from API/database)
 */
export function getQuestionBank(): Question[] {
  if (typeof window === "undefined") return getDefaultQuestions();

  const stored = localStorage.getItem("question-bank");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return getDefaultQuestions();
    }
  }

  return getDefaultQuestions();
}

/**
 * Save question bank to localStorage
 */
export function saveQuestionBank(questions: Question[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("question-bank", JSON.stringify(questions));
}

/**
 * Add questions to the bank
 */
export function addQuestions(questions: Question[]): void {
  const existing = getQuestionBank();
  const combined = [...existing, ...questions];

  // Remove duplicates by ID
  const unique = combined.filter(
    (q, index, self) => index === self.findIndex(t => t.id === q.id)
  );

  saveQuestionBank(unique);
}

/**
 * Import questions from old app format
 */
export function importLegacyQuestions(legacyQuestions: any[]): Question[] {
  return legacyQuestions.map((lq, index) => ({
    id: lq.id || `legacy-${index}`,
    moduleId: mapLegacyDomain(lq.domain || lq.category),
    sectionId: lq.section || "",
    concept: lq.concept || lq.topic || "General",
    question: lq.question || lq.text,
    type: lq.type === "tf" ? "true-false" : "multiple-choice",
    options: lq.options || lq.choices,
    correctAnswer: lq.correctAnswer || lq.answer,
    explanation: lq.explanation || lq.rationale || "",
    difficulty: mapLegacyDifficulty(lq.difficulty),
    tags: lq.tags || [],
  }));
}

/**
 * Map legacy domain names to new module IDs
 */
function mapLegacyDomain(domain: string): string {
  const mapping: Record<string, string> = {
    "foundation": "platform-foundation",
    "asking": "asking-questions",
    "refining": "refining-questions",
    "action": "taking-action",
    "troubleshooting": "troubleshooting",
    "advanced": "advanced-topics",
  };

  const normalized = domain.toLowerCase().replace(/\s+/g, "-");
  return mapping[normalized] || normalized;
}

/**
 * Map legacy difficulty to new format
 */
function mapLegacyDifficulty(difficulty?: string | number): "easy" | "medium" | "hard" {
  if (!difficulty) return "medium";

  if (typeof difficulty === "number") {
    if (difficulty <= 1) return "easy";
    if (difficulty >= 3) return "hard";
    return "medium";
  }

  const normalized = difficulty.toLowerCase();
  if (normalized.includes("easy") || normalized.includes("beginner")) return "easy";
  if (normalized.includes("hard") || normalized.includes("advanced")) return "hard";
  return "medium";
}

/**
 * Default question set for Tanium Platform Foundation
 * These are high-quality questions for the core concepts
 */
function getDefaultQuestions(): Question[] {
  return [
    // Platform Foundation - Linear Chain Architecture
    {
      id: "pf-lc-1",
      moduleId: "platform-foundation",
      sectionId: "linear-chain",
      concept: "Linear Chain Architecture",
      question: "What is the primary advantage of Tanium's linear chain architecture?",
      type: "multiple-choice",
      options: [
        "It uses less disk space than traditional solutions",
        "It scales to query thousands of endpoints in seconds with minimal server load",
        "It requires no network connectivity",
        "It automatically updates all software"
      ],
      correctAnswer: "It scales to query thousands of endpoints in seconds with minimal server load",
      explanation: "The linear chain architecture allows Tanium to scale exponentially by using each endpoint as a relay point, enabling rapid queries across massive environments without overwhelming the server.",
      difficulty: "easy",
      tags: ["architecture", "scalability"]
    },
    {
      id: "pf-lc-2",
      moduleId: "platform-foundation",
      sectionId: "linear-chain",
      concept: "Linear Chain Architecture",
      question: "How does Tanium's linear chain reduce server load?",
      type: "multiple-choice",
      options: [
        "By caching all endpoint data on the server",
        "By using each endpoint as a relay point to forward queries",
        "By only querying a sample of endpoints",
        "By querying endpoints only during off-peak hours"
      ],
      correctAnswer: "By using each endpoint as a relay point to forward queries",
      explanation: "Each endpoint receives a query, executes it locally, returns results, and forwards the query to other endpoints. This creates an exponential pattern that dramatically reduces server load.",
      difficulty: "medium",
      tags: ["architecture", "efficiency"]
    },
    {
      id: "pf-lc-3",
      moduleId: "platform-foundation",
      sectionId: "linear-chain",
      concept: "Query Performance",
      question: "True or False: Tanium can query 15,000 endpoints in approximately 15 seconds.",
      type: "true-false",
      correctAnswer: "True",
      explanation: "This is one of Tanium's key performance advantages. The linear chain architecture enables querying 15,000 endpoints in about 15 seconds, compared to hours with traditional tools.",
      difficulty: "easy",
      tags: ["performance", "speed"]
    },
    {
      id: "pf-lc-4",
      moduleId: "platform-foundation",
      sectionId: "linear-chain",
      concept: "Architecture Benefits",
      question: "What does Tanium's linear chain architecture eliminate the need for?",
      type: "multiple-choice",
      options: [
        "Network firewalls",
        "Endpoint agents",
        "Centralized data warehouses",
        "Administrator accounts"
      ],
      correctAnswer: "Centralized data warehouses",
      explanation: "Because Tanium queries endpoints in real-time and doesn't rely on pre-collected data, it eliminates the need for massive centralized data warehouses. Data is always current and retrieved on-demand.",
      difficulty: "medium",
      tags: ["architecture", "benefits"]
    },
    {
      id: "pf-lc-5",
      moduleId: "platform-foundation",
      sectionId: "linear-chain",
      concept: "Endpoint Role",
      question: "In Tanium's linear chain, each endpoint acts as:",
      type: "multiple-choice",
      options: [
        "A passive data repository only",
        "An active relay point forwarding queries",
        "A backup server in case the main server fails",
        "A data aggregation point for nearby endpoints"
      ],
      correctAnswer: "An active relay point forwarding queries",
      explanation: "Each endpoint is an active participant that receives queries, executes them locally, and forwards them to other endpoints it knows about, creating the linear chain effect.",
      difficulty: "hard",
      tags: ["architecture", "endpoints"]
    },

    // Asking Questions - Natural Language
    {
      id: "aq-nl-1",
      moduleId: "asking-questions",
      sectionId: "natural-language",
      concept: "Query Syntax",
      question: "What is the basic format of a Tanium natural language query?",
      type: "multiple-choice",
      options: [
        "SELECT [data] FROM [endpoints] WHERE [condition]",
        "Get [sensor] from [targets] where [filters]",
        "QUERY [endpoints] FOR [data] IF [condition]",
        "FIND [data] ON [machines] WITH [criteria]"
      ],
      correctAnswer: "Get [sensor] from [targets] where [filters]",
      explanation: "Tanium uses a natural language format: 'Get [sensor] from [targets] where [filters]'. For example: 'Get Computer Name from all machines'.",
      difficulty: "easy",
      tags: ["query", "syntax"]
    },
    {
      id: "aq-nl-2",
      moduleId: "asking-questions",
      sectionId: "natural-language",
      concept: "Sensors",
      question: "What is a Tanium sensor?",
      type: "multiple-choice",
      options: [
        "A hardware device attached to endpoints",
        "A script that retrieves specific data from endpoints",
        "A network monitoring tool",
        "A type of firewall rule"
      ],
      correctAnswer: "A script that retrieves specific data from endpoints",
      explanation: "A Tanium sensor is a script (written in various languages) that executes on endpoints to retrieve specific information like Computer Name, IP Address, or Installed Applications.",
      difficulty: "medium",
      tags: ["sensors", "concepts"]
    },
    {
      id: "aq-nl-3",
      moduleId: "asking-questions",
      sectionId: "natural-language",
      concept: "Question Construction",
      question: "True or False: Tanium questions can combine multiple sensors in a single query.",
      type: "true-false",
      correctAnswer: "True",
      explanation: "Tanium questions can combine multiple sensors. For example: 'Get Computer Name and IP Address and Operating System from all machines'.",
      difficulty: "easy",
      tags: ["query", "sensors"]
    },
    {
      id: "aq-nl-4",
      moduleId: "asking-questions",
      sectionId: "natural-language",
      concept: "Filters",
      question: "What does the 'from' clause in a Tanium question specify?",
      type: "multiple-choice",
      options: [
        "The time range for historical data",
        "Which endpoints to query (target selection)",
        "The output format for results",
        "The administrator running the query"
      ],
      correctAnswer: "Which endpoints to query (target selection)",
      explanation: "The 'from' clause specifies which endpoints to query. You can use 'all machines' or filter to specific groups like 'from Windows machines' or 'from machines with IP Address contains 192.168'.",
      difficulty: "medium",
      tags: ["targeting", "filters"]
    },
    {
      id: "aq-nl-5",
      moduleId: "asking-questions",
      sectionId: "natural-language",
      concept: "Filters",
      question: "Which of the following is a valid Tanium filter operator?",
      type: "multiple-choice",
      options: [
        "equals",
        "contains",
        "starts with",
        "All of the above"
      ],
      correctAnswer: "All of the above",
      explanation: "Tanium supports multiple filter operators including 'equals', 'contains', 'starts with', 'ends with', 'does not equal', 'does not contain', and more.",
      difficulty: "hard",
      tags: ["filters", "operators"]
    },

    // Taking Action
    {
      id: "ta-pkg-1",
      moduleId: "taking-action",
      sectionId: "packages",
      concept: "Tanium Packages",
      question: "What is a Tanium package?",
      type: "multiple-choice",
      options: [
        "A compressed file containing Tanium software updates",
        "A script or command that performs actions on endpoints",
        "A data storage container for query results",
        "A network packet sent between endpoints"
      ],
      correctAnswer: "A script or command that performs actions on endpoints",
      explanation: "A Tanium package is a script or command that performs remediation actions on endpoints, such as installing software, modifying registry keys, or running cleanup scripts.",
      difficulty: "easy",
      tags: ["packages", "actions"]
    },
    {
      id: "ta-pkg-2",
      moduleId: "taking-action",
      sectionId: "packages",
      concept: "Package Deployment",
      question: "True or False: Tanium packages can be deployed to specific endpoints based on question results.",
      type: "true-false",
      correctAnswer: "True",
      explanation: "Tanium's Deploy Action feature allows you to target packages to specific endpoints based on question results, ensuring remediation actions reach only the systems that need them.",
      difficulty: "medium",
      tags: ["deployment", "targeting"]
    },
    {
      id: "ta-pkg-3",
      moduleId: "taking-action",
      sectionId: "packages",
      concept: "Action Scheduling",
      question: "Which deployment method executes a package immediately on all targeted endpoints?",
      type: "multiple-choice",
      options: [
        "Scheduled Deployment",
        "Maintenance Window",
        "Deploy Action Now",
        "Patch Management"
      ],
      correctAnswer: "Deploy Action Now",
      explanation: "'Deploy Action Now' executes the package immediately on all targeted endpoints using the linear chain for rapid deployment.",
      difficulty: "medium",
      tags: ["deployment", "scheduling"]
    },

    // Troubleshooting
    {
      id: "ts-dbg-1",
      moduleId: "troubleshooting",
      sectionId: "debugging",
      concept: "Question Debugging",
      question: "What is the first step when a Tanium question returns no results?",
      type: "multiple-choice",
      options: [
        "Restart the Tanium Server",
        "Check if the target filter is too restrictive",
        "Reinstall the Tanium Client on all endpoints",
        "Contact Tanium support immediately"
      ],
      correctAnswer: "Check if the target filter is too restrictive",
      explanation: "The most common reason for no results is overly restrictive targeting. Always verify your 'from' clause and filters first before assuming there's a technical issue.",
      difficulty: "easy",
      tags: ["troubleshooting", "debugging"]
    },
    {
      id: "ts-dbg-2",
      moduleId: "troubleshooting",
      sectionId: "debugging",
      concept: "Client Connectivity",
      question: "True or False: If an endpoint doesn't appear in Tanium results, it means the Tanium Client is not running or cannot communicate with the server.",
      type: "true-false",
      correctAnswer: "True",
      explanation: "Endpoints must have a running Tanium Client that can communicate with the Tanium Server (directly or via other endpoints in the linear chain) to appear in results.",
      difficulty: "easy",
      tags: ["connectivity", "client"]
    },
  ];
}

/**
 * Get all questions for a specific section
 */
export function getQuestionsForSection(
  moduleId: string,
  sectionId: string
): Question[] {
  const allQuestions = getQuestionBank();
  return allQuestions.filter(
    q => q.moduleId === moduleId && q.sectionId === sectionId
  );
}

/**
 * Get all available sections that have questions
 */
export function getAvailableSections(moduleId?: string): Array<{
  moduleId: string;
  sectionId: string;
  questionCount: number;
  concepts: string[];
}> {
  const allQuestions = getQuestionBank();
  const filtered = moduleId
    ? allQuestions.filter(q => q.moduleId === moduleId)
    : allQuestions;

  const sectionMap = new Map<string, {
    moduleId: string;
    sectionId: string;
    questions: Question[];
  }>();

  filtered.forEach(q => {
    const key = `${q.moduleId}::${q.sectionId}`;
    if (!sectionMap.has(key)) {
      sectionMap.set(key, {
        moduleId: q.moduleId,
        sectionId: q.sectionId,
        questions: [],
      });
    }
    sectionMap.get(key)!.questions.push(q);
  });

  return Array.from(sectionMap.values()).map(section => {
    const concepts = Array.from(
      new Set(section.questions.map(q => q.concept))
    );
    return {
      moduleId: section.moduleId,
      sectionId: section.sectionId,
      questionCount: section.questions.length,
      concepts,
    };
  });
}

/**
 * Get question count for a specific section
 */
export function getSectionQuestionCount(
  moduleId: string,
  sectionId: string
): number {
  return getQuestionsForSection(moduleId, sectionId).length;
}

/**
 * Check if a section has questions available
 */
export function hasSectionQuestions(
  moduleId: string,
  sectionId: string
): boolean {
  return getSectionQuestionCount(moduleId, sectionId) > 0;
}

/**
 * Get question statistics
 */
export function getQuestionBankStats(): {
  totalQuestions: number;
  byModule: Record<string, number>;
  byDifficulty: Record<string, number>;
  byType: Record<string, number>;
} {
  const questions = getQuestionBank();

  const byModule: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  const byType: Record<string, number> = {};

  questions.forEach(q => {
    byModule[q.moduleId] = (byModule[q.moduleId] || 0) + 1;
    byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
    byType[q.type] = (byType[q.type] || 0) + 1;
  });

  return {
    totalQuestions: questions.length,
    byModule,
    byDifficulty,
    byType,
  };
}
