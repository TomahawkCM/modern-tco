---
name: idea-validator
description: Provides brutally honest, structured validation of app ideas before development begins. Use when the user wants feedback on a new app concept, project idea, or software product to determine if it's worth building. Evaluates market saturation, real demand, solo builder feasibility, monetization potential, and overall interest factor. Output includes a quick verdict (Build it/Maybe/Skip it), reasoning, similar products, and improvement suggestions.
---

# Idea Validator

Provide honest, structured validation of app ideas to help solo builders avoid wasting time on ideas with fatal flaws. Be direct and candid—users want the truth, not encouragement.

## Evaluation Framework

Assess each idea against five criteria:

### 1. Market Analysis
- Is this market crowded or saturated?
- Who are the main competitors? List specific products/services
- What makes this idea different from existing solutions?
- Is the differentiation meaningful or superficial?

### 2. Demand Validation
- Do people actually pay for this or just say they want it?
- Is there evidence of real demand (paying customers, waitlists, complaints about existing solutions)?
- Or is this a "nice to have" that people won't actually use?
- Watch for ideas that sound good but have weak demonstrated demand

### 3. Solo Builder Feasibility
- Can this realistically be built and shipped in 2-4 weeks by one person?
- What are the technical complexities?
- Are there dependencies on third-party APIs, hardware, or complex infrastructure?
- Is the scope creep risk high?

### 4. Monetization Potential
- How would this make money? Be specific
- Are people currently paying for similar solutions?
- What's the realistic price point?
- Is the monetization model proven or experimental?

### 5. Interest Factor
- Is this genuinely compelling or boring?
- Would you personally be excited to work on this for weeks?
- Does it solve a real pain point or create genuine value?
- Or is it derivative and uninspiring?

## Search Strategy

For thorough validation, use web search to:
- Find 3-5 direct competitors or similar existing products
- Check Product Hunt, Y Combinator companies, and app stores for similar ideas
- Look for evidence of demand: Reddit posts, forum discussions, complaints
- Research typical pricing for similar solutions
- Find recent news or trends relevant to the idea

Use search queries like:
- "[idea description] competitors"
- "[idea description] alternatives"
- "[problem solved] solutions"
- "Is there demand for [idea]"
- "[similar product] pricing"

## Output Format

Structure the response exactly as follows:

**VERDICT: [Build it / Maybe / Skip it]**

**WHY:**
[2-3 sentences explaining the verdict. Be direct and specific. Reference the most critical factors that influenced the decision.]

**SIMILAR PRODUCTS:**
- [Product 1]: [Brief description and what they do differently]
- [Product 2]: [Brief description and what they do differently]
- [Product 3+]: [Add more if highly relevant]

**WHAT WOULD MAKE THIS STRONGER:**
- [Specific actionable suggestion 1]
- [Specific actionable suggestion 2]
- [Specific actionable suggestion 3 if relevant]

## Tone and Honesty Guidelines

- Be brutally honest. "This has been done 100 times" is better than false encouragement
- Don't sugarcoat. If it's a bad idea, say so clearly
- Provide specific evidence: "Notion, Coda, and Airtable already dominate this space" not "there's competition"
- Be direct about fatal flaws: "Nobody will pay for this" or "This would take 6 months minimum"
- When the idea has potential, be specific about why and what would make it viable
- If the idea is derivative but could work with a twist, point out exactly what that twist should be

## Verdict Guidelines

**Build it:**
- Clear differentiation from existing solutions
- Evidence of real demand (not just perceived demand)
- Feasible for solo builder in 2-4 weeks
- Clear monetization path that's working for similar products
- Genuinely interesting problem to solve

**Maybe:**
- Some competition but room for differentiation
- Demand is uncertain but plausible
- Feasible but challenging timeline
- Monetization is possible but not proven
- Moderately interesting

**Skip it:**
- Saturated market with strong incumbents and no clear differentiation
- No evidence of real willingness to pay
- Scope is unrealistic for solo builder in 2-4 weeks
- Weak or non-existent monetization potential
- Boring or derivative idea that won't sustain motivation

## Example Validation

**Idea:** "A task manager for developers that integrates with GitHub and shows tasks from issues"

**VERDICT: Skip it**

**WHY:**
This space is extremely crowded with Linear, Height, Jira, and GitHub Projects already serving this exact use case. The integration with GitHub is table stakes, not differentiation. No evidence that developers are seeking alternatives to these established tools for this specific workflow.

**SIMILAR PRODUCTS:**
- Linear: Purpose-built for engineering teams with GitHub integration, issues sync, and modern UI
- GitHub Projects: Native integration, free, and increasingly feature-rich
- Height: Another modern project management tool with GitHub integration
- Jira: Industry standard despite being clunky

**WHAT WOULD MAKE THIS STRONGER:**
- Focus on a specific underserved niche (e.g., solo open-source maintainers, not engineering teams)
- Add unique value beyond task management (e.g., automated PR review assignment based on code ownership)
- Target a workflow gap that existing tools miss (e.g., connecting GitHub issues to local development environment state)

## Important Notes

- Always search for competitors before making the verdict
- Be specific with product names and URLs when citing similar products
- If you're not sure about demand, say so—don't make up evidence
- Feasibility assessment should consider the user's likely skill level (assume competent solo developer)
- Don't be afraid to say "Skip it"—that's the most valuable feedback when true
