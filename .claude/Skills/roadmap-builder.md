---
name: roadmap-builder
description: Product roadmap prioritization and feature validation framework. Use when the user asks about what to build next, requests feature prioritization advice, proposes new features for evaluation, needs help deciding between feature options, or wants guidance on keeping their product roadmap focused. Helps challenge feature ideas, validate demand, avoid feature creep, and maintain focus on core use cases.
---

# Roadmap Builder

Guides feature prioritization and roadmap decisions using an impact-driven, stage-aware framework that prevents feature creep and keeps development focused on what truly matters.

## Decision Framework

### Core Prioritization Matrix

Evaluate every feature using Impact vs Effort:

1. **High Impact, Low Effort** → Build immediately
2. **High Impact, High Effort** → Plan carefully, break into phases
3. **Low Impact, Low Effort** → Defer until proven demand
4. **Low Impact, High Effort** → Reject unless strategic

### Category Priority Order

When choosing between competing features, prioritize in this order:

1. **Retention** - Features that keep existing users engaged and prevent churn
2. **Core Features** - Essential functionality for the primary use case
3. **Monetization** - Features that directly generate revenue or enable pricing tiers
4. **Growth** - Features that attract new users or increase viral coefficient

## Stage-Based Rules

Apply strict constraints based on product stage:

### Pre-Launch Stage

**ONLY build:** Core loop features that demonstrate the primary value proposition

**Forbidden:**
- Polish or nice-to-have features
- Advanced functionality
- Growth features
- Monetization features
- Anything not essential to the core experience

**Rationale:** Shipping is more important than perfection. Get the core loop in users' hands to validate the value proposition.

### Post-Launch Stage

**ONLY build:** Features that users explicitly request or that address observed friction

**Forbidden:**
- Speculative features ("users might want this")
- Features for imaginary personas
- Competitive feature parity without user demand

**Rationale:** Real usage data trumps assumptions. Let actual user behavior drive priorities.

### Growth Phase

**Focus on:** Features that reduce churn or increase sharing/referrals

**Prioritize:**
- Onboarding improvements with measurable conversion impact
- Retention mechanics backed by cohort analysis
- Viral features with clear sharing loops

**Validate:** Every feature with metrics showing current problems (churn rate, activation rate, NPS, etc.)

## Validation Questions

Ask these questions for EVERY proposed feature:

### 1. Core Use Case Alignment
"Does this serve the core use case, or is it a tangent?"

- If tangent: Defer unless it unlocks a new core use case
- If aligned: Continue to next question

### 2. Real vs Stated Demand
"Will users actually use this, or just say they want it?"

**Signals of real demand:**
- Users are already trying to hack together a solution
- Feature requests come from multiple independent users
- Users express frustration at current workarounds
- Users willing to pay for it specifically

**Signals of stated demand only:**
- "It would be nice if..."
- Single user request
- Competitive feature parity argument
- No current evidence of pain

### 3. Validation-First Approach
"Can we fake it first to validate demand?"

**Fake-it-first options:**
- Concierge: Manually provide the feature for a few users
- Wizard of Oz: Make it look automated but do it manually
- Landing page: Gauge interest before building
- Prototype: Build minimal version in hours, not days

**Only build if:** Fake version proves actual usage and value

## Red Flags

Immediately challenge features that exhibit these warning signs:

### Feature Creep
- Adding features because they're "cool" or "would be nice"
- Building for completeness rather than user need
- Matching competitors feature-for-feature without strategic reason

**Counter:** "What specific user problem does this solve? Show me evidence of that problem."

### Premature Optimization
- Perfecting features that don't have product-market fit yet
- Scaling before proving core value
- Building for hypothetical future scale

**Counter:** "What breaks at current scale? What user complaints exist about this?"

### Imaginary Users
- Building for personas without real user validation
- "Users would probably want..." speculation
- Designing for edge cases before solving mainstream cases

**Counter:** "Name three actual users who have this problem. When did they last mention it?"

## Practical Application

### When User Proposes a Feature

1. Acknowledge the idea positively
2. Ask the three validation questions
3. Assess against current stage rules
4. Plot on Impact vs Effort matrix
5. Recommend: Build now / Validate first / Defer / Reject

### When User Asks "What Should I Build Next?"

1. Identify current product stage
2. List all candidate features
3. Apply stage-based rules to create shortlist
4. For shortlist, evaluate Impact vs Effort
5. For top candidates, ask validation questions
6. Recommend prioritized feature with rationale

### When Evaluating Roadmap

1. Check if roadmap respects stage-based rules
2. Verify each feature passes validation questions
3. Confirm Impact vs Effort assessment
4. Flag any red flag patterns
5. Suggest reordering or removing features as needed

## Example Responses

**Good challenge:**
"I see this feature focuses on power users, but you're pre-launch. Your current priority should be the core loop for mainstream users. Can you show me 5+ users actively requesting this? If not, let's defer this until post-launch when you have real usage data."

**Good validation:**
"Before building this full workflow automation, try the concierge approach: manually do the automation for 10 users this week. If they love it and you're drowning in manual work, then automate. But don't build automation for a feature that might not get used."

**Good prioritization:**
"You have three options: (1) Onboarding tutorial (Low effort, High impact on activation), (2) Advanced reporting (High effort, Low impact - only power users), (3) Social sharing (Medium effort, High impact on growth). Given you're in growth phase with 20% activation rate, prioritize the onboarding tutorial. The data shows 80% of users don't complete first action."

## Key Principles

- **Ship fast, iterate faster** - Imperfect features in users' hands beat perfect features in development
- **Follow the evidence** - User requests + usage data trump opinions and assumptions  
- **One thing well** - Deep focus on core use case beats broad mediocrity
- **Validate before building** - Proof of demand before proof of concept
- **Stage-appropriate decisions** - What's right changes as the product matures
