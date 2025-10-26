# Setting Up Anthropic API Key for Content Generation

## Quick Setup (5 minutes)

### 1. Get Your API Key

**Option A: Existing Key**
- If you already have an Anthropic API key, use it

**Option B: Create New Key**
1. Go to: https://console.anthropic.com/
2. Sign in or create account
3. Navigate to: Settings → API Keys
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)

### 2. Set Environment Variable

**For Current Session (Temporary):**
```bash
export ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

**For Permanent Setup:**

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, or `~/.profile`):
```bash
echo 'export ANTHROPIC_API_KEY=sk-ant-your-api-key-here' >> ~/.bashrc
source ~/.bashrc
```

**OR** add to `.env.local`:
```bash
echo 'ANTHROPIC_API_KEY=sk-ant-your-api-key-here' >> .env.local
```

### 3. Verify Setup

```bash
# Check if key is set
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "❌ Not set";
else
  echo "✅ API key is configured";
fi
```

---

## What You Can Generate

Once the API key is set, you can use these commands:

### Generate Questions
```bash
# Generate 50 intermediate questions for "asking_questions" domain
npm run content:generate-questions -- --domain asking_questions --difficulty intermediate --count 50

# Generate questions for all domains
for domain in asking_questions refining_targeting taking_action navigation reporting; do
  npm run content:generate-questions -- --domain $domain --difficulty intermediate --count 40
done
```

### Generate Flashcards
```bash
# Generate 30 medium flashcards for "asking_questions" domain
npm run content:generate-flashcards -- --domain asking_questions --difficulty medium --count 30

# Generate flashcards for all domains
for domain in asking_questions refining_targeting taking_action navigation reporting; do
  npm run content:generate-flashcards -- --domain $domain --difficulty medium --count 35
done
```

### Generate Sample Content (Quick Test)
```bash
# Generates 50 questions + 30 flashcards automatically
npm run content:generate-sample
```

---

## Cost Estimates

**Claude 3.5 Sonnet Pricing:**
- Input: $3 per million tokens
- Output: $15 per million tokens

**Typical Generation Costs:**
- **Questions:** ~$0.003 per question (600 tokens)
- **Flashcards:** ~$0.002 per flashcard (400 tokens)

**Full Content Population:**
- 600 new questions: ~$1.80
- 500 flashcards: ~$1.00
- **Total: ~$2.80**

---

## Security Best Practices

### ❌ DO NOT:
- Commit API keys to git
- Share API keys publicly
- Use production keys in development

### ✅ DO:
- Use environment variables
- Keep keys in `.env.local` (already in `.gitignore`)
- Rotate keys periodically
- Set usage limits in Anthropic Console

---

## Troubleshooting

### Error: "ANTHROPIC_API_KEY environment variable not set"

**Fix:**
```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Error: "Invalid API key"

**Check:**
1. Key starts with `sk-ant-`
2. No extra spaces or quotes
3. Key hasn't been revoked in Anthropic Console

### Error: "Rate limit exceeded"

**Solutions:**
1. Wait 60 seconds and retry
2. Reduce batch size (use smaller `--count` values)
3. Check usage limits in Anthropic Console

---

## Next Steps After Setup

Once your API key is configured:

1. **Test generation:**
   ```bash
   npm run content:generate-sample
   ```

2. **Import generated content:**
   ```bash
   npm run content:import-all
   ```

3. **Verify in database:**
   ```bash
   npm run content:test-mock-exams
   ```

4. **Start full content population:**
   - Follow `README_CONTENT_POPULATION.md` Week 1-2 plan
   - Generate 600 questions across all domains
   - Generate 500 flashcards for comprehensive coverage

---

## Support

- **Anthropic Docs:** https://docs.anthropic.com/
- **API Key Issues:** https://console.anthropic.com/settings/keys
- **Content Generation Issues:** See `README_CONTENT_POPULATION.md` → Troubleshooting

---

**Ready to generate content! 🚀**
