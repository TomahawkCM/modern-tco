# Decision Trees for Common MVP Questions

This file provides decision flowcharts for common questions that arise when building MVPs.

## Decision Tree: "Should I Build This Feature?"

```
START: User suggests or you think of a feature

│
├─ Does it DIRECTLY serve the core user loop?
│  ├─ NO → ❌ Don't build (add to "Maybe Later" list)
│  └─ YES → Continue
│
├─ Can you ship the MVP without it?
│  ├─ YES → ❌ Don't build (ship first, then reconsider)
│  └─ NO → Continue
│
├─ Can you fake it or do it manually instead?
│  ├─ YES → ✅ Do the manual version (automate later if needed)
│  └─ NO → Continue
│
├─ Will it take more than 2 days to build?
│  ├─ YES → Can you build a simpler version?
│  │  ├─ YES → ✅ Build the simple version
│  │  └─ NO → ❌ Too complex for MVP, defer
│  └─ NO → Continue
│
└─ ✅ Build it (but timebox to 2 days max)
```

## Decision Tree: "Should I Add User Authentication?"

```
START: Considering adding auth

│
├─ Is the product fundamentally ABOUT user identity?
│  (e.g., social network, dating app, profile system)
│  ├─ YES → Continue to auth decision
│  └─ NO → Continue
│
├─ Does the product require personal data that MUST be private?
│  (e.g., health records, financial data, private documents)
│  ├─ YES → Continue to auth decision
│  └─ NO → Continue
│
├─ Is sharing/collaboration between users the core feature?
│  ├─ YES → Continue to auth decision
│  └─ NO → Continue
│
└─ ❌ Don't add auth yet

AUTH DECISION PATH:

├─ What's the simplest auth that could work?
│  ├─ Magic link (email only, no password) → ✅ Best for MVP
│  ├─ OAuth only (Google/GitHub) → ✅ Good for MVP
│  ├─ Password auth → 🤔 Only if absolutely necessary
│  └─ Multi-factor, complex rules → ❌ Not for MVP
│
└─ Alternative: Can you use localStorage/session instead?
   ├─ Data only needs to persist in one browser → ✅ Use localStorage
   ├─ Data only needs to last this session → ✅ Use sessionStorage
   └─ Data needs to be accessed from multiple devices → Need auth
```

## Decision Tree: "Should I Use a Specific Technology?"

```
START: Considering technology choice (library, framework, tool)

│
├─ Are you already proficient with this tech?
│  ├─ NO → Can you learn it AND build the MVP in 1 week?
│  │  ├─ YES → Continue
│  │  └─ NO → ❌ Use what you know
│  └─ YES → Continue
│
├─ Is this tech in your standard stack? (Next.js, Supabase, Vercel)
│  ├─ YES → ✅ Use it
│  └─ NO → Continue
│
├─ What problem does this solve?
│  ├─ "Makes code cleaner" → ❌ Not for MVP
│  ├─ "Industry best practice" → ❌ Not for MVP
│  ├─ "Will scale better" → ❌ Not for MVP (you don't have scale problems)
│  ├─ "Makes future features easier" → ❌ Not for MVP (ship first)
│  └─ "Solves an actual problem I have right now" → Continue
│
├─ Can you ship without it?
│  ├─ YES → ❌ Ship without it first
│  └─ NO → Continue
│
└─ Is there a simpler alternative?
   ├─ YES → Use the simpler alternative
   └─ NO → ✅ Use it, but timebox the learning
```

## Decision Tree: "Should I Refactor This Code?"

```
START: Code feels messy or you want to refactor

│
├─ Have you launched to real users yet?
│  ├─ NO → ❌ Don't refactor (ship first)
│  └─ YES → Continue
│
├─ Is the code causing actual bugs that users report?
│  ├─ YES → ✅ Refactor to fix bugs
│  └─ NO → Continue
│
├─ Is the code so messy it's blocking new feature development?
│  ├─ NO → ❌ Don't refactor (it's working)
│  └─ YES → Continue
│
├─ Will refactoring take more than 1 day?
│  ├─ YES → Break it down or don't do it
│  └─ NO → Continue
│
└─ ✅ Refactor, but timebox to 1 day max
```

