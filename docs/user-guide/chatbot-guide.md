# AI Chatbot User Guide

**Status**: Coming Soon
**Last Updated**: November 9, 2025
**Version**: 1.0 (Documentation)

---

## 📋 Table of Contents

- [What is the AI Chatbot?](#what-is-the-ai-chatbot)
- [Getting Started](#getting-started)
- [Example Queries](#example-queries)
- [Capabilities](#capabilities)
- [Limitations](#limitations)
- [Privacy & Data](#privacy--data)
- [Troubleshooting](#troubleshooting)
- [Advanced Features](#advanced-features)

---

## What is the AI Chatbot?

The Budget App Chatbot is your **personal finance assistant** powered by AI. Ask questions about your spending, budgets, and financial patterns in plain English - no need to learn complicated menus or reports.

### Key Features

- **Natural Language**: Ask questions like you'd ask a friend
- **Smart Analysis**: Get insights from your transaction history
- **Quick Actions**: Add transactions or create budgets using voice commands
- **Private & Secure**: Conversations happen in your browser, data stays on your device

### How It Works

1. You ask a question (e.g., "How much did I spend on groceries this month?")
2. The chatbot analyzes your local transaction data
3. You get an instant answer with helpful charts or suggestions
4. No data is stored on servers - everything is private

---

## Getting Started

### Accessing the Chatbot

**Method 1: Chat Icon (Recommended)**

- Look for the **chat bubble icon** in the bottom-right corner
- Click to open the chat window
- Type your question and press Enter

**Method 2: Keyboard Shortcut**

- Press **Ctrl + /** (Windows) or **Cmd + /** (Mac)
- Chat window opens instantly
- Start typing your question

**Method 3: Menu**

- Tap **More** → **AI Assistant**
- Opens full-screen chat interface

### Your First Question

Try one of these starter questions:

1. **"Hello"** - Get a friendly greeting and suggested questions
2. **"How much did I spend this month?"** - See total spending
3. **"Show me my top expenses"** - View biggest spending categories
4. **"Help"** - See list of example questions

### Understanding Responses

The chatbot responds in three ways:

1. **Text Answer**: Simple text response
2. **Data Visualization**: Chart or graph showing your data
3. **Action Confirmation**: "I added a $50 grocery transaction. Anything else?"

---

## Example Queries

### Spending Analysis

**Basic Spending**

- "How much did I spend this month?"
- "What did I spend yesterday?"
- "Show total expenses for September"

**Category Breakdown**

- "How much did I spend on groceries?"
- "What are my top 5 spending categories?"
- "Show me dining out expenses this week"

**Comparison**

- "Am I spending more this month than last month?"
- "Compare my grocery spending for the past 3 months"
- "How does this month compare to my average?"

**Specific Transactions**

- "Show all transactions from Starbucks"
- "Find transactions over $100"
- "What did I buy at Amazon this month?"

### Budget Status

**Overall Budget**

- "Am I under budget this month?"
- "How much budget do I have left?"
- "Show my budget progress"

**Category Budgets**

- "How much of my grocery budget have I used?"
- "Am I over budget for dining out?"
- "How many days left in my entertainment budget?"

**Budget Alerts**

- "Warn me when I'm close to my budget limit"
- "Which budgets am I close to exceeding?"

### Income & Savings

**Income Tracking**

- "How much income did I earn this month?"
- "Show my income trends for the year"
- "What's my average monthly income?"

**Savings Analysis**

- "What's my net savings this month?" (Income - Expenses)
- "Am I saving more this month?"
- "Show my savings rate"

### Trends & Patterns

**Spending Patterns**

- "What's my average weekly spending?"
- "When do I spend the most money?" (Day of week / time of month)
- "Show my spending trend for the year"

**Recurring Expenses**

- "What are my recurring monthly expenses?"
- "Find my subscription costs"
- "List bills due this month"

### Quick Actions (Coming Soon)

**Add Transactions**

- "Add $50 grocery expense from Walmart"
- "Log $3.75 coffee purchase"
- "Record $120 electric bill"

**Create Budgets**

- "Set a $300 grocery budget for this month"
- "Create a $150 dining out budget"
- "Make a $100 entertainment budget"

**Search & Filter**

- "Show transactions from last week"
- "Find all Uber charges"
- "Filter expenses over $200"

---

## Capabilities

### What the Chatbot CAN Do

✅ **Answer Questions**

- Spending totals by date, category, merchant
- Budget progress and remaining amounts
- Income summaries and trends
- Transaction searches and filters

✅ **Provide Insights**

- Identify top spending categories
- Compare time periods (month-to-month, year-to-year)
- Calculate averages and trends
- Flag unusual spending patterns

✅ **Data Visualization**

- Generate charts for spending breakdown
- Show budget progress bars
- Display trends over time
- Compare categories side-by-side

✅ **Helpful Suggestions**

- Recommend budget amounts based on past spending
- Suggest areas to cut costs
- Identify duplicate transactions
- Predict monthly totals

### Contextual Understanding

The chatbot understands:

- **Relative Dates**: "this month", "last week", "yesterday", "past 3 months"
- **Categories**: "groceries", "dining", "transportation" (and variations)
- **Amounts**: "$50", "fifty dollars", "under $100"
- **Merchants**: "Starbucks", "Amazon", "Walmart" (partial names work too)
- **Follow-up Questions**: Remembers context from previous questions

---

## Limitations

### What the Chatbot CANNOT Do

❌ **Financial Advice**: No investment recommendations or tax advice
❌ **External Data**: Can't access your bank account directly
❌ **Future Predictions**: Limited forecasting (basic trends only)
❌ **Complex Calculations**: No amortization or investment portfolio analysis
❌ **Personal Identification**: Doesn't store or remember your name or personal details

### Query Limitations

**Length**: Keep questions under 500 characters
**Complexity**: Ask one question at a time (avoid compound questions)
**Historical Data**: Can only analyze transactions you've entered
**Real-time**: No live stock prices or exchange rates

### When to Use Other Tools Instead

| Need                      | Better Tool         | Chatbot Alternative                       |
| ------------------------- | ------------------- | ----------------------------------------- |
| Add multiple transactions | Import CSV          | Ask to add one transaction at a time      |
| Detailed budget reports   | Reports section     | Ask for specific budget status            |
| Loan amortization         | Loans section       | Chatbot can't calculate complex schedules |
| Investment portfolio      | Investments section | Chatbot gives basic summaries only        |
| Edit transaction details  | Transactions list   | Chatbot can't edit existing entries yet   |

---

## Privacy & Data

### What Data the Chatbot Uses

**From Your Device**:

- Transaction amounts, dates, categories, descriptions
- Budget limits and progress
- Account balances (if entered)
- Category totals and trends

**NOT Used**:

- Your name or email
- Bank account numbers
- Credit card numbers
- Social Security numbers
- Passwords

### Where Data is Processed

1. **Your Browser**: All analysis happens locally (IndexedDB)
2. **OpenAI API** (Optional): If AI Features are enabled, cleaned transaction descriptions are sent for natural language understanding
3. **No Long-term Storage**: Conversations are NOT saved on servers

### What's Sent to OpenAI (If Enabled)

**Example of what's sent**:

```
User: "How much did I spend on groceries this month?"
Sent: "groceries" + [cleaned transaction data: dates, amounts, categories]
NOT sent: Account numbers, full merchant names, personal info
```

**Data Minimization**:

- Only **category names** and **amounts** are sent
- Merchant names are cleaned (e.g., "AMAZON.COM\*XY1234" → "Amazon")
- Dates are relative (e.g., "this month" instead of "October 2025")
- No account identifiers

### Disabling AI Features

To turn off AI chatbot:

1. Go to **Settings** → **Privacy & AI Controls**
2. Toggle **"AI Features (Master Switch)"** to OFF
3. Chatbot will no longer use OpenAI (local-only mode with limited NLP)

---

## Troubleshooting

### Chatbot Not Responding

**Symptom**: You type a question, but nothing happens.

**Solutions**:

1. **Check internet connection** - Chatbot requires internet for AI features
2. **Verify AI Features are enabled**: Settings → Privacy & AI Controls → AI Features
3. **Refresh the page** (F5 or Ctrl+R)
4. **Clear browser cache**: Settings → Privacy → Clear Cache
5. **Check browser console** (F12) for error messages

### "I don't understand" Responses

**Symptom**: Chatbot says "I'm sorry, I don't understand that question."

**Solutions**:

1. **Rephrase your question** - Use simpler language
2. **Be specific** - Instead of "my spending", say "grocery spending this month"
3. **Use example queries** - Click "Help" to see suggested questions
4. **Check for typos** - Especially in category names or merchant names

**Example Rephrasing**:

- ❌ "What's the deal with my money situation?"
- ✅ "How much did I spend this month?"

### Incorrect Data in Responses

**Symptom**: Chatbot shows wrong amounts or dates.

**Solutions**:

1. **Verify your transactions** - Check Transactions list for accuracy
2. **Check date filters** - Make sure transactions are in the right date range
3. **Review categories** - Ensure transactions are categorized correctly
4. **Look for duplicates** - Duplicate transactions inflate totals

### Chatbot Too Slow

**Symptom**: Responses take more than 10 seconds.

**Solutions**:

1. **Check internet speed** - Slow connection affects AI response time
2. **Reduce data volume** - Asking about "all time" with 10,000 transactions takes longer
3. **Simplify query** - Ask about specific categories or time periods
4. **Close other tabs** - Free up browser memory

### Privacy Concerns

**Symptom**: You're unsure what data is being sent to OpenAI.

**Solutions**:

1. **Review Privacy Notice** - Settings → Privacy & AI Controls
2. **Disable AI Features** - Use chatbot in local-only mode (basic NLP only)
3. **Export your data** - See exactly what's stored (Settings → Export Data)
4. **Read data flow diagram** - docs/CHATBOT_TECHNICAL_ARCHITECTURE.md

---

## Advanced Features

### Conversation History

**Current Session**: Chatbot remembers your last 20 messages
**Export Conversation**: Click "Export Chat" to save as text file
**Clear History**: Click "New Conversation" to start fresh

### Custom Commands

**Shortcuts**:

- `/help` - Show all example queries
- `/clear` - Clear conversation history
- `/export` - Export conversation to text file
- `/feedback` - Send feedback about chatbot

### Suggested Questions

When you open the chatbot, you'll see:

- **Quick Insights**: "Top spending this month", "Budget status"
- **Trending**: "Spending vs last month", "Biggest expense today"
- **Smart Suggestions**: Based on recent activity (e.g., "You added 5 Amazon transactions - want a summary?")

### Multi-turn Conversations

The chatbot can handle follow-up questions:

**Example**:

```
You: "How much did I spend on groceries this month?"
Chatbot: "You spent $347.50 on groceries in November."

You: "What about last month?"
Chatbot: "In October, you spent $412.75 on groceries. That's $65.25 more than this month."

You: "Why the difference?"
Chatbot: "Looking at your transactions, you had 3 Costco trips in October vs 1 this month."
```

### Voice Input (Coming Soon)

**How it will work**:

1. Click the microphone icon
2. Speak your question
3. Chatbot converts speech to text
4. You can edit before sending
5. Press Enter to submit

**Supported Languages**: English (US, UK, AU), Spanish, French (planned)

---

## Tips for Better Chatbot Interactions

### Best Practices

**1. Be Specific**

- ❌ "How am I doing?"
- ✅ "How much did I spend on groceries this month?"

**2. Use Natural Language**

- ❌ "SELECT SUM(amount) FROM transactions WHERE category='Groceries'"
- ✅ "Total grocery spending"

**3. One Question at a Time**

- ❌ "Show me spending, budgets, and income for the year"
- ✅ "Show me spending for this year" → then ask about budgets

**4. Check Your Data First**

- Make sure transactions are entered correctly
- Verify categories are assigned
- Ensure dates are accurate

### Common Mistakes to Avoid

**Mistake 1**: Asking about categories that don't exist

- Check your category list first (Settings → Categories)

**Mistake 2**: Using vague time periods

- Instead of "recently", say "this week" or "past 7 days"

**Mistake 3**: Expecting the chatbot to know external data

- Chatbot can't look up gas prices or stock values

**Mistake 4**: Asking for financial advice

- Chatbot provides data insights, not investment recommendations

---

## Keyboard Shortcuts

| Action        | Windows/Linux                 | Mac                |
| ------------- | ----------------------------- | ------------------ |
| Open Chatbot  | `Ctrl + /`                    | `Cmd + /`          |
| Close Chatbot | `Esc`                         | `Esc`              |
| Send Message  | `Enter`                       | `Return`           |
| New Line      | `Shift + Enter`               | `Shift + Return`   |
| Clear Input   | `Esc` (when focused on input) | `Esc`              |
| Show Help     | `/help` + `Enter`             | `/help` + `Return` |

---

## Frequently Asked Questions

**Q: Is the chatbot always available?**
A: Yes, as long as AI Features are enabled in Settings. Works offline in limited mode.

**Q: Does the chatbot learn from my questions?**
A: No. Conversations are not stored or used to train AI models. Privacy first!

**Q: Can I use the chatbot on mobile?**
A: Yes! Works on all devices (phone, tablet, desktop).

**Q: How accurate are the chatbot's responses?**
A: Very accurate for data queries (spending totals, budgets). Insights and suggestions are best-effort estimates.

**Q: What if I find a bug or incorrect response?**
A: Click "Report Issue" in the chat window or go to Settings → Report Bug.

**Q: Can I suggest new chatbot features?**
A: Absolutely! Click "Feedback" in Settings or use the `/feedback` command in chat.

**Q: Will the chatbot work without internet?**
A: Basic queries yes, but AI-powered insights require internet (when AI Features are enabled).

---

## Example Use Cases

### Use Case 1: Monthly Budget Review

**Scenario**: You want to review how you did against your budget this month.

**Conversation**:

```
You: "How did I do on my budgets this month?"
Chatbot: "Here's your budget status for November:
- Groceries: $347 / $400 (87%) ✅
- Dining Out: $215 / $150 (143%) ❌ Over by $65
- Entertainment: $45 / $100 (45%) ✅
Overall: You're under budget by $93."

You: "Why am I over on dining out?"
Chatbot: "You had 12 restaurant transactions this month vs 8 last month.
Top spenders: Chipotle ($45), Olive Garden ($65), Starbucks ($35)."

You: "Can I afford to reduce my dining budget to $100?"
Chatbot: "Based on past 3 months, your average dining spending is $180.
A $100 budget might be too tight. Consider $150 as a realistic goal."
```

### Use Case 2: Unusual Spending Alert

**Scenario**: You get an alert about unusual spending.

**Conversation**:

```
Chatbot: "🚨 Unusual spending detected: You spent $250 on 'Electronics' today.
Your average daily electronics spending is $12. Want details?"

You: "Yes, show me"
Chatbot: "Transaction: Best Buy - $249.99 on 11/9/2025
This is 20x your average. Was this expected?"

You: "Yes, I bought a new tablet"
Chatbot: "Got it! I'll remember that. Would you like me to create a
'Big Purchases' category for items like this?"
```

### Use Case 3: Saving for a Goal

**Scenario**: You're saving for a vacation.

**Conversation**:

```
You: "I want to save $2000 for a vacation by June. How much should I save monthly?"
Chatbot: "It's November, so you have 7 months until June.
To save $2000, you need to save $285.71 per month.

Based on your current spending:
- Average monthly income: $4500
- Average monthly expenses: $3800
- Current monthly surplus: $700

✅ You can easily save $286/month! Want me to create a 'Vacation Fund' budget?"
```

---

## Getting the Most Out of Your Chatbot

### Daily Use

- **Morning**: "What did I spend yesterday?"
- **After Shopping**: "Add $47.50 grocery expense from Trader Joe's"
- **Evening**: "Am I under budget today?"

### Weekly Review

- **Monday**: "How much did I spend last week?"
- **Sunday**: "Compare this week's spending to last week"

### Monthly Review

- **1st of Month**: "Show budget status for last month"
- **Mid-Month**: "Am I on track with my budgets?"
- **End of Month**: "What are my top expenses this month?"

---

**Ready to try the chatbot?** Click the chat icon in the bottom-right corner and ask your first question!

**Need more help?** See [Getting Started Guide](./00-getting-started.md) or [Technical Documentation](../CHATBOT_TECHNICAL_ARCHITECTURE.md).

---

_Last Updated: November 9, 2025 | Version: 1.0 (Planning Documentation)_
_Chatbot feature coming soon - this guide is prepared in advance._
