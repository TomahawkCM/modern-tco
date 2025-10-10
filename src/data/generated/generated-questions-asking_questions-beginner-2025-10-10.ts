import { type Question, TCODomain, Difficulty, QuestionCategory } from "@/types/exam";

/**
 * AI-Generated Questions
 *
 * Domain: asking_questions
 * Difficulty: beginner
 * Count: 5
 * Generated: 2025-10-10T07:16:27.789Z
 * Model: OpenAI GPT-4 Turbo (gpt-4-turbo-preview)
 */

export const generatedQuestions: Question[] = [
  {
    "question": "How can you optimize the performance of a question in Tanium?",
    "choices": [
      {
        "id": "a",
        "text": "Asking the question at peak network hours"
      },
      {
        "id": "b",
        "text": "Using broad, unspecific terms in the query"
      },
      {
        "id": "c",
        "text": "Limiting the scope with specific, targeted terms"
      },
      {
        "id": "d",
        "text": "Asking multiple questions simultaneously"
      }
    ],
    "correctAnswerId": "c",
    "domain": "asking_questions",
    "difficulty": "beginner",
    "category": "best_practices",
    "explanation": "Limiting the scope of a question by using specific, targeted terms can significantly optimize its performance by reducing the amount of data processed and returned. Asking questions at peak hours, using broad terms, or asking multiple questions simultaneously might increase load and decrease performance.",
    "tags": [
      "question-performance-optimization",
      "best-practices",
      "question-construction"
    ],
    "id": "ASKING-GEN-1760080587788-1"
  },
  {
    "question": "What is the correct syntax for asking about installed applications using Tanium's natural language interface?",
    "choices": [
      {
        "id": "a",
        "text": "List all applications"
      },
      {
        "id": "b",
        "text": "Get installed applications"
      },
      {
        "id": "c",
        "text": "Show me all installed applications"
      },
      {
        "id": "d",
        "text": "What applications are installed?"
      }
    ],
    "correctAnswerId": "d",
    "domain": "asking_questions",
    "difficulty": "beginner",
    "category": "practical_scenarios",
    "explanation": "The syntax 'What applications are installed?' is a clear, precise query formatted in a natural language style that Tanium understands for retrieving a list of installed applications on endpoints. The other options, while understandable, are less aligned with the natural language syntax encouraged by Tanium.",
    "tags": [
      "natural-language-query-syntax",
      "installed-applications",
      "sensor-library"
    ],
    "id": "ASKING-GEN-1760080587788-2"
  },
  {
    "question": "Which module must be navigated to for managing saved questions in Tanium?",
    "choices": [
      {
        "id": "a",
        "text": "Connect"
      },
      {
        "id": "b",
        "text": "Discover"
      },
      {
        "id": "c",
        "text": "Interact"
      },
      {
        "id": "d",
        "text": "Patch"
      }
    ],
    "correctAnswerId": "c",
    "domain": "asking_questions",
    "difficulty": "beginner",
    "category": "platform_fundamentals",
    "explanation": "The Interact module is the place within Tanium where users can manage saved questions, among other tasks related to questioning and data collection from endpoints. Connect is used for exporting data, Discover for identifying unmanaged assets, and Patch for managing patches.",
    "tags": [
      "saved-questions-management",
      "interact-module",
      "practical-scenarios"
    ],
    "id": "ASKING-GEN-1760080587788-3"
  },
  {
    "question": "To effectively share question results with a colleague, what is the best practice in Tanium?",
    "choices": [
      {
        "id": "a",
        "text": "Print the results and hand them over"
      },
      {
        "id": "b",
        "text": "Share the question directly within Tanium"
      },
      {
        "id": "c",
        "text": "Take a screenshot and send it via email"
      },
      {
        "id": "d",
        "text": "Write down the results manually"
      }
    ],
    "correctAnswerId": "b",
    "domain": "asking_questions",
    "difficulty": "beginner",
    "category": "best_practices",
    "explanation": "Sharing the question directly within Tanium is the most efficient and secure method to collaborate with colleagues on question results. This method maintains data integrity and allows for real-time collaboration. The other methods are less secure, more time-consuming, and prone to errors.",
    "tags": [
      "question-sharing-and-collaboration",
      "best-practices",
      "question-management"
    ],
    "id": "ASKING-GEN-1760080587788-4"
  },
  {
    "question": "What information does the 'Computer Name' sensor provide in Tanium?",
    "choices": [
      {
        "id": "a",
        "text": "The make and model of the computer's hardware"
      },
      {
        "id": "b",
        "text": "The IP address of the computer"
      },
      {
        "id": "c",
        "text": "The name assigned to the computer within the network"
      },
      {
        "id": "d",
        "text": "The operating system version of the computer"
      }
    ],
    "correctAnswerId": "c",
    "domain": "asking_questions",
    "difficulty": "beginner",
    "category": "practical_scenarios",
    "explanation": "The 'Computer Name' sensor in Tanium provides the name assigned to the computer within the network. This allows for easy identification of endpoints. The other options reference different types of information that would require different sensors (e.g., IP address, OS version, hardware details).",
    "tags": [
      "common-sensors",
      "computer-name",
      "sensor-library"
    ],
    "id": "ASKING-GEN-1760080587788-5"
  }
];

export default generatedQuestions;
