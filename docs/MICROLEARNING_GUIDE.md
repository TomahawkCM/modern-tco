# Microlearning Structure Guide - Modern Tanium TCO

## 🧠 Learning Science Foundation

Based on 2025 research, we've implemented a **microlearning architecture** that splits our 11.6 hours of content into **83 micro-sections** of ~10 minutes each for optimal retention.

### Research-Backed Benefits

- **40-60% faster learning** compared to traditional long-form content
- **25-60% retention** (vs 8-10% traditional)
- **Reduces cognitive load** by chunking information
- **Increases completion rates** from <10% to 80%+

## 📐 Microlearning Structure

### Standard Micro-Section Format (10 minutes)

Each micro-section follows the **Learn → Test → Review** pattern:

```
1. Learn (5-7 minutes)
   - Core concept explanation
   - Interactive examples
   - Visual diagrams

2. Quick Check (2-3 minutes)
   - 3-5 questions testing understanding
   - Immediate feedback
   - 80%+ required to mark complete

3. Summary (1 minute)
   - Key takeaways (3-5 bullet points)
   - Connection to next section
```

## 🔧 Implementation with MicroSection Component

### Basic Usage

```tsx
import MicroSection from '@/components/mdx/MicroSection';
import MicroQuizMDX from '@/components/mdx/MicroQuizMDX';

<MicroSection
  id="asking-questions-basics"
  moduleId="tco-asking-questions"
  title="Natural Language Query Construction"
  estimatedMinutes={10}
  sectionNumber={1}
  totalSections={8}
  keyTakeaways={[
    "Tanium queries follow: Get [sensor] from [targets] where [filters]",
    "Natural language processing converts queries to system operations",
    "500+ built-in sensors provide immediate endpoint data access"
  ]}
  quickCheck={
    <MicroQuizMDX
      question="What is the basic format of a Tanium query?"
      options={[
        "Get [sensor] from [targets] where [filters]",
        "SELECT [field] FROM [table] WHERE [condition]",
        "Query [endpoints] for [data] using [filter]",
        "Search [systems] with [parameters]"
      ]}
      correctAnswer="Get [sensor] from [targets] where [filters]"
      explanation="Tanium uses natural language format: 'Get [sensor] from [targets] where [filters]' to construct queries that are converted into real-time endpoint interrogation."
      concept="Query Syntax"
    />
  }
>
  {/* Learning Content */}

  ## Natural Language Query Construction

  Tanium's revolutionary approach uses **natural language processing** to convert
  human-readable questions into powerful system queries.

  **Example Query Patterns**:
  - `Get Computer Name from all machines`
  - `Get Running Services from all machines where IP Address contains "192.168"`
  - `Get Installed Applications from all machines where Computer Name contains "SERVER"`

  ### Practice Examples

  Try constructing your first query:
  1. Start with "Get"
  2. Specify the sensor (e.g., "Computer Name")
  3. Define the target (e.g., "from all machines")
  4. Optionally add filters (e.g., "where OS contains Windows")

</MicroSection>
```

## 📊 Module Breakdown into Micro-Sections

### Module 1: Asking Questions (45 min → 5 micro-sections)

1. **Natural Language Basics** (10 min)
2. **Sensor Library Mastery** (10 min)
3. **Query Filtering Techniques** (8 min)
4. **Saved Questions Workflow** (10 min)
5. **Performance Optimization** (7 min)

**Total**: 5 sections × 10 min = 45 minutes

### Module 2: Refining Questions (90 min → 9 micro-sections)

1. **Advanced Filtering Operators** (10 min)
2. **Computer Group Targeting** (10 min)
3. **Question Chaining** (10 min)
4. **Regular Expression Filters** (10 min)
5. **Multi-Condition Logic** (10 min)
6. **Sensor Correlation** (10 min)
7. **Performance Tuning** (10 min)
8. **Best Practices** (10 min)
9. **Real-World Scenarios** (10 min)

**Total**: 9 sections × 10 min = 90 minutes

### Complete 11.6 Hour Breakdown

| Module | Time | Micro-Sections | Avg Section |
|--------|------|----------------|-------------|
| 0: Platform Foundation | 180 min | 18 sections | 10 min |
| 1: Asking Questions | 45 min | 5 sections | 9 min |
| 2: Refining Questions | 90 min | 9 sections | 10 min |
| 3: Taking Action | 120 min | 12 sections | 10 min |
| 4: Navigation & Modules | 210 min | 21 sections | 10 min |
| 5: Reporting & Export | 180 min | 18 sections | 10 min |
| **TOTAL** | **825 min (13.75h)** | **83 sections** | **~10 min** |

## 🎯 Content Creation Guidelines

### 1. Section Length Target: 10 Minutes

- **Maximum**: 15 minutes
- **Minimum**: 7 minutes
- **Sweet Spot**: 8-10 minutes

### 2. Cognitive Load Management

- **Max 7±2 concepts** per section (Miller's Law)
- One primary learning objective per section
- Break complex topics into multiple sections

### 3. Quick Check Requirements

- **3-5 questions** per section
- Mix question types:
  - Multiple choice (80%)
  - True/False (15%)
  - Scenario-based (5%)
- **80% pass threshold** to mark complete

### 4. Key Takeaways Format

- **3-5 bullet points** maximum
- Start with action verbs
- Connect to exam objectives
- Link to next section

## 📈 Progress Tracking

### Module-Level Progress

```typescript
// Stored in localStorage: module-progress-{moduleId}
{
  completedSections: ["section-1", "section-2"],
  lastAccessed: "2025-10-03T20:30:00Z",
  completionPercentage: 40,
  timeSpent: 45
}
```

### Section-Level Completion

```typescript
// Stored in localStorage: micro-section-{moduleId}-{sectionId}
"true" // or "false"
```

## 🚀 Implementation Checklist

For each study module:

- [ ] Split content into 8-21 micro-sections (based on total time)
- [ ] Wrap each section with `<MicroSection>` component
- [ ] Add 3-5 key takeaways per section
- [ ] Create Quick Check quiz with 3-5 questions
- [ ] Set unique `id` for each section
- [ ] Verify estimated time accuracy
- [ ] Test progress tracking
- [ ] Ensure 80% pass threshold

## 💡 Best Practices

### DO ✅

- Keep sections focused on ONE main concept
- Use interactive examples (QueryPlayground, etc.)
- Provide immediate feedback on Quick Checks
- Link sections with "Next Up" previews
- Track granular progress

### DON'T ❌

- Create sections longer than 15 minutes
- Mix multiple unrelated concepts
- Skip Quick Checks (critical for retention)
- Forget key takeaways section
- Use generic section IDs

## 🔬 Learning Science Integration

### Spaced Repetition (Week 2)

After completing sections, they enter spaced repetition queue:
- Day 1: Initial learning
- Day 3: First review
- Day 7: Second review
- Day 16: Third review
- Day 35: Final review

### Active Recall (Built-in)

Every Quick Check uses active recall:
1. Student attempts to answer from memory
2. Immediate feedback provided
3. Explanation reinforces correct understanding
4. Must achieve 80% to proceed

### Chunking (Current Implementation)

Information organized into digestible chunks:
- Module → Micro-sections → Concepts → Examples
- Each chunk builds on previous
- Prevents cognitive overload

## 📚 Example: Complete Micro-Section

See `/src/content/modules/01-asking-questions.mdx` for live implementation examples.

---

**Next Steps**: Week 1.3 - Build Learn → Test → Review Flow with integrated spaced repetition
