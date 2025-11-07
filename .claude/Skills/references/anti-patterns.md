# Anti-Patterns: Common MVP Mistakes

This file catalogs common mistakes when building MVPs, with real examples and how to avoid them.

## The "We Need This First" Trap

### The Mistake

Building infrastructure, tooling, or foundation before validating the core idea.

### Real Example

**Project**: A tool to help developers find open source projects to contribute to.

**What happened**:
- Week 1-2: Set up microservices architecture "so it scales later"
- Week 3: Build comprehensive logging and monitoring "so we can debug issues"
- Week 4: Create a design system "so the UI is consistent"
- Week 5-6: Still haven't built the core search feature
- Result: Burned out, never launched

**What should have happened**:
- Week 1: Single Next.js app with hardcoded list of 50 projects, basic search
- Launch to 10 people
- See if anyone uses it twice
- Then decide what to build next

### How to Spot It

Red flag phrases:
- "We need to set up [X] first"
- "This will make future development faster"
- "Let's build it right from the start"
- "We'll save time later if we..."

### The Fix

Ask: "Can I prove the core value without this?"
- If yes → Don't build it yet
- If no → Build the absolute minimum version

## The "Just One More Feature" Spiral

### The Mistake

Continuously adding "small" features before launch because they seem obvious or easy.

### Real Example

**Project**: A simple habit tracker for morning routines.

**Original scope**:
- Track 3 habits per day (yes/no checkboxes)
- See streak counter

**The spiral**:
- "Users will want to customize the habits" → Add habit editor
- "Some habits aren't yes/no" → Add quantity tracking
- "People might want evening habits too" → Add multiple routine types
- "What if they miss a day?" → Add streak recovery logic
- "They'll want to see progress over time" → Add charts
- "What about sharing with friends?" → Add social features
- Result: 3 months later, still not shipped

**What should have happened**:
- Week 1: Hardcoded list of 5 common habits, yes/no only, streak counter
- Ship to yourself and 5 friends
- See what people actually ask for
- Build that next

### How to Spot It

Red flag phrases:
- "This is just a small addition"
- "It would be weird without [X]"
- "Users will definitely want..."
- "It's basically already built"

### The Fix

Write down every new feature idea → Put it in a "After Launch" list → Review after 10 real users give feedback

## The "Perfect Data Model" Trap

### The Mistake

Spending days designing the ideal database schema before understanding what data you actually need.

### Real Example

**Project**: A tool to track freelance project expenses.

**What happened**:
- Spent 3 days designing normalized database with 12 tables
- Created elaborate relationship diagrams
- Planned for multi-currency, tax rates, category hierarchies
- Built migration system for schema changes
- Never built the UI to actually enter expenses

**What should have happened**:
- Start with one table: expenses (id, description, amount, date)
- Build the UI to add expenses
- Show total
- Ship it
- Add complexity when you understand what's needed

### How to Spot It

Red flags:
- Drawing database diagrams before building UI
- More than 5 tables for an MVP
- Thinking about "data integrity" before having data
- Debating normalization strategies

### The Fix

Start with the absolute simplest schema that could possibly work. One table is often enough. Add tables only when you have concrete evidence you need them.

## The "It Needs Auth First" Block

### The Mistake

Assuming every app needs user accounts and authentication before providing value.

### Real Example

**Project**: A tool to estimate project timelines based on team size and features.

**The block**:
- "Users need to save their estimates" → Need auth
- Spent week implementing NextAuth
- Added password reset flow
- Built email verification
- Created user settings page
- Never built the actual estimation tool

**What should have happened**:
- Build the estimation calculator
- No accounts, no saving
- Just works immediately
- If people use it and ask "Can I save this?", then add auth

### Exceptions (When Auth IS the MVP)

Auth is core if:
- The product IS about identity (social network, dating app)
- Personal data is the feature (journal, health tracker where privacy matters)
- Sharing between users is the core loop

Otherwise, delay auth.

### Alternatives to Auth

1. **Local Storage**: Save state in browser, no server needed
2. **URL State**: Put everything in the URL, shareable by default
3. **Session Storage**: Temporary state that disappears when browser closes
4. **Magic Links**: Email-only, no passwords (for later, still not MVP)

### The Fix

Ask: "Does this work without knowing who you are?" If yes, build that version first.

## The "Pixel Perfect" Delay

### The Mistake

Obsessing over design details before validating if anyone wants the product.

### Real Example

**Project**: A tool to generate social media captions from photos.

**The delay**:
- Spent 2 weeks in Figma creating mockups
- Debated color schemes
- Created multiple button style variations
- Designed empty states for every scenario
- Built a component library
- Never generated a single caption

**What should have happened**:
- Ugly HTML form: upload photo → text box appears with caption
- Use default browser styling
- Ship in 1 day
- If people use it, make it prettier

### How to Spot It

Red flags:
- Opening Figma before writing code
- Debating font choices
- Creating design systems
- Talking about "brand identity"
- Multiple design iterations before v1

### The Fix

Brutal honesty: No one cares if your MVP is ugly. They care if it solves their problem. Ship ugly. Make it pretty if people care.

## The "What If" Spiral

### The Mistake

