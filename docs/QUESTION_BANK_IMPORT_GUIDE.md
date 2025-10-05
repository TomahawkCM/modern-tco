# Question Bank Import Guide

This guide explains how to import questions into the question bank system for spaced repetition reviews.

## 🎯 Overview

The question bank system is separate from the exam system:
- **Question Bank**: For spaced repetition reviews (using adaptive difficulty)
- **Exam System**: For practice exams and assessments

## 📁 File Formats Supported

### JSON Format (Direct)

```json
[
  {
    "id": "pf-lc-6",
    "moduleId": "platform-foundation",
    "sectionId": "linear-chain",
    "concept": "Linear Chain Architecture",
    "question": "What is the primary advantage of Tanium's linear chain?",
    "type": "multiple-choice",
    "options": [
      "Uses less disk space",
      "Scales exponentially with minimal server load",
      "Requires no network connectivity",
      "Automatically updates software"
    ],
    "correctAnswer": "Scales exponentially with minimal server load",
    "explanation": "The linear chain allows each endpoint to act as a relay...",
    "difficulty": "easy",
    "tags": ["architecture", "scalability"]
  }
]
```

### Legacy Format

The import utility can convert from the old exam format:

```json
[
  {
    "id": "AQ-001",
    "domain": "AQ",
    "difficulty": 1,
    "stem": "What does 'Get Computer Name from all machines' do?",
    "choices": [
      "Returns all computer names",
      "Returns IP addresses",
      "Returns operating systems",
      "Returns installed software"
    ],
    "answer": "A",
    "explanation": "This query retrieves the computer name from all endpoints..."
  }
]
```

## 🚀 Usage

### Basic Import (JSON Format)

```bash
# Import direct JSON format
npx tsx scripts/import-to-question-bank.ts data/my-questions.json
```

### Legacy Format Import

```bash
# Import from legacy exam format
npx tsx scripts/import-to-question-bank.ts data/legacy-questions.json --format=legacy
```

## 📊 What Happens During Import

1. **File Reading**: Script reads your JSON file
2. **Format Conversion**: Converts legacy format to question bank format (if needed)
3. **Statistics**: Displays breakdown by module, difficulty, type
4. **File Generation**: Creates two output files:
   - `src/data/question-bank/imported-YYYY-MM-DD.json` (JSON)
   - `src/data/question-bank/imported-YYYY-MM-DD.ts` (TypeScript)

## 🔗 Using Imported Questions

### Option 1: Import in Code

```typescript
import { importedQuestions } from "@/data/question-bank/imported-2025-10-03";
import { addQuestions } from "@/lib/questionBank";

// Add to question bank
addQuestions(importedQuestions);
```

### Option 2: Manual Browser Import

1. Open browser console on your app
2. Paste the JSON content:

```javascript
const questions = [/* paste your questions here */];
localStorage.setItem('question-bank', JSON.stringify(questions));
```

## 📝 Question Field Mapping

### Module IDs

| Legacy Domain | New Module ID |
|---------------|---------------|
| AQ | asking-questions |
| RQ | refining-questions |
| TA | taking-action |
| NB | navigation-modules |
| RD | reporting-export |

### Difficulty Levels

| Legacy | New |
|--------|-----|
| 1 (Beginner) | easy |
| 2 (Intermediate) | medium |
| 3 (Advanced) | hard |

## 🎯 Best Practices

### 1. **Concept Naming**

Use clear, descriptive concept names that match your MDX content:

```json
{
  "concept": "Linear Chain Architecture",  // ✅ Good
  "concept": "LC",                         // ❌ Too vague
}
```

### 2. **Module and Section IDs**

Match these to your content structure:

```json
{
  "moduleId": "asking-questions",           // Matches /content/modules/asking-questions.mdx
  "sectionId": "natural-language",          // Matches section in MDX
}
```

### 3. **Question Quality**

- **Clear questions**: Avoid ambiguity
- **Good explanations**: Explain why the answer is correct
- **Appropriate difficulty**: Easy for concepts, hard for application
- **Relevant tags**: Help with filtering and search

### 4. **Answer Format**

For multiple-choice, the `correctAnswer` must match one of the `options` exactly:

```json
{
  "options": ["Option A", "Option B", "Option C"],
  "correctAnswer": "Option B"  // Must match exactly
}
```

## 📦 Sample Question Template

```json
{
  "id": "unique-question-id",
  "moduleId": "asking-questions",
  "sectionId": "natural-language",
  "concept": "Query Syntax",
  "question": "What is the basic Tanium query format?",
  "type": "multiple-choice",
  "options": [
    "SELECT data FROM endpoints WHERE condition",
    "Get [sensor] from [targets] where [filters]",
    "QUERY endpoints FOR data IF condition",
    "FIND data ON machines WITH criteria"
  ],
  "correctAnswer": "Get [sensor] from [targets] where [filters]",
  "explanation": "Tanium uses natural language format: 'Get [sensor] from [targets] where [filters]'. For example: 'Get Computer Name from all machines'.",
  "difficulty": "easy",
  "tags": ["query", "syntax", "fundamentals"]
}
```

## 🔄 Linking to Micro-Sections

Questions should be linked to specific micro-sections in your MDX content:

**MDX Content** (`src/content/modules/asking-questions.mdx`):

```mdx
## Natural Language Queries

### Basic Syntax

Tanium uses a simple format: `Get [sensor] from [targets] where [filters]`
```

**Corresponding Question**:

```json
{
  "moduleId": "asking-questions",
  "sectionId": "natural-language",  // Matches ## Natural Language Queries
  "concept": "Basic Syntax"         // Matches ### Basic Syntax
}
```

## 🎓 Import Workflow Example

### Step 1: Create Questions File

Create `data/tanium-questions.json`:

```json
[
  {
    "id": "aq-1",
    "moduleId": "asking-questions",
    "sectionId": "natural-language",
    "concept": "Query Syntax",
    "question": "What is the basic Tanium query format?",
    "type": "multiple-choice",
    "options": [
      "SELECT data FROM endpoints",
      "Get [sensor] from [targets]",
      "QUERY endpoints FOR data"
    ],
    "correctAnswer": "Get [sensor] from [targets]",
    "explanation": "Tanium uses: 'Get [sensor] from [targets] where [filters]'",
    "difficulty": "easy",
    "tags": ["query", "syntax"]
  }
]
```

### Step 2: Run Import

```bash
npx tsx scripts/import-to-question-bank.ts data/tanium-questions.json
```

### Step 3: Verify Output

```
📖 Reading questions from: data/tanium-questions.json
   Format: json
   ✓ Loaded 1 questions

📊 Statistics:
  By Module:
    asking-questions: 1
  By Difficulty:
    easy: 1
  By Type:
    multiple-choice: 1

💾 Saved to: src/data/question-bank/imported-2025-10-03.json
💾 TypeScript file: src/data/question-bank/imported-2025-10-03.ts
```

### Step 4: Use in Your App

```typescript
import { importedQuestions } from "@/data/question-bank/imported-2025-10-03";
import { addQuestions } from "@/lib/questionBank";

addQuestions(importedQuestions);
```

## 📈 Scaling to 4,108+ Questions

For the full Tanium TCO question bank:

1. **Organize by module**: Create separate files per module
2. **Batch import**: Import one module at a time
3. **Validate**: Check statistics match expectations
4. **Test**: Verify questions appear correctly in review sessions

```bash
# Import module by module
npx tsx scripts/import-to-question-bank.ts data/asking-questions.json
npx tsx scripts/import-to-question-bank.ts data/refining-questions.json
npx tsx scripts/import-to-question-bank.ts data/taking-action.json
# ... etc
```

## 🔍 Troubleshooting

### Question Not Appearing in Reviews

**Check:**
- Module ID matches your content structure
- Section ID exists in the MDX file
- Question bank localStorage has the questions

### Import Fails

**Common issues:**
- Invalid JSON syntax
- Missing required fields (id, moduleId, question, correctAnswer)
- Multiple-choice with < 2 options

### Statistics Don't Match

**Verify:**
- All questions have valid moduleId
- Domain mapping is correct (see mapping table above)

---

**Next**: [Week 2.3 Completion - Active Recall Question Bank](./WEEK_2_3_COMPLETION.md)
