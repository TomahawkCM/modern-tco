# How to Deploy to Vercel - Quick Guide

**Last Updated:** October 2025  
**Project:** Modern Tanium TCO Learning Management System  
**Difficulty:** Easy (5 minutes with automated script)

---

## 🚀 Quick Start - Two Options

### Option 1: Automated Deployment (Recommended) ⚡

**The fastest way - just one command:**

```bash
./deploy-to-vercel.sh
```

This script will:
- ✅ Check you're logged into Vercel
- ✅ Set all environment variables automatically
- ✅ Ask for your confirmation
- ✅ Deploy to production

**That's it!** 🎉

---

### Option 2: Manual Deployment (Step-by-Step)

If you prefer to do it manually or want more control:

#### Step 1: Install Vercel CLI (if not installed)

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

This opens your browser to authenticate.

#### Step 3: Set Environment Variables

The app needs these critical variables:

```bash
# Supabase Configuration (Required)
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Enter: https://qnwcwoutgarhqxlgsjzs.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud2N3b3V0Z2FyaHF4bGdzanpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NzM0MjgsImV4cCI6MjA3MjI0OTQyOH0.nooeC4pyNsoRok5zKat9iwUk9rgCfz_b5SWqZ7_dgtQ

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud2N3b3V0Z2FyaHF4bGdzanpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY3MzQyOCwiZXhwIjoyMDcyMjQ5NDI4fQ.U_FDgUC__dtFPVd5jrTpmwaWiDWJ701w4lRbe4qy1T4

# Node Environment
vercel env add NODE_ENV production
# Enter: production
```

**Optional but recommended:**

```bash
vercel env add NEXT_PUBLIC_APP_NAME production
# Enter: Tanium Certified Operator Exam

vercel env add NEXT_PUBLIC_APP_VERSION production
# Enter: 1.0.0
```

#### Step 4: Deploy!

```bash
vercel --prod
```

Wait for the build to complete (usually 2-5 minutes).

---

## ✅ Verify Your Deployment

After deployment, test these:

### 1. Check the URL works
```bash
# Replace with your actual Vercel URL
curl https://your-app.vercel.app
```

### 2. Test the health endpoint
```bash
curl https://your-app.vercel.app/api/health
# Should return: {"status":"ok"}
```

### 3. Open in browser
- Visit your production URL
- Check for errors in browser console (F12 → Console)
- Test login/signup
- Verify study modules load

---

## 📋 Prerequisites Checklist

Before deploying, make sure:

- [ ] You have a Vercel account (free tier works!)
- [ ] Node.js 18+ is installed: `node --version`
- [ ] Your code builds locally: `npm run build`
- [ ] You have Supabase credentials (URL and keys)
- [ ] You're on the correct git branch

---

## 🔧 Troubleshooting

### "vercel: command not found"
```bash
npm install -g vercel
```

### "Not logged in"
```bash
vercel login
```

### Build fails with TypeScript errors
```bash
# Check locally first
npm run check-types

# If clean, force redeploy
vercel --prod --force
```

### Environment variables not working
```bash
# List all env vars
vercel env ls

# Remove and re-add if needed
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production
```

### Deploy script permission denied
```bash
chmod +x deploy-to-vercel.sh
./deploy-to-vercel.sh
```

---

## 🎯 Common Use Cases

### Deploy latest code
```bash
git add .
git commit -m "Your changes"
git push origin main
# Vercel auto-deploys on push to main!
```

### Deploy from feature branch
```bash
vercel
# Creates preview deployment (not production)
```

### Rollback to previous version
```bash
vercel ls  # List deployments
vercel rollback <deployment-url>
```

### Check deployment logs
```bash
vercel logs --prod
```

---

## 🌐 Continuous Deployment (Auto-Deploy)

**Good news:** Vercel automatically deploys when you push to your main branch!

1. Connect your GitHub repo to Vercel (first time only)
2. Push to `main` branch
3. Vercel detects the push and builds automatically
4. Your site updates automatically ✨

### To enable auto-deploy:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Git
4. Connect your repository
5. Set `main` as production branch

Done! Now every push to `main` automatically deploys.

---

## 📊 Monitoring Your Deployment

### Vercel Dashboard
- **URL:** https://vercel.com/dashboard
- **Monitor:** Traffic, errors, build times, bandwidth

### Supabase Dashboard  
- **URL:** https://supabase.com/dashboard
- **Monitor:** Database activity, API requests, storage

### Quick Health Check
```bash
# Save this as check-health.sh
curl https://your-app.vercel.app/api/health && echo "✅ App is healthy!"
```

---

## 🚨 Emergency Procedures

### App is down!
1. Check Vercel status: https://vercel.com/status
2. Check Supabase status: https://status.supabase.io
3. View logs: `vercel logs --prod`
4. Rollback if needed: `vercel rollback <previous-deployment-url>`

### Need to rollback immediately?
```bash
vercel ls  # Find last working deployment
vercel rollback <that-deployment-url>  # Instant rollback
```

---

## 📚 Additional Resources

For more detailed information, see:

- **Comprehensive Guide:** `DEPLOYMENT_INSTRUCTIONS.md`
- **Production Readiness:** `PRODUCTION_READINESS_FINAL.md`
- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment

---

## 💡 Pro Tips

1. **Test locally first:** Always run `npm run build` locally before deploying
2. **Use preview deployments:** Push to feature branches for testing
3. **Monitor the first hour:** Watch for errors after each production deployment
4. **Set up alerts:** Configure Vercel to notify you of deployment failures
5. **Use environment variables:** Never commit secrets - always use Vercel env vars

---

## ❓ Still Need Help?

1. **Check the logs:** `vercel logs --prod`
2. **Review documentation:** Look at `DEPLOYMENT_INSTRUCTIONS.md` for detailed info
3. **Vercel Support:** https://vercel.com/support
4. **Next.js Discord:** https://nextjs.org/discord

---

**Happy Deploying! 🚀**

Remember: The automated script (`./deploy-to-vercel.sh`) is your friend - use it!
