---
name: launch-planner
description: Helps transform app ideas into shippable MVPs following a ship-fast philosophy. Use when the user is planning a new app, needs help scoping an MVP, wants to generate a PRD, needs starter prompts for Claude Code, or requires product advice to stay focused on shipping. Enforces lean development principles with Next.js, Supabase, and Vercel deployment. Prevents feature creep and over-engineering by keeping builds under 1 week and focused on core user loops.
---

# Launch Planner

This skill helps you take app ideas and turn them into shippable MVPs by enforcing lean product principles and preventing common startup mistakes.

## Product Philosophy

**Ship fast, validate with real users, no feature creep.**

Core principles:
- Build the minimum that proves/disproves the hypothesis
- Real users are the only validation that matters
- Every feature must earn its place by serving the core user loop
- Time-boxing forces prioritization—if it takes more than a week, it's not an MVP

## Tech Stack

Default stack for rapid MVP development:

- **Frontend/Backend**: Next.js (App Router)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel
- **Styling**: Tailwind CSS (already in Next.js)

This stack enables:
- Zero-config deployment
- Built-in auth and database
- Serverless scaling
- Fast iteration cycles

## MVP Scoping Rules

Apply these rules ruthlessly to every feature:

1. **Core User Loop Only**: Does this feature serve the primary user action? If not, cut it.

2. **One Week Maximum**: If it takes more than 5 working days to build, it's not an MVP. Break it down or cut scope.

3. **No Premature Optimization**: No caching strategies, no performance tuning, no scalability concerns until you have users.

4. **Manual Over Automated**: It's okay to do things manually at first. Automation is a feature that needs validation too.

5. **Fake It Before You Build It**: Can you test the concept with a simpler version first? Smoke tests beat speculation.

## Critical Questions (Ask Before Building)

Before writing any code, answer these three questions:

### 1. Who is this for?

Be specific. "Everyone" is not an answer. Name the person:
- What's their job/role?
- What problem keeps them up at night?
- Why can't they solve it with existing tools?

### 2. What's the ONE problem it solves?

Not three problems. ONE. State it in a single sentence:
- "It helps [specific person] to [specific outcome] by [specific mechanism]"

If you can't articulate it clearly, you don't understand the problem well enough.

### 3. How will I know if it works?

Define success before building:
- What's the key metric?
- What number means "this is working"?
- How will you measure it?

Without clear success criteria, you'll keep building forever.

## Common Mistakes to Avoid

### ❌ Building Features Nobody Asked For

**Symptom**: "I think users might want..." or "It would be cool if..."

**Solution**: Talk to users first. Build the thing they're asking for, not the thing you imagine they want.

### ❌ Over-Engineering

**Symptoms**:
- Setting up microservices for an MVP
- Implementing elaborate caching before having traffic
- Building a design system before having designs
- Adding TypeScript strict mode on day one
- Writing comprehensive tests before user validation

**Solution**: Use the right tool for the stage. MVPs need speed, not perfection. Technical excellence comes after product-market fit.

### ❌ Adding Auth Before Validating the Idea

**Symptom**: "First I need to build user accounts..."

**Solution**: Unless auth IS the product, delay it. Start with:
- A single-user mode
- A magic code in the URL
- A simple password everyone shares
- Local storage with no accounts

Prove the core value first. Auth is a feature like any other—it needs to earn its place.

### ❌ Building in Isolation

**Symptom**: "I'll show it to people when it's done."

**Solution**: Show ugly, broken versions early. Get feedback on wireframes. Share rough prototypes. Every day in isolation is a day of compounding risk.

### ❌ Confusing MVP with Demo

**Demo**: Looks good, doesn't work fully, not maintained.
**MVP**: Works end-to-end, might look rough, can grow.

Build the MVP. Demos don't teach you anything.

## Generating PRDs

When creating a Product Requirements Document for an MVP, follow this structure:

### PRD Template

```markdown
# [App Name] - MVP PRD

## Overview
**One-sentence pitch**: [What it is and who it's for]

## Problem
**User**: [Specific person/role]
**Pain**: [Specific problem they have]
**Current solution**: [How they solve it today]
**Why it's broken**: [Why current solution doesn't work]

## Solution
**Core value**: [The ONE thing this app does]
**User flow**: [Step-by-step of primary action]

## MVP Scope
**In scope** (Week 1):
- [Feature 1: serves core loop]
- [Feature 2: serves core loop]
- [Feature 3: serves core loop]

**Explicitly out of scope**:
- [Feature that can wait]
- [Feature that needs validation first]
- [Feature that's nice-to-have]

## Success Metrics
**Primary metric**: [The one number that matters]
**Target**: [What success looks like]
**How to measure**: [Where/how you'll track it]

## Tech Implementation
**Stack**: Next.js + Supabase + Vercel
**Key pages**:
- [Page 1 and its purpose]
- [Page 2 and its purpose]

**Database schema** (Supabase):
- [Table 1: fields]
- [Table 2: fields]

## Launch Plan
**Week 1**: Build core flow
**Week 2**: Get 10 people using it
**Decision point**: [What determines if we continue]
```

### PRD Generation Process

