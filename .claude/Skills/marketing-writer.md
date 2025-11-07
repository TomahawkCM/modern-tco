---
name: marketing-writer
description: "Write marketing content for product features and launches using a casual, direct brand voice. Use this skill when the user needs to: (1) Write landing page feature sections, (2) Create tweet threads announcing features, (3) Draft launch emails, (4) Generate any marketing copy for their product. The skill automatically reads the codebase to understand product features and value propositions, eliminating the need for the user to explain what their app does. Avoids corporate buzzwords and cringe marketing speak in favor of straightforward, benefit-focused language."
---

# Marketing Writer

Write marketing content that sounds human and focuses on real benefits. This skill helps you create landing page copy, tweet threads, and launch emails for your product features.

## Core Approach

1. **Read the codebase first** - Always start by reading `references/codebase.md` to understand what the product does, its features, and value propositions
2. **Follow brand voice** - Casual and direct, like talking to a friend. No corporate speak.
3. **Use proven templates** - Reference `references/templates.md` for structures and examples
4. **Start with the problem** - Lead with pain points, then solution, then benefit

## Workflow

### Step 1: Understand the Context

Before writing anything, read the codebase reference to understand:
- What the product does
- What features exist
- Who the target users are
- What problems it solves
- What makes it unique

```bash
view references/codebase.md
```

### Step 2: Choose the Right Template

Based on what the user needs:

- **Landing page feature section**: Use Problem → Solution → Benefit format
- **Tweet thread**: Use Hook → Build Credibility → Show Value → CTA
- **Launch email**: Use Personal opening → Specific value prop → Easy CTA

Read the templates reference for structure and examples:

```bash
view references/templates.md
```

### Step 3: Write the Content

Follow these principles:
- Start with the problem people face
- Explain the solution simply (no tech jargon unless necessary)
- Focus on the real-world benefit (what changes for them?)
- Keep it conversational
- Be specific (concrete examples > abstract claims)
- Cut every buzzword

### Step 4: Check Against Brand Voice

Before presenting the content, verify:
- [ ] Sounds like talking to a friend
- [ ] No corporate buzzwords ("leverage," "synergize," "empower")
- [ ] Starts with problem, not features
- [ ] Benefits are specific and concrete
- [ ] Language is simple and direct
- [ ] You wouldn't roll your eyes reading it

## Common Patterns

### Landing Page Feature Section

```
### [Feature Name]

**The problem**: [1-2 sentence pain point. Make it relatable.]

**How it works**: [Simple explanation. What the user does.]

**Why it matters**: [Real-world benefit. What changes?]
```

### Tweet Thread

```
1/ [Hook - surprising fact or pain point]
2/ [Context - why it matters]
3/ [Your experience/credibility]
4/ [The solution]
5/ [How it works - simple]
6/ [The benefit - real impact]
7/ [CTA - low pressure]
```

### Launch Email

```
Subject: [Straightforward - what you built]

[Personal opening - why you're reaching out]
[What you built in 1-2 sentences]
[Core benefit - what changes]
[How to use it - simple next step]
[Low-pressure CTA]

P.S. [Afterthought to remove sales pressure]
```

## When to Use This Skill

- User ships a new feature and needs marketing copy
- User is creating a landing page for their product
- User wants to announce something on Twitter/social media
- User needs to write a launch email
- User asks for help writing any marketing content
- User says "write marketing copy" or "help me announce this feature"

## Examples

### Example 1: User Ships New Feature

**User**: "I just added a debt payoff calculator. Can you write a landing page section for it?"

**Process**:
1. Read `references/codebase.md` to understand the feature
2. Read `references/templates.md` for the format
3. Write using Problem → Solution → Benefit structure
4. Keep it casual and benefit-focused

**Output**:
```
### Pay Off Debt Faster

**The problem**: You know you should pay off your credit cards, but every calculator just says "pay more money" without showing you what actually works. And they never account for how your budget really works.

**How it works**: Enter your debts, choose snowball (smallest first) or avalanche (highest interest first), and the app shows you exactly when you'll be debt-free. It factors in your actual income and expenses to suggest realistic payment amounts.

**Why it matters**: See your debt-free date move up as you adjust payment amounts. No guessing, no complex formulas—just a clear plan that fits your actual budget. Most people find an extra $50/month cuts years off their debt.
```

### Example 2: Launch Announcement

**User**: "Help me write a tweet thread announcing the app"

**Process**:
1. Read `references/codebase.md` for product overview
2. Use tweet thread template from `references/templates.md`
3. Start with a hook about the problem (privacy concerns with traditional budget apps)
4. Build credibility (developer perspective)
5. Show the solution (local-first architecture)
6. End with low-pressure CTA

### Example 3: Feature Launch Email

**User**: "Need to email users about the new retirement planner"

**Process**:
1. Read codebase reference to understand the retirement planner feature
2. Use launch email template
3. Open with why this matters (most retirement calculators are confusing)
4. Explain the specific value (visual, interactive, realistic)
5. Simple CTA to try it
6. P.S. to keep it casual

## Bundled Resources

### References

- **codebase.md** - Complete product overview with features, tech stack, value props, and target users. Read this first to understand what you're marketing.
- **templates.md** - Marketing templates with examples for landing pages, tweet threads, and emails. Includes brand voice guidelines and copywriting principles.

## Important Notes

- Always read the codebase reference first - don't make the user explain their product
- If you need more context about a specific feature, ask rather than making assumptions
- Keep copy short and scannable (2-3 sentence paragraphs)
- Err on the side of under-promising rather than hyping
- When in doubt, make it simpler and more direct
- The brand voice is "casual and direct"—write like you're explaining to a friend, not selling to a customer
