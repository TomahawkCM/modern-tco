# Marketing Templates

## Brand Voice Guidelines

**Tone**: Casual and direct, like talking to a friend  
**Avoid**: Corporate buzzwords, cringe marketing speak, hype  
**Focus**: Real benefits, not features dressed up  
**Language**: Simple, no jargon unless necessary

## Landing Page Feature Sections

Use the **Problem → Solution → Benefit** format for each feature section.

### Template Structure

```markdown
### [Feature Name]

**The problem**: [Describe the pain point in 1-2 sentences. Make it relatable.]

**How it works**: [Explain the solution simply. Focus on what the user does, not the tech.]

**Why it matters**: [The real-world benefit. What does this change for them?]
```

### Example 1: Smart Categorization

```markdown
### Your AI Learns Your Spending

**The problem**: Manually categorizing hundreds of transactions every month is tedious. And every budget app makes you start from scratch when you switch.

**How it works**: Upload your bank statement and the app automatically categorizes each transaction. When it gets something wrong, just correct it. The AI remembers and gets smarter each time.

**Why it matters**: After your first month, you'll barely need to touch anything. The app knows your Loblaws purchases are groceries and your Tim's runs are coffee. Saves you 15 minutes every time you import statements.
```

### Example 2: Privacy-First Design

```markdown
### Your Money Stays Yours

**The problem**: Traditional budget apps store your financial data on their servers. You're trusting them with your most sensitive information—and they can change terms, get hacked, or shut down anytime.

**How it works**: Everything runs in your browser. Your transaction data, account balances, and spending history never leave your computer. No accounts to create, no servers to trust.

**Why it matters**: Zero risk of data breaches. No one can see your finances except you. And you can export everything as a backup file whenever you want.
```

### Example 3: Canadian-First

```markdown
### Built for Canadian Banks

**The problem**: Most budget apps are designed for Americans. They don't recognize Canadian merchants, support our bank formats, or handle multiple currencies properly.

**How it works**: Pre-configured to recognize Tim Hortons, Loblaws, Canadian Tire, Rogers—50+ Canadian merchants. Direct import support for BMO and Home Trust, with generic CSV support for any Canadian bank.

**Why it matters**: No manual setup. No teaching the app what "INTERAC" means. It just works with your Canadian financial life.
```

## Tweet Thread Template

Structure: **Hook → Build Credibility → Show Value → CTA**

### Template

```
🧵 [Number]-tweet thread on [topic]

1/ [Hook - Start with a surprising fact, bold claim, or relatable pain point]

2/ [Context - Why this matters. Set up the problem.]

3/ [Credibility - Your experience or what you learned]

4/ [The solution - Introduce your approach/feature]

5/ [How it works - Simple explanation]

6/ [The benefit - Real-world impact]

7/ [Extra benefit or feature if relevant]

8/ [CTA - What to do next. Keep it low-pressure.]
```

### Example Thread: Privacy-First Budgeting

```
🧵 7-tweet thread on why I built a budget app that never sees your data

1/ Every budget app wants your bank login credentials.

Think about that. You're giving a random company full access to your financial accounts. To a startup that might not exist in 2 years.

2/ I tried all the popular apps: Mint, YNAB, PocketSmith. 

They're good apps! But every one required me to either:
- Hand over my bank credentials
- Upload statements to their servers
- Trust their "we encrypt everything" promises

3/ Here's what bugged me: I'm a developer. I know how data breaches happen.

Your encrypted data is only as secure as their authentication system. And every company eventually has a breach or gets acquired.

4/ So I built something different: a budget app that runs 100% in your browser.

No servers. No accounts. No API keys. Your transaction data literally never leaves your computer.

5/ How? IndexedDB stores everything locally. TensorFlow.js does the categorization on your device. Import a CSV, and the app learns your spending patterns—without sending anything anywhere.

6/ The wild part: it works better this way.

Faster (no API calls), free forever (no servers to pay for), and works offline. Your privacy isn't a compromise—it makes the app better.

7/ Try it yourself: [link]

No signup required. Import a statement and poke around. If you don't like it, close the tab. Nothing to unsubscribe from.
```

### Example Thread: Feature Launch - Retirement Planner