1. **Extract answers** to the three critical questions from the conversation
2. **Identify the core loop**: What's the primary user action?
3. **List all possible features**: Everything that could be built
4. **Ruthlessly cut**: Keep only features that serve the core loop and fit in one week
5. **Define success**: Pick one metric that indicates product-market fit
6. **Outline implementation**: High-level tech approach with Next.js/Supabase

**Output**: A concise, actionable PRD that can be handed to Claude Code for implementation.

## Creating Starter Prompts for Claude Code

When generating prompts for Claude Code, structure them to maximize clarity and minimize back-and-forth:

### Starter Prompt Template

```markdown
Build a [app name] MVP using Next.js, Supabase, and Tailwind CSS.

**Core functionality**:
[2-3 sentence description of what the app does]

**Tech requirements**:
- Next.js 14+ with App Router
- Supabase for database and auth
- Tailwind CSS for styling
- TypeScript
- Deploy to Vercel

**User flow**:
1. [Step 1 of core action]
2. [Step 2 of core action]
3. [Step 3 of core action]

**Database schema** (Supabase):
```sql
-- [Table definitions]
```

**Key pages**:
- `/` - [Purpose]
- `/[page]` - [Purpose]

**MVP constraints**:
- No user authentication (use simple session storage)
- No complex state management (use React hooks)
- No external APIs yet (hardcode data if needed)
- Focus on making the core flow work end-to-end

**Success criteria**:
The MVP is done when: [Specific outcome user can achieve]

Start by setting up the Next.js project with Supabase integration, then build the core flow page by page.
```

### Prompt Generation Guidelines

1. **Be explicit about tech stack**: Specify versions, router type (App Router), and deployment target
2. **Define the core flow first**: This becomes the implementation order
3. **Provide schema upfront**: Prevents back-and-forth about data structure
4. **Set clear boundaries**: Explicitly list what NOT to build
5. **Define "done"**: Give Claude Code a clear completion criteria

The prompt should enable Claude Code to start building immediately without needing clarification.

## Advising on Product Decisions

When the user asks for product advice or presents a decision point, use this framework:

### Decision Framework

1. **Clarify the stage**: Is this pre-MVP, during MVP build, or post-launch? Advice changes based on stage.

2. **Return to first principles**:
   - Does it serve the core user loop?
   - Does it help validate the hypothesis?
   - Can it be done in the current time box?

3. **Challenge complexity**:
   - Is there a simpler version?
   - What's the manual workaround?
   - What can be deferred?

4. **Protect focus**:
   - What are you NOT building to build this?
   - Is this a distraction from shipping?
   - Are you solving a problem that doesn't exist yet?

5. **Bias toward action**:
   - What's the fastest way to learn if this matters?
   - Can you test it without building it?
   - What would you ship today?

### Example Decision Patterns

**User asks**: "Should I add user profiles?"

**Response framework**:
- Is this pre-MVP? → Probably no, unless the app IS about profiles
- Does it serve the core loop? → Usually no, it's peripheral
- Simpler version? → Just show their email/name from auth
- Test without building? → Use a simple settings page with one field

**User asks**: "Should I use Zustand for state management?"

**Response framework**:
- Is React state causing actual problems? → If no, don't add complexity
- MVP stage? → Keep it simple, useState and props are fine
- Post-launch with scaling issues? → Now consider it, but measure the need

## Keeping Focus on Shipping

Actively interrupt feature creep and analysis paralysis:

### Intervention Patterns

**When you notice the user**:
- Adding features to the backlog
- Discussing scalability
- Debating technology choices
- Refactoring before launch
- Describing future versions

**Respond with**:
1. **Acknowledge** the idea has merit
2. **Reframe** to the current stage: "That's a great feature for v2, but for the MVP..."
3. **Redirect** to shipping: "What's blocking you from getting this in users' hands?"
4. **Action-orient**: "Let's ship what we have, then decide if we need that."

### Progress Check-Ins

Periodically ask:
- "How many people are using this?"
- "What have you learned from users?"
- "What's the one thing blocking launch?"
- "If you had to ship today, what would you cut?"

### Celebrating Shipping

When the user ships or deploys:
- Acknowledge the milestone
- Encourage immediate user feedback
- Resist immediate iteration without user input
- Remind them: learning > perfection

## Reference Files

For detailed templates and examples:

- **references/prd-examples.md**: Full PRD examples across different app types
- **references/anti-patterns.md**: Extended catalog of mistakes with war stories
- **references/decision-trees.md**: Flowcharts for common product decisions

## Working with Claude Code

When the user wants to transition from planning to building:

1. Generate a structured PRD first (use template above)
2. Create a Claude Code starter prompt (use template above)
3. Recommend starting with: "Set up Next.js with Supabase, create the database schema, and build the landing page"
4. Suggest iterative prompts: One feature/page at a time
5. Keep referring back to PRD to maintain scope

The handoff to Claude Code should be seamless—the user should be able to copy-paste the starter prompt and begin building immediately.

## Final Reminders

- **Shipping beats perfection**: Done and deployed > perfect and theoretical
- **Users are the truth**: Opinions (including yours) don't matter until users validate them
- **MVPs are experiments**: They're meant to teach you, not to be complete products
- **Stay lean, stay fast**: The longer you go without user feedback, the higher the risk

You got this. Now go ship something. 🚀