Planning for edge cases and hypothetical scenarios before handling the main case.

### Real Example

**Project**: A tool to split restaurant bills among friends.

**The spiral**:
- "What if someone leaves before the bill comes?" → Add early departure logic
- "What if someone doesn't drink alcohol?" → Add item-level attribution
- "What if the tip is included?" → Add tip detection
- "What if different people want different tip percentages?" → Add per-person tips
- "What if someone pays with points?" → Add non-cash payment tracking
- Result: Never shipped, app handles 1000 edge cases, main case isn't done

**What should have happened**:
- Split total amount by number of people
- Done
- Ship it
- Add complexity when actual users ask for it

### How to Spot It

Red flag phrases:
- "What if someone..."
- "What happens when..."
- "We need to handle the case where..."
- "But in some situations..."

### The Fix

Build for the 95% case. Ignore edge cases until they happen in production. Many edge cases never happen.

## The "Best Practices" Paralysis

### The Mistake

Trying to follow every development best practice before having anything to practice on.

### Real Example

**Project**: A simple bookmark manager.

**The paralysis**:
- "We should write tests first" → Set up testing framework
- "We need good error handling" → Create error boundary system
- "Code should be documented" → Write JSDoc for every function
- "Should we use Redux or Zustand?" → Spend 2 days researching
- "We need CI/CD" → Set up GitHub Actions
- "What about accessibility?" → Research ARIA patterns
- Result: Perfect development environment, no product

**What should have happened**:
- Single file React app
- Save bookmarks to localStorage
- No tests, no CI, minimal error handling
- Ship it, see if anyone uses it
- Add best practices when the stakes justify them

### When Best Practices Matter

- After product-market fit
- When multiple people use the code
- When bugs hurt real users
- When scaling becomes actual (not theoretical) problem

### The Fix

Accept that your MVP code will be "bad" by production standards. That's okay. Ship it, validate it, then decide if it's worth improving.

## The "Feature Parity" Trap

### The Mistake

Trying to match all features of existing solutions instead of doing one thing better.

### Real Example

**Project**: A note-taking app that's "simpler than Notion".

**The trap**:
- Notion has databases → We need databases
- Notion has templates → We need templates
- Notion has sharing → We need sharing
- Notion has API → We need API
- Result: Building Notion, but worse

**What should have happened**:
- Pick ONE thing Notion is bad at
- Build only that thing
- Be worse at everything else
- Ship it to people who care about that one thing

### How to Spot It

Red flags:
- Feature comparison spreadsheet
- "It needs to have everything [competitor] has"
- "Users expect these features"
- Trying to compete on breadth

### The Fix

Find the one thing you'll be best at. Cut everything else. Even if competitors have it. Especially if competitors have it.

## The "We'll Fix It Before Launch" Trap

### The Mistake

Accumulating a list of "must fix" items that prevent launch indefinitely.

### Real Example

**Project**: A tool to generate weekly newsletter drafts from RSS feeds.

**The list**:
- Fix: Mobile layout is broken
- Fix: Error handling on bad URLs
- Fix: Loading states aren't smooth
- Fix: Edge case when user has no feeds
- Fix: Typo in footer
- Fix: Email validation isn't strict enough
- Result: 20-item fix list, launch date keeps slipping

**What should have happened**:
- Ship with broken mobile layout
- Ship with rough error handling
- Launch to 10 people
- Ask what actually bothers them
- Fix that

### How to Spot It

Red flags:
- "Before we launch" list
- "Just need to fix X, Y, Z..."
- Moving launch date for non-critical issues
- Distinguishing between "bugs" and "improvements" (it's all improvements if no one's using it)

### The Fix

Set a hard launch date. Ship regardless. Users will tell you what actually matters. Most items on your "must fix" list don't matter.

## The "Scalability" Premature Optimization

### The Mistake

Optimizing for scale before having any users.

### Real Example

**Project**: A job board for design freelancers.

**The optimization**:
- "We'll need to handle thousands of jobs" → Set up Elasticsearch
- "Users will want instant search" → Implement search indexing
- "We'll have lots of traffic" → Set up Redis caching
- "Images will slow us down" → Implement CDN and image optimization
- Result: Over-engineered for 0 users

**What should have happened**:
- Store jobs in Supabase
- Use Postgres full-text search
- No caching
- Regular image uploads
- Ship it
- Optimize when you have actual performance problems

### When to Optimize

- When users complain about speed
- When you have performance metrics showing problems
- When scale is causing actual (not theoretical) issues

### The Fix

Build for 10 users. If you get 1000 users, you can afford to spend a week optimizing. If you never get users, you saved weeks of wasted optimization.

## Recognizing the Pattern

### Common Thread

All these anti-patterns share the same root:
- Solving problems you don't have yet
- Building for imaginary users instead of real ones
- Perfecting before validating
- Optimizing before launching

### The Antidote

1. **Ship something ugly that works**
2. **Get it in front of real people**
3. **Listen to what they actually struggle with**
4. **Build that next**

### Remember

- Perfect code for a product no one wants = 0 value
- Ugly code for a product people love = 100x value

Your job is to find out if anyone cares, as fast as possible. Everything else is procrastination.
