---
name: privacy-marketing
description: Use when writing privacy-focused marketing copy, security documentation, trust signals, or competitive privacy comparisons.
---

# Privacy Marketing

## Overview

Crafts marketing messaging around the budget app's privacy-first architecture — E2E encryption, zero-knowledge design, and local-first data storage. Positions the app as "the ProtonMail of personal finance" with clear, non-technical explanations that build trust.

## When to Use

- Writing landing page copy about privacy features
- Creating security documentation for users
- Building trust signal badges and explanations
- Writing competitive privacy comparison content
- Explaining zero-knowledge architecture to non-technical users

## Core Principles

- **Simple language** — "Your data is encrypted on your device" not "AES-256-GCM with PBKDF2"
- **Honest claims** — Only claim what the architecture actually guarantees
- **Show, don't tell** — Diagrams, comparisons, and specific guarantees > vague promises
- **Competitive context** — Show how we differ from alternatives
- **Trust through transparency** — Explain how it works, not just that it works

## Workflow

### Step 1: Core Privacy Messages

```markdown
## Headline Messages (pick based on context)

1. "Your finances. Your eyes only."
2. "We can't see your data. By design."
3. "The budget app that can't spy on you."
4. "Zero-knowledge budgeting — even we can't read your data."
5. "ProtonMail for your finances."

## Supporting Messages

- "All your financial data is encrypted on your device before it goes anywhere."
- "No employee, hacker, or government subpoena can access your data — because we literally don't have it."
- "Switch to airplane mode. Everything still works. That's not a bug — it's the design."
```

### Step 2: Non-Technical Encryption Explainer

```markdown
## How Your Data Stays Private

Think of it like a safe with a combination only you know:

1. **You set a passphrase** — This creates your personal encryption key
2. **Your data is locked** — Every transaction, budget, and goal is encrypted on your phone
3. **Only you have the key** — Your passphrase never leaves your device
4. **We see nothing** — Our servers store scrambled data that nobody can read without your key

### What this means:
- ✅ Your bank account info stays private
- ✅ Your spending habits are your business
- ✅ If our servers were hacked, attackers get gibberish
- ✅ We can't sell your data (we can't even see it)
- ✅ Works offline — your data lives on your device
```

### Step 3: Privacy Comparison Table

```markdown
## How We Compare

| Feature | Us | YNAB | Monarch | Copilot | Actual |
|---------|-----|------|---------|---------|--------|
| E2E Encryption | ✅ | ❌ | ❌ | ❌ | Partial |
| Zero-Knowledge | ✅ | ❌ | ❌ | ❌ | ✅ |
| Works Offline | ✅ | ❌ | ❌ | ❌ | ✅ |
| Data on Your Device | ✅ | ❌ | ❌ | ❌ | ✅ |
| No Account Required | ✅ | ❌ | ❌ | ❌ | ✅ |
| Can Read Your Data | ❌ We can't | ✅ They can | ✅ They can | ✅ They can | ❌ They can't |
| Bank Sync | Coming | ✅ | ✅ | ✅ | ❌ |
| Data Sold to 3rd Parties | Never | No* | No* | No* | Never |

*Per privacy policy; they have the technical ability to access data
```

### Step 4: Trust Signals

```markdown
## Trust Badges

🔒 **End-to-End Encrypted** — AES-256-GCM, the same encryption used by banks and governments

🏠 **Local-First** — Your data lives on your device, not in our cloud

👁️ **Zero-Knowledge** — We mathematically cannot access your financial data

🌐 **Open Architecture** — Our encryption approach is documented and auditable

📱 **Works Offline** — Full functionality without internet — because your data is already on your device

🚫 **No Ads, No Data Sales** — We make money from the product, not from your data
```

### Step 5: Security Architecture Summary (User-Facing)

```markdown
## Technical Details (for those who want them)

- **Encryption**: AES-256-GCM (Advanced Encryption Standard)
- **Key Derivation**: PBKDF2 with 600,000 iterations
- **Key Storage**: Your encryption key exists only in your device's memory while the app is open
- **Data Storage**: Encrypted in your browser's IndexedDB
- **Cloud Sync** (optional): Only encrypted data (ciphertext) is transmitted
- **Authentication**: Standard auth protects your account; encryption protects your data

Even if someone gains access to our servers, your storage, or intercepts your data in transit — all they get is meaningless encrypted bytes.
```

### Step 6: FAQ Responses

```markdown
Q: What happens if I forget my passphrase?
A: Since we use zero-knowledge encryption, we cannot reset your passphrase or recover your data. We recommend storing your passphrase in a password manager.

Q: Is my data backed up?
A: When cloud sync is enabled, your encrypted data is backed up to our servers. Only you can decrypt it.

Q: Can law enforcement access my data?
A: We can only provide encrypted data in response to legal requests. Without your passphrase, this data is unreadable.

Q: What if your company shuts down?
A: Your data lives on your device. The app works fully offline. You can export your data at any time.
```

## Key Files

| File | Role |
|------|------|
| `src/lib/encryption/` | Encryption implementation (for accuracy) |
| `.claude/Skills/references/encryption-architecture.md` | Technical encryption details |
| `docs/PRIVACY.md` | Privacy documentation |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using jargon ("AES-256-GCM") in user-facing copy | Translate to "bank-grade encryption" or simpler |
| Claiming "unhackable" or "100% secure" | Claim "designed so we can't access your data" |
| Not acknowledging limitations | Be honest about passphrase recovery limitation |
| Ignoring competitor claims | Directly compare with specific alternatives |
| Marketing privacy without technical backing | Every claim must map to actual architecture |

## Validation Checklist

- [ ] All privacy claims match actual architecture
- [ ] Non-technical explainer is understandable by non-tech users
- [ ] Comparison table is accurate and current
- [ ] Trust signals link to deeper explanations
- [ ] FAQ addresses common concerns
- [ ] No use of "unhackable" or absolute security claims
- [ ] Passphrase recovery limitation disclosed

## Related Skills

- `e2e-encryption` — technical encryption implementation
- `competitive-monitor` — competitor privacy comparison
- `marketing-writer` — general marketing content creation
