import { CreateFlashcardLibraryCard } from "@/types/flashcard-library";

/**
 * AI-Generated Flashcards
 *
 * Domain: asking_questions
 * Difficulty: medium
 * Count: 5
 * Generated: 2025-10-10T07:16:56.301Z
 * Model: OpenAI GPT-4 Turbo (gpt-4-turbo-preview)
 */

export const generatedFlashcards: CreateFlashcardLibraryCard[] = [
  {
    "front": "How do you navigate to the Interact module in Tanium?",
    "back": "To navigate to the Interact module, go to the Tanium Console, click on 'Modules' from the main menu, and then select 'Interact' from the list of available modules.",
    "hint": "It's accessible through the main menu under 'Modules'.",
    "domain": "asking_questions",
    "category": "best_practices",
    "difficulty": "medium",
    "tags": [
      "interact-module",
      "navigation",
      "console"
    ],
    "study_guide_ref": "Module 2: Interact Module Navigation",
    "source": "ai_generated"
  },
  {
    "front": "What is the syntax for asking a natural language question in Tanium?",
    "back": "In Tanium, questions can be asked in a natural language syntax that closely resembles English. A typical question format is '[Sensor Name] from all machines' for broad queries or applying filters for more specific results.",
    "hint": "Syntax resembles conversational English, including the sensor name.",
    "domain": "asking_questions",
    "category": "syntax",
    "difficulty": "medium",
    "tags": [
      "query-syntax",
      "natural-language",
      "sensor-name"
    ],
    "study_guide_ref": "Module 3: Natural Language Query Syntax",
    "source": "ai_generated"
  },
  {
    "front": "Name two common sensors used in Tanium questions and their purposes.",
    "back": "Two common sensors in Tanium are 'Computer Name', which identifies the name of an endpoint, and 'IP Address', which provides the network address of an endpoint. They are often used to quickly locate and identify devices.",
    "hint": "Consider sensors that help identify and locate devices.",
    "domain": "asking_questions",
    "category": "terminology",
    "difficulty": "medium",
    "tags": [
      "common-sensors",
      "computer-name",
      "ip-address"
    ],
    "study_guide_ref": "Module 4: Common Sensors",
    "source": "ai_generated"
  },
  {
    "front": "What is a best practice for constructing questions in Tanium?",
    "back": "A best practice for constructing questions in Tanium includes starting with broad questions to assess the landscape, then narrowing down with filters based on the initial results. This approach ensures comprehensive coverage and focused results.",
    "hint": "Start broad, then narrow down.",
    "domain": "asking_questions",
    "category": "best_practices",
    "difficulty": "medium",
    "tags": [
      "question-construction",
      "best-practices",
      "filters"
    ],
    "study_guide_ref": "Module 5: Question Construction Best Practices",
    "source": "ai_generated"
  },
  {
    "front": "How do you interpret the 'Last Reported Time' in Tanium question results?",
    "back": "The 'Last Reported Time' in Tanium question results indicates the last time an endpoint reported back its status for that specific question. It's crucial for understanding the recency of the data you're viewing.",
    "hint": "Reflects the recency of endpoint data.",
    "domain": "asking_questions",
    "category": "troubleshooting",
    "difficulty": "medium",
    "tags": [
      "last-reported-time",
      "question-results",
      "data-recency"
    ],
    "study_guide_ref": "Module 6: Question Result Interpretation",
    "source": "ai_generated"
  }
];

export default generatedFlashcards;
