# Vercel Deployment - 1-Minute Quickstart

## 🚀 Fastest Way to Deploy

```bash
# 1. Install Vercel CLI (first time only)
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy with automated script
./deploy-to-vercel.sh
```

**That's it!** Your app will be live in 2-5 minutes.

---

## 📋 If Script Doesn't Work

```bash
# Manual deployment (3 commands)
vercel login
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel --prod
```

---

## ✅ Verify It's Working

```bash
# Check deployment status
vercel ls

# View logs
vercel logs --prod

# Test health endpoint
curl https://your-app.vercel.app/api/health
```

---

## 🔄 Re-Deploy After Changes

```bash
# Option 1: Auto-deploy (push to main branch)
git add .
git commit -m "Your changes"
git push origin main
# Vercel auto-deploys!

# Option 2: Manual deploy
vercel --prod
```

---

## 📚 Need More Info?

See **[HOW_TO_DEPLOY_TO_VERCEL.md](./HOW_TO_DEPLOY_TO_VERCEL.md)** for:
- Detailed step-by-step instructions
- Environment variable setup
- Troubleshooting guide
- Monitoring and rollback procedures

---

**Quick Links:**
- Vercel Dashboard: https://vercel.com/dashboard
- Deployment Script: `./deploy-to-vercel.sh`
- Full Guide: `HOW_TO_DEPLOY_TO_VERCEL.md`