```
🧵 5-tweet thread on the retirement calculator I just shipped

1/ Most retirement calculators make you feel stupid.

Enter your current savings, expected return, retirement age, and 12 other fields. Then they spit out a number that's either "you're screwed" or "you'll be fine" with zero nuance.

2/ The one I just built takes a different approach:

Show me what happens if I save $X per month. Show me when I can retire if I want $Y annual income. Let me play with the numbers until it clicks.

3/ It's visual: drag a slider, see your retirement age change in real time.

Want to retire at 55? Here's how much you need to save. Want to save $500/month? Here's your projected retirement age. No spreadsheets, no intimidation.

4/ And because it's built into a budget app, it knows your actual spending.

It can suggest realistic savings targets based on what you're spending right now. Not some generic "save 15%" advice.

5/ Check it out in the household budget app: [link]

Under the Retirement tab. Play with it for 30 seconds and you'll get more clarity than an hour of googling "retirement calculator canada".
```

## Launch Email Template

Structure: **Personal opening → Specific value prop → Easy CTA**

### Template

```
Subject: [Straightforward subject - what you built]

Hey [Name/there],

[Personal sentence - Why you're reaching out or what prompted this]

[1-2 sentences on what you built and why]

[Core benefit - What changes for them?]

[How to use it - Simple next step]

[Optional: One specific feature or use case that might resonate]

[Low-pressure CTA]

Thanks,
[Your name]

P.S. [Optional afterthought - removes sales pressure]
```

### Example 1: Initial Launch

```
Subject: Budget app that actually respects your privacy

Hey there,

I built something I wished existed: a budget tracker that doesn't ask for your bank credentials or store your data on anyone's servers.

It runs entirely in your browser. Import a CSV from your bank, and the app categorizes transactions using AI that runs on your computer. No accounts, no subscriptions, no servers.

Try it: [link]

Upload a statement and poke around. If you don't like it, close the tab—nothing to unsubscribe from. It's designed for Canadian banks (BMO and Home Trust work great), but handles any CSV.

The retirement planner is surprisingly good if you want to see when you can actually afford to quit working.

Let me know what you think.

[Your name]

P.S. It's free. I built it for myself and figured others might want it too.
```

### Example 2: Feature Launch

```
Subject: Added a retirement calculator (the visual kind)

Hey,

Quick update: I added a retirement planner to the budget app.

It's not your typical "enter 47 fields and get a vague answer" calculator. Drag sliders, see your retirement age update in real time. Want to retire at 55? It shows exactly how much you need to save per month.

Since it's built into the budget app, it knows your actual spending and can suggest realistic savings targets.

Check it out: [link] (under the Retirement tab)

Takes 30 seconds to play with and you'll get more clarity than googling "retirement calculator canada" for an hour.

[Your name]

P.S. Still 100% local, zero servers, your data stays on your device.
```

### Example 3: Holiday/Seasonal Angle

```
Subject: Get your budget sorted before the holidays

Hey,

November is when holiday spending sneaks up on everyone.

I use this budget app year-round, but it's especially useful right now: import your October statement, see where your money actually went, and set a realistic budget for November/December.

The AI categorization means you're not manually sorting through hundreds of transactions. Upload a CSV, correct anything it got wrong, and you're done in 5 minutes.

Try it: [link]

Works with any Canadian bank CSV. No account needed, everything stays on your device.

If nothing else, the dashboard will show you exactly how much you spent on coffee last month. (It's always more than you think.)

[Your name]

P.S. It's free. Built it for myself, sharing it in case it helps.
```

## Key Copywriting Principles

### Do This:
- Start with the problem, not the solution
- Use "you" language (not "users" or "people")
- Give specific examples (not abstract benefits)
- Admit limitations honestly
- Use concrete numbers when possible
- Write like you're explaining to a friend
- Lead with benefits, mention features only when needed
- Keep paragraphs short (2-3 sentences max)

### Don't Do This:
- Say "seamlessly integrate" (just say "works with")
- Use "leverage" or "utilize" (just say "use")
- Call anything "game-changing" or "revolutionary"
- Say "empower users" (gross)
- Use exclamation marks unless genuinely excited
- Over-promise or hype
- Make unfounded comparisons ("10x better than...")
- Use corporate jargon ("synergize," "solutions," "ecosystem")

## Writing Checklist

Before publishing any marketing copy, ask:

- [ ] Does it sound like something I'd say to a friend?
- [ ] Have I cut all the buzzwords?
- [ ] Is the benefit clear and specific?
- [ ] Would I roll my eyes reading this?
- [ ] Did I start with the problem or the solution?
- [ ] Is every sentence necessary?
- [ ] Have I been honest about limitations?
- [ ] Is it simple enough for my mom to understand?
