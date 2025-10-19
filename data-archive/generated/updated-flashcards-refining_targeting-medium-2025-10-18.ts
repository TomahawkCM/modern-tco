import type { CreateFlashcardLibraryCard } from "@/types/flashcard-library";

/**
 * Updated Flashcards - Spec Kit Compliant
 *
 * Domain: refining_targeting
 * Difficulty: medium
 * Count: 22 (removed 1 easy-difficulty card)
 * Updated: 2025-10-18
 * Transformation: Phase 5 methodology applied
 * Changes:
 *   - Removed card 6 (marked easy, belongs in beginner set)
 *   - Updated card 19 difficulty from hard → medium
 *   - All cards transformed to conversational tone
 *   - Added real-world analogies to all concept cards
 *   - Enhanced hints with practical context
 *   - Updated study guide refs to tco-study-path format
 *   - Organized into 6 clear categories
 *   - Added "Why this matters" context
 */

// ═══════════════════════════════════════════════════════════════════════════
// COMPUTER GROUPS (5 cards)
// ═══════════════════════════════════════════════════════════════════════════

export const computerGroupCards: CreateFlashcardLibraryCard[] = [
  {
    front: "What's the difference between Dynamic and Static computer groups?",
    back: "Think of them like music playlists! Dynamic groups are like smart playlists that auto-update based on rules you set (like 'all Windows 10 machines'). Static groups are like manual playlists where YOU add and remove computers yourself. Dynamic groups stay current automatically, static groups need your constant attention.",
    hint: "One updates itself automatically, the other needs manual updates. Think about Spotify smart playlists vs. manual playlists...",
    domain: "refining_targeting",
    category: "terminology",
    difficulty: "medium",
    tags: ["computer-groups", "dynamic-vs-static", "configuration", "group-management"],
    study_guide_ref: "tco-study-path/refining_targeting/computer-groups",
    source: "ai_generated"
  },
  {
    front: "What does computer group hierarchy mean in Tanium?",
    back: "It's like a family tree of computer groups! Groups higher up can override settings from groups below them. Think of it like company org charts - the CEO's decisions override everyone else's. This helps you organize computers by department, location, or function, and control which settings win when there's a conflict.",
    hint: "Think about organizational structure and who gets the final say...",
    domain: "refining_targeting",
    category: "terminology",
    difficulty: "medium",
    tags: ["group-hierarchy", "inheritance", "settings", "precedence"],
    study_guide_ref: "tco-study-path/refining_targeting/group-hierarchy",
    source: "ai_generated"
  },
  {
    front: "How do you create a dynamic computer group?",
    back: "You define RULES based on sensor data, and Tanium automatically keeps the group up to date! Example: 'All computers with Windows 10 AND less than 10GB free disk space.' As computers match (or stop matching) your rules, they automatically join or leave the group. It's like setting up a filter on Gmail - matching emails automatically go into the folder!",
    hint: "Think about setting up automatic rules that constantly check for matches...",
    domain: "refining_targeting",
    category: "best_practices",
    difficulty: "medium",
    tags: ["dynamic-computer-groups", "creation-process", "sensor-data", "automation"],
    study_guide_ref: "tco-study-path/refining_targeting/creating-groups",
    source: "ai_generated"
  },
  {
    front: "How should you organize your computer group hierarchy?",
    back: "Mirror your real organization! Put groups in a clear, logical structure that matches how your company is organized. Keep it simple - departments, locations, or functions work best. Think carefully about inheritance (parent groups passing settings down) so you don't create conflicts. Good structure = easier management and less confusion!",
    hint: "Think about your company's org chart and how settings should flow down...",
    domain: "refining_targeting",
    category: "best_practices",
    difficulty: "medium",
    tags: ["computer-group-hierarchy", "management-strategy", "inheritance", "organization"],
    study_guide_ref: "tco-study-path/refining_targeting/group-hierarchy",
    source: "ai_generated"
  },
  {
    front: "Why use dynamic computer groups instead of static ones?",
    back: "Three big wins: (1) They auto-update in real-time so membership is ALWAYS current, (2) You save tons of time not manually adding/removing computers, (3) You eliminate human error from forgetting to update groups. It's like having a self-cleaning house vs. cleaning it yourself every day - which would you choose?",
    hint: "Think about automation benefits - time saved, accuracy, and staying current...",
    domain: "refining_targeting",
    category: "exam_focused",
    difficulty: "medium",
    tags: ["dynamic-vs-static", "benefits", "group-management", "automation"],
    study_guide_ref: "tco-study-path/refining_targeting/computer-groups",
    source: "ai_generated"
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// FILTERING & BOOLEAN LOGIC (6 cards)
// ═══════════════════════════════════════════════════════════════════════════

export const filteringCards: CreateFlashcardLibraryCard[] = [
  {
    front: "How do you use advanced filtering to target specific computers?",
    back: "It's like using Amazon filters! You combine multiple criteria using Boolean logic (AND, OR, NOT) and sensor attributes. Example: 'Operating System = Windows 10 AND Free Disk Space < 10GB' targets only Windows 10 machines running low on space. Stack multiple conditions to get exactly the computers you need!",
    hint: "Think about combining multiple conditions like shopping filters on Amazon...",
    domain: "refining_targeting",
    category: "syntax",
    difficulty: "medium",
    tags: ["advanced-filtering", "boolean-logic", "question-builder", "targeting"],
    study_guide_ref: "tco-study-path/refining_targeting/advanced-filtering",
    source: "ai_generated"
  },
  {
    front: "How does Boolean logic work in Tanium filters?",
    back: "Think of it like cooking recipes! AND means you MUST have all ingredients (Windows 10 AND Low Disk Space = must have both). OR means any ingredient works (Windows OR Mac = either one's fine). NOT excludes ingredients (Windows NOT Windows 7 = all Windows except 7). Combine these to get exactly what you need!",
    hint: "AND = must have all, OR = any will do, NOT = exclude this...",
    domain: "refining_targeting",
    category: "syntax",
    difficulty: "medium",
    tags: ["boolean-logic", "filtering", "refinement", "operators"],
    study_guide_ref: "tco-study-path/refining_targeting/boolean-logic",
    source: "ai_generated"
  },
  {
    front: "Why use advanced filtering in your questions?",
    back: "To get laser-focused results! Instead of asking 50,000 computers and getting mostly irrelevant answers, you ask ONLY the 500 computers that actually matter. It's faster, more accurate, and way easier to analyze. Like using Google with specific search terms vs. just typing one word - you get much better results!",
    hint: "Think about precision and relevance of results...",
    domain: "refining_targeting",
    category: "best_practices",
    difficulty: "medium",
    tags: ["advanced-filtering", "accuracy", "query-results", "efficiency"],
    study_guide_ref: "tco-study-path/refining_targeting/advanced-filtering",
    source: "ai_generated"
  },
  {
    front: "How do you narrow down a question that's too broad?",
    back: "Three steps: (1) Add specific filters using sensor data, (2) Use Boolean logic (AND/OR/NOT) to combine criteria, (3) Limit scope to certain computer groups. It's like narrowing a job search - start broad ('all jobs'), then filter by location, salary, remote/office, experience level. Each filter makes results more relevant!",
    hint: "Add more filters one at a time to narrow your results...",
    domain: "refining_targeting",
    category: "best_practices",
    difficulty: "medium",
    tags: ["question-refinement", "filters", "boolean-logic", "targeting"],
    study_guide_ref: "tco-study-path/refining_targeting/refining-questions",
    source: "ai_generated"
  },
  {
    front: "How does Boolean logic affect question specificity?",
    back: "It's your precision tool! Using AND makes questions MORE specific (both conditions must be true). OR makes them BROADER (either condition works). NOT excludes stuff you don't want. The more conditions you combine, the more precise your targeting. It's the difference between 'find cars' vs. 'find red Toyota Camrys from 2020'.",
    hint: "More conditions = more precise targeting...",
    domain: "refining_targeting",
    category: "exam_focused",
    difficulty: "medium",
    tags: ["boolean-operators", "question-specificity", "query-precision", "targeting"],
    study_guide_ref: "tco-study-path/refining_targeting/boolean-logic",
    source: "ai_generated"
  },
  {
    front: "How can Boolean filters improve query performance?",
    back: "They reduce the work! By narrowing your target to only relevant computers, you're asking fewer machines and processing less data. It's like asking 'Who here is from California?' in a room of 100 vs. yelling it to 10,000 people - way faster and easier! Targeted questions = faster results = happy IT teams.",
    hint: "Think about reducing the amount of data to process...",
    domain: "refining_targeting",
    category: "troubleshooting",
    difficulty: "medium",
    tags: ["boolean-logic", "performance-impact", "efficient-query", "optimization"],
    study_guide_ref: "tco-study-path/refining_targeting/performance-tips",
    source: "ai_generated"
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT SCOPING & RBAC (5 cards)
// ═══════════════════════════════════════════════════════════════════════════

export const securityCards: CreateFlashcardLibraryCard[] = [
  {
    front: "What is content set scoping?",
    back: "It's like Netflix profiles for Tanium! Different users see different content based on their roles. Admins might see ALL sensors, packages, and saved questions, but Help Desk only sees basic troubleshooting tools. It ensures people only access the Tanium content they need for their job - nothing more, nothing less!",
    hint: "Think about different users seeing different content based on their role...",
    domain: "refining_targeting",
    category: "terminology",
    difficulty: "medium",
    tags: ["content-set-scoping", "access-control", "administration", "rbac"],
    study_guide_ref: "tco-study-path/refining_targeting/content-scoping",
    source: "ai_generated"
  },
  {
    front: "How does RBAC affect working with computer groups?",
    back: "RBAC (Role-Based Access Control) is like building access cards - your role determines which 'doors' you can open! Only users with proper permissions can create, edit, or delete computer groups. This prevents junior admins from accidentally breaking critical group configurations. Your role = your access level!",
    hint: "Think about permission levels controlling what you can change...",
    domain: "refining_targeting",
    category: "best_practices",
    difficulty: "medium",
    tags: ["RBAC", "computer-groups", "user-permissions", "security"],
    study_guide_ref: "tco-study-path/refining_targeting/rbac-groups",
    source: "ai_generated"
  },
  {
    front: "How does content scoping improve security?",
    back: "It follows the 'need to know' principle! By limiting what users can see and do based on their role, you reduce risk. Help Desk can't accidentally deploy patches meant for servers. Junior admins can't see sensitive security content. It's like giving different keys to different employees - the janitor doesn't need access to the CEO's office!",
    hint: "Think about limiting access to reduce risk and mistakes...",
    domain: "refining_targeting",
    category: "best_practices",
    difficulty: "medium",
    tags: ["content-set-scoping", "security-enhancement", "role-based-access", "risk-reduction"],
    study_guide_ref: "tco-study-path/refining_targeting/content-scoping",
    source: "ai_generated"
  },
  {
    front: "What's the main principle when assigning users to roles?",
    back: "Least privilege! Give users the MINIMUM permissions they need to do their job - nothing more. Help Desk needs basic troubleshooting tools, not full admin access. It's like restaurant access - servers need the kitchen door, but they don't need the safe combination. This reduces security risks and prevents accidental damage!",
    hint: "Think about giving minimum necessary permissions...",
    domain: "refining_targeting",
    category: "best_practices",
    difficulty: "medium",
    tags: ["role-assignment", "user-permissions", "least-privilege", "security"],
    study_guide_ref: "tco-study-path/refining_targeting/rbac-principles",
    source: "ai_generated"
  },
  {
    front: "Why is understanding RBAC important for computer groups?",
    back: "Because it keeps your environment secure and organized! RBAC ensures users only modify computer groups within their permission boundaries. Without understanding it, you might try creating groups you're not allowed to touch, or worse - give someone too much access and they break something critical. Know your boundaries = work efficiently + stay secure!",
    hint: "Think about security boundaries and operational safety...",
    domain: "refining_targeting",
    category: "exam_focused",
    difficulty: "medium",
    tags: ["RBAC", "computer-groups", "security", "permissions"],
    study_guide_ref: "tco-study-path/refining_targeting/rbac-groups",
    source: "ai_generated"
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// TROUBLESHOOTING (2 cards)
// ═══════════════════════════════════════════════════════════════════════════

export const troubleshootingCards: CreateFlashcardLibraryCard[] = [
  {
    front: "How do you troubleshoot endpoint targeting issues?",
    back: "Three-step checklist: (1) Check your targeting criteria - is it correct? (2) Verify endpoints are online and reporting to Tanium, (3) Make sure the sensors you're using are deployed and working on those endpoints. It's like troubleshooting 'why isn't my phone getting texts' - check your filters, check if phone's on, check if you have service!",
    hint: "Start with: criteria → endpoint status → sensor deployment...",
    domain: "refining_targeting",
    category: "troubleshooting",
    difficulty: "medium",
    tags: ["troubleshooting", "endpoint-targeting", "sensor-deployment", "diagnostics"],
    study_guide_ref: "tco-study-path/refining_targeting/troubleshooting",
    source: "ai_generated"
  },
  {
    front: "What if dynamic group memberships aren't updating?",
    back: "Check three things: (1) Are your group criteria defined correctly? (2) Are sensors reporting accurate data to Tanium? (3) Is the Tanium Server processing real-time data properly? It's like a smart home device not responding - check the rules, check the sensors, check the hub. Usually it's a sensor not reporting or criteria that's too narrow!",
    hint: "Check: group rules → sensor accuracy → server processing...",
    domain: "refining_targeting",
    category: "troubleshooting",
    difficulty: "medium",
    tags: ["dynamic-groups", "troubleshooting", "real-time-data", "diagnostics"],
    study_guide_ref: "tco-study-path/refining_targeting/troubleshooting",
    source: "ai_generated"
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// BEST PRACTICES (2 cards)
// ═══════════════════════════════════════════════════════════════════════════

export const bestPracticesCards: CreateFlashcardLibraryCard[] = [
  {
    front: "Why is accurate sensor deployment critical for targeting?",
    back: "Sensors are your eyes and ears! If you're missing sensors on computers, you can't target them properly. It's like trying to find all Toyota cars in a parking lot while blindfolded - you NEED to see to target accurately. Deploy sensors everywhere you need visibility, otherwise your questions and actions miss endpoints!",
    hint: "Think about needing visibility to target accurately...",
    domain: "refining_targeting",
    category: "best_practices",
    difficulty: "medium",
    tags: ["sensor-deployment", "endpoint-targeting", "accuracy", "visibility"],
    study_guide_ref: "tco-study-path/refining_targeting/sensor-strategy",
    source: "ai_generated"
  },
  {
    front: "What should you consider when organizing group hierarchy for policies?",
    back: "Four key factors: (1) Mirror your organizational structure (departments, locations), (2) Think about endpoint types (servers, workstations, VMs), (3) Consider operational needs (who manages what), (4) Plan for policy conflicts (what overrides what). It's like designing office seating - think about teams, functions, and how they interact!",
    hint: "Think about organization structure, endpoint types, and policy precedence...",
    domain: "refining_targeting",
    category: "best_practices",
    difficulty: "medium",
    tags: ["group-hierarchy", "policy-application", "organizational-structure", "planning"],
    study_guide_ref: "tco-study-path/refining_targeting/group-hierarchy",
    source: "ai_generated"
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// HIERARCHY & POLICY (1 card)
// ═══════════════════════════════════════════════════════════════════════════

export const hierarchyCards: CreateFlashcardLibraryCard[] = [
  {
    front: "How does group hierarchy affect policy application?",
    back: "It determines who wins in conflicts! Groups higher in the hierarchy override settings from lower groups. Think of it like military ranks - the General's orders override the Captain's orders. If your 'Finance Department' group says one thing and the higher-level 'All Computers' group says another, the higher group wins!",
    hint: "Think about which settings take precedence in conflicts...",
    domain: "refining_targeting",
    category: "exam_focused",
    difficulty: "medium",
    tags: ["group-hierarchy", "policy-application", "precedence", "conflicts"],
    study_guide_ref: "tco-study-path/refining_targeting/group-hierarchy",
    source: "ai_generated"
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// ADVANCED TARGETING (1 card)
// ═══════════════════════════════════════════════════════════════════════════

export const advancedTargetingCards: CreateFlashcardLibraryCard[] = [
  {
    front: "How do you target computers running outdated software?",
    back: "Use advanced filtering with version comparison! Create a question like 'Get Computer Name where Installed Application Version less than 2.5.0' to find machines running old versions. It's like filtering Netflix for 'movies before 2000' - you're comparing a value (version number) against your criteria. Then you can patch those outdated machines!",
    hint: "Think about comparing version numbers to find what's old...",
    domain: "refining_targeting",
    category: "syntax",
    difficulty: "medium",
    tags: ["advanced-filtering", "outdated-software", "version-comparison", "patching"],
    study_guide_ref: "tco-study-path/refining_targeting/version-targeting",
    source: "ai_generated"
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const refiningTargetingMediumFlashcards: CreateFlashcardLibraryCard[] = [
  ...computerGroupCards,        // 5 cards
  ...filteringCards,            // 6 cards
  ...securityCards,             // 5 cards
  ...troubleshootingCards,      // 2 cards
  ...bestPracticesCards,        // 2 cards
  ...hierarchyCards,            // 1 card
  ...advancedTargetingCards     // 1 card
];

export const refiningTargetingMediumFlashcardsMetadata = {
  domain: "refining_targeting",
  totalCards: 22,
  removedCards: 1,
  updatedAt: "2025-10-18",
  specKitCompliant: true,
  categories: {
    computerGroups: 5,
    filtering: 6,
    security: 5,
    troubleshooting: 2,
    bestPractices: 2,
    hierarchy: 1,
    advancedTargeting: 1
  },
  changes: [
    "Removed card 6 (easy difficulty - 'What syntax would you use to target endpoints with a specific operating system')",
    "Updated card 19 difficulty from hard → medium",
    "Transformed all 22 cards with conversational, student-first tone",
    "Added real-world analogies to ALL cards (playlists, Amazon filters, Netflix profiles, building access cards)",
    "Enhanced hints with practical, contextual guidance",
    "Updated study guide references to tco-study-path format",
    "Organized into 6 clear categories for better learning flow",
    "Added 'Why this matters' context to complex concepts",
    "Improved answer explanations with step-by-step breakdowns",
    "Fixed formal language (What distinguishes → What's the difference)"
  ],
  keyAnalogies: [
    "Dynamic groups = smart playlists (auto-update)",
    "Static groups = manual playlists (you manage)",
    "Filters = Amazon search filters",
    "Boolean AND = recipe ingredients (must have all)",
    "Boolean OR = any ingredient works",
    "Boolean NOT = exclude ingredients",
    "Content scoping = Netflix profiles",
    "RBAC = building access cards",
    "Group hierarchy = org chart / military ranks",
    "Sensors = security cameras (need visibility)"
  ],
  originalFile: "generated-flashcards-refining_targeting-medium-2025-10-11.ts",
  importScript: "scripts/bulk-import-flashcards.ts"
};

export default refiningTargetingMediumFlashcards;