## Decision Tree: "Should I Add Tests?"

```
START: Considering adding tests

│
├─ Have you launched and have real users?
│  ├─ NO → ❌ Don't add tests (ship first)
│  └─ YES → Continue
│
├─ Are you experiencing actual bugs that hurt users?
│  ├─ NO → ❌ Tests won't help (you don't have the problem yet)
│  └─ YES → Continue
│
├─ What kind of tests?
│  ├─ Unit tests for utilities → ✅ Maybe, if bugs are in utils
│  ├─ Integration tests for critical paths → ✅ Good choice
│  ├─ E2E tests for full user flows → ✅ Best ROI
│  └─ 100% code coverage → ❌ Not necessary
│
└─ Start with tests for the parts that break most often
```

## Decision Tree: "Should I Add This Third-Party Service?"

```
START: Considering adding a third-party service (analytics, monitoring, etc.)

│
├─ What category is this service?
│  ├─ Analytics (Mixpanel, Amplitude, etc.)
│  ├─ Error tracking (Sentry, Bugsnag, etc.)
│  ├─ Performance monitoring (New Relic, Datadog, etc.)
│  ├─ Email (SendGrid, Mailgun, etc.)
│  └─ Other
│
ANALYTICS PATH:
├─ Do you have users yet?
│  ├─ NO → ❌ Don't add (talk to users instead)
│  └─ YES → Do you know what you want to measure?
│     ├─ NO → ❌ Don't add (figure out what matters first)
│     └─ YES → ✅ Add simple analytics (Vercel Analytics or Plausible)
│
ERROR TRACKING PATH:
├─ Are you getting user reports of errors?
│  ├─ NO → ❌ Don't add (console.log is enough for now)
│  └─ YES → ✅ Add error tracking
│
PERFORMANCE MONITORING PATH:
├─ Are users complaining about speed?
│  ├─ NO → ❌ Don't add (premature optimization)
│  └─ YES → ✅ Add monitoring to find bottleneck
│
EMAIL PATH:
├─ Is email core to the product?
│  ├─ YES → ✅ Add email service
│  └─ NO → Can you do without it for now?
│     ├─ YES → ❌ Don't add
│     └─ NO → ✅ Add email service
│
OTHER PATH:
├─ Can you ship without it?
│  ├─ YES → ❌ Don't add (ship first)
│  └─ NO → Does it take more than 1 hour to integrate?
│     ├─ YES → Look for simpler alternative
│     └─ NO → ✅ Add it
```

## Decision Tree: "Should I Support This Use Case?"

```
START: User or you think of an alternative use case

│
├─ How many users are asking for this?
│  ├─ 0 (it's hypothetical) → ❌ Don't support
│  ├─ 1-2 users → Continue
│  └─ 5+ users → Continue (but still apply other filters)
│
├─ Does it require changing your core user flow?
│  ├─ YES → Is the new flow better for everyone?
│  │  ├─ YES → ✅ Change the core flow
│  │  └─ NO → ❌ Don't support (it fragments the experience)
│  └─ NO → Continue
│
├─ Can you support it with configuration/settings?
│  ├─ YES → How many settings would you add?
│  │  ├─ 1-2 → ✅ Add settings
│  │  └─ 3+ → ❌ Too complex for MVP
│  └─ NO → Continue
│
├─ Can users achieve their goal with the current features?
│  ├─ YES → ❌ Don't add more (show them how)
│  └─ NO → Continue
│
└─ Will it take more than 3 days to build?
   ├─ YES → ❌ Too much scope
   └─ NO → ✅ Consider adding (but wait for more user requests)
```

## Decision Tree: "Should I Optimize This?"

