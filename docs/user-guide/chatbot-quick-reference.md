# AI Chatbot Quick Reference

**Quick guide for common chatbot queries**

---

## 🚀 Quick Start

**Open Chatbot**: Click chat icon (bottom-right) or press `Ctrl + /` (Windows) / `Cmd + /` (Mac)

**First Questions to Try**:

1. "Hello" → Get welcome message
2. "How much did I spend this month?" → Total spending
3. "Help" → See all example questions

---

## 💬 Common Questions by Category

### Spending Analysis

| Question                                 | What It Does                             |
| ---------------------------------------- | ---------------------------------------- |
| "How much did I spend this month?"       | Total expenses for current month         |
| "What are my top 5 spending categories?" | Breakdown of highest spending categories |
| "Show me all Starbucks transactions"     | Filter by merchant name                  |
| "How much did I spend on groceries?"     | Category-specific total                  |
| "What did I buy yesterday?"              | All transactions from yesterday          |

### Budget Status

| Question                           | What It Does                    |
| ---------------------------------- | ------------------------------- |
| "Am I under budget this month?"    | Overall budget health check     |
| "How much budget do I have left?"  | Remaining amounts by category   |
| "Am I over budget for dining out?" | Specific category budget status |
| "Show my budget progress"          | Visual breakdown of all budgets |

### Income & Savings

| Question                                 | What It Does                   |
| ---------------------------------------- | ------------------------------ |
| "How much income did I earn this month?" | Total income for current month |
| "What's my net savings this month?"      | Income minus expenses          |
| "Show my income trends"                  | Historical income chart        |

### Trends & Comparisons

| Question                              | What It Does               |
| ------------------------------------- | -------------------------- |
| "Compare this month to last month"    | Month-over-month spending  |
| "Am I spending more this month?"      | Trend analysis             |
| "Show my spending trend for the year" | Annual spending chart      |
| "What's my average weekly spending?"  | Weekly average calculation |

### Quick Actions (Coming Soon)

| Command                            | What It Does           |
| ---------------------------------- | ---------------------- |
| "Add $50 grocery expense"          | Create new transaction |
| "Set a $300 grocery budget"        | Create new budget      |
| "Find transactions from last week" | Search by date range   |

---

## 🎯 Tips for Better Questions

### ✅ Good Questions (Specific)

- "How much did I spend on **groceries** **this month**?"
- "Show me transactions from **last week**"
- "What's my **dining out** budget status?"

### ❌ Avoid (Too Vague)

- "How am I doing?" → Ask about specific category or time period
- "My money" → Specify what you want to know
- "Everything" → Break into smaller questions

---

## ⌨️ Keyboard Shortcuts

| Action        | Shortcut                |
| ------------- | ----------------------- |
| Open Chatbot  | `Ctrl + /` or `Cmd + /` |
| Close Chatbot | `Esc`                   |
| Send Message  | `Enter`                 |
| New Line      | `Shift + Enter`         |
| Clear Input   | `Esc` (when focused)    |

---

## 🔧 Chat Commands

Type these in the chatbot:

- `/help` → Show all example questions
- `/clear` → Clear conversation history
- `/export` → Export chat to text file
- `/feedback` → Send feedback

---

## 🚨 Troubleshooting

**Chatbot not responding?**

1. Check internet connection
2. Verify AI Features are enabled (Settings → Privacy)
3. Refresh the page (F5)

**Wrong data shown?**

1. Verify transactions are categorized correctly
2. Check date filters in Transactions page
3. Look for duplicate transactions

**"I don't understand" error?**

- Rephrase in simpler language
- Use example questions as templates
- Check for typos in category names

---

## 📊 Understanding Responses

**Text Answer**: Simple response

> "You spent $347.50 on groceries this month."

**Chart/Visualization**: Data shown graphically

> [Spending breakdown pie chart]

**Action Confirmation**: Transaction or budget created

> "✅ Added $50 grocery transaction. Anything else?"

---

## 🔒 Privacy

**What's sent to OpenAI (if AI enabled)**:

- Category names (e.g., "Groceries")
- Amounts and dates
- Cleaned merchant names (e.g., "Amazon" not "AMAZON.COM\*XY1234")

**NEVER sent**:

- Account numbers
- Full merchant details
- Personal information
- Bank names

**Disable AI**: Settings → Privacy & AI Controls → Toggle OFF

---

## 📱 Mobile Tips

**Voice Input** (Coming Soon): Tap microphone icon to speak your question

**Quick Suggestions**: Tap suggested questions instead of typing

**Swipe to Close**: Swipe down to close chat window (mobile)

---

## 💡 Pro Tips

1. **Ask follow-up questions**: Chatbot remembers last 20 messages
   - "How much on groceries?" → "What about last month?"

2. **Use relative dates**: "this month", "last week", "yesterday"
   - Works better than "November 2025"

3. **Reference by merchant**: "Show all Walmart transactions"
   - No need for exact spelling

4. **Check suggested questions**: Click "Help" for context-aware suggestions

5. **Export conversations**: Save helpful analyses with `/export`

---

## 🎓 Example Conversation

```
You: "Hello"
Bot: "Hi! I'm your budget assistant. How can I help you today?"

You: "How much did I spend on groceries this month?"
Bot: "You spent $347.50 on groceries in November across 12 transactions."

You: "What about last month?"
Bot: "In October, you spent $412.75 on groceries. That's $65.25 more than this month."

You: "Why the difference?"
Bot: "Looking at your data, you had 3 Costco trips in October vs 1 this month.
Your average grocery transaction was also higher ($34.40 vs $28.96)."

You: "Thanks!"
Bot: "You're welcome! Anything else I can help with?"
```

---

## 📖 More Help

- **Full Guide**: See [Chatbot User Guide](./chatbot-guide.md)
- **Technical Docs**: See [Technical Architecture](../CHATBOT_TECHNICAL_ARCHITECTURE.md)
- **Support**: Click "Report Issue" in Settings

---

**Last Updated**: November 9, 2025
**Version**: 1.0
