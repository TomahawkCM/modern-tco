#!/bin/bash

# Vercel Production Deployment Script
# This script sets all required environment variables and deploys to production

echo "🚀 Modern Tanium TCO - Vercel Production Deployment"
echo "=================================================="
echo ""

# Check if logged in to Vercel
if ! vercel whoami > /dev/null 2>&1; then
    echo "❌ Not logged in to Vercel. Please run: vercel login"
    exit 1
fi

echo "✅ Logged in to Vercel as: $(vercel whoami)"
echo ""

# Set production environment variables
echo "📋 Setting production environment variables..."
echo ""

# Critical Supabase variables
echo "Setting Supabase environment variables..."
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://qnwcwoutgarhqxlgsjzs.supabase.co" 2>/dev/null || echo "  ⚠️  NEXT_PUBLIC_SUPABASE_URL already exists"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud2N3b3V0Z2FyaHF4bGdzanpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NzM0MjgsImV4cCI6MjA3MjI0OTQyOH0.nooeC4pyNsoRok5zKat9iwUk9rgCfz_b5SWqZ7_dgtQ" 2>/dev/null || echo "  ⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY already exists"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud2N3b3V0Z2FyaHF4bGdzanpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY3MzQyOCwiZXhwIjoyMDcyMjQ5NDI4fQ.U_FDgUC__dtFPVd5jrTpmwaWiDWJ701w4lRbe4qy1T4" 2>/dev/null || echo "  ⚠️  SUPABASE_SERVICE_ROLE_KEY already exists"

# App configuration
echo "Setting app configuration..."
vercel env add NEXT_PUBLIC_APP_NAME production <<< "Tanium Certified Operator Exam" 2>/dev/null || echo "  ⚠️  NEXT_PUBLIC_APP_NAME already exists"
vercel env add NEXT_PUBLIC_APP_VERSION production <<< "1.0.0" 2>/dev/null || echo "  ⚠️  NEXT_PUBLIC_APP_VERSION already exists"

# Production settings
echo "Setting production flags..."
vercel env add NODE_ENV production <<< "production" 2>/dev/null || echo "  ⚠️  NODE_ENV already exists"
vercel env add NEXT_PUBLIC_DEV_MODE production <<< "false" 2>/dev/null || echo "  ⚠️  NEXT_PUBLIC_DEV_MODE already exists"

# Analytics and monitoring (optional - will gracefully disable if not set)
echo "Setting analytics (optional)..."
vercel env add NEXT_PUBLIC_ANALYTICS_ENABLED production <<< "true" 2>/dev/null || echo "  ⚠️  NEXT_PUBLIC_ANALYTICS_ENABLED already exists"

# Exam configuration
echo "Setting exam configuration..."
vercel env add NEXT_PUBLIC_EXAM_TIME_LIMIT production <<< "5400" 2>/dev/null || echo "  ⚠️  NEXT_PUBLIC_EXAM_TIME_LIMIT already exists"
vercel env add NEXT_PUBLIC_PRACTICE_QUESTION_LIMIT production <<< "50" 2>/dev/null || echo "  ⚠️  NEXT_PUBLIC_PRACTICE_QUESTION_LIMIT already exists"
vercel env add NEXT_PUBLIC_MOCK_QUESTION_COUNT production <<< "90" 2>/dev/null || echo "  ⚠️  NEXT_PUBLIC_MOCK_QUESTION_COUNT already exists"

# Feature flags
echo "Setting feature flags..."
vercel env add NEXT_PUBLIC_PWA_ENABLED production <<< "true" 2>/dev/null || echo "  ⚠️  NEXT_PUBLIC_PWA_ENABLED already exists"
vercel env add NEXT_PUBLIC_OFFLINE_MODE production <<< "true" 2>/dev/null || echo "  ⚠️  NEXT_PUBLIC_OFFLINE_MODE already exists"
vercel env add NEXT_PUBLIC_BASE_PATH production <<< "" 2>/dev/null || echo "  ⚠️  NEXT_PUBLIC_BASE_PATH already exists"

echo ""
echo "✅ Environment variables set successfully"
echo ""

# Show current environment variables
echo "📋 Current environment variables:"
vercel env ls | head -20
echo ""

# Ask for confirmation before deploying
read -p "🚀 Ready to deploy to production? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Deploying to production..."
    echo ""

    # Deploy to production
    vercel --prod

    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📊 Next steps:"
    echo "  1. Check deployment status in Vercel dashboard"
    echo "  2. Test production URL"
    echo "  3. Monitor for errors in first hour"
    echo "  4. Verify Supabase connection"
    echo ""
else
    echo ""
    echo "❌ Deployment cancelled"
    echo ""
    echo "To deploy manually, run:"
    echo "  vercel --prod"
    echo ""
fi