```
START: Considering optimization (performance, UX, design, etc.)

│
├─ What type of optimization?
│  ├─ Performance (load time, queries, etc.)
│  ├─ User Experience (flows, interactions, etc.)
│  ├─ Design (visual polish, animations, etc.)
│  └─ Code quality (architecture, patterns, etc.)
│
PERFORMANCE PATH:
├─ Is something actually slow for users?
│  ├─ NO → ❌ Don't optimize (it's fast enough)
│  └─ YES → Do you have metrics showing the bottleneck?
│     ├─ NO → ✅ Add metrics first, then optimize
│     └─ YES → ✅ Optimize the measured bottleneck
│
USER EXPERIENCE PATH:
├─ Are users complaining or getting stuck?
│  ├─ NO → ❌ Don't optimize (it's working)
│  └─ YES → ✅ Fix the specific pain point
│
DESIGN PATH:
├─ Is the current design preventing users from understanding the product?
│  ├─ YES → ✅ Fix the confusing parts
│  └─ NO → ❌ Don't optimize (function > form for MVP)
│
CODE QUALITY PATH:
├─ Is the code preventing you from shipping features?
│  ├─ YES → ✅ Refactor the blocking parts
│  └─ NO → ❌ Don't optimize (shipping > cleanliness)
```

## Decision Tree: "Should I Pivot or Persevere?"

```
START: Considering whether to continue with current approach

│
├─ How long have you been working on this?
│  ├─ < 2 weeks → ⏰ Too early to decide (keep building)
│  ├─ 2-4 weeks → Continue evaluation
│  └─ > 4 weeks without launch → 🚨 Ship something now
│
├─ Have you launched to real users?
│  ├─ NO → 🚨 Launch first (can't decide without user feedback)
│  └─ YES → Continue
│
├─ How many users have you shown this to?
│  ├─ < 5 → ⏰ Get more feedback (too small sample)
│  ├─ 5-20 → Continue evaluation
│  └─ 20+ → Continue
│
├─ What's the user response?
│  ├─ "This is amazing, where do I pay?" → ✅ PERSEVERE (you have PMF)
│  ├─ "This is cool, I'll try it" → ⏰ NEUTRAL (need more data)
│  ├─ "Interesting, but I'd need X" → Continue
│  └─ "Not for me" / polite disinterest → Continue
│
├─ Is the feedback about the CORE problem or EXECUTION?
│  ├─ "I don't have this problem" → 🔄 CONSIDER PIVOT (wrong problem)
│  ├─ "Your solution doesn't work well" → ⚙️ ITERATE (right problem, wrong solution)
│  ├─ "I need different features" → ⚙️ ITERATE (right direction, wrong scope)
│  └─ "It's too complicated" → ⚙️ ITERATE (simplify)
│
CONSIDER PIVOT PATH:
├─ Do you still believe in the problem?
│  ├─ NO → 🔄 PIVOT (find a new problem)
│  └─ YES → Did you talk to the right users?
│     ├─ NO → ⚙️ Find the right users first
│     └─ YES → 🔄 PIVOT (problem isn't real)
│
ITERATE PATH:
└─ Can you fix the issue in 1 week?
   ├─ YES → ⚙️ ITERATE (make the change, test again)
   └─ NO → Simplify the fix or 🔄 PIVOT
```

## Using These Decision Trees

### How to Use

1. **Start at the top** of the relevant tree
2. **Answer honestly** at each decision point
3. **Follow the path** based on your answer
4. **Accept the outcome** even if it's not what you wanted

### When Outcomes Feel Wrong

If a tree tells you "Don't build" and you disagree:
1. **Check your assumptions**: Are you solving a real problem or an imagined one?
2. **Look for red flags**: Are you using phrases from the anti-patterns file?
3. **Ask others**: Get external perspective
4. **Trust the process**: These trees are based on many failed MVPs

### Customizing Trees

These trees are guidelines, not laws. Customize them for your context, but beware of customizing them to avoid doing the hard work of shipping fast.

### Remember

The trees all push toward the same goal: **Ship fast, learn fast, iterate based on real feedback.**

If you find yourself frequently disagreeing with the trees, you might be optimizing for the wrong thing.
