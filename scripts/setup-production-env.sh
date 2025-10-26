#!/bin/bash

# Production Environment Setup Script
# Modern Tanium TCO Learning Management System

set -e  # Exit on error

echo "=================================================="
echo "🚀 Production Environment Setup"
echo "Modern Tanium TCO LMS"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo "Install with: npm install -g vercel"
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI found${NC}"
echo ""

# Check if logged into Vercel
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged into Vercel${NC}"
    echo "Logging in..."
    vercel login
fi

VERCEL_USER=$(vercel whoami 2>&1 | tail -1)
echo -e "${GREEN}✅ Logged in as: ${VERCEL_USER}${NC}"
echo ""

# Check if project is linked
if [ ! -f ".vercel/project.json" ]; then
    echo -e "${YELLOW}⚠️  Project not linked to Vercel${NC}"
    echo "Linking project..."
    vercel link
fi

echo -e "${GREEN}✅ Project linked to Vercel${NC}"
echo ""

echo "=================================================="
echo "📋 Environment Variables Setup"
echo "=================================================="
echo ""

# Function to add environment variable
add_env_var() {
    local var_name=$1
    local var_description=$2
    local is_secret=${3:-false}

    echo ""
    echo -e "${YELLOW}Setting up: ${var_name}${NC}"
    echo "Description: ${var_description}"

    # Check if variable already exists
    if vercel env ls | grep -q "^${var_name} "; then
        echo -e "${GREEN}✅ ${var_name} already exists${NC}"
        read -p "Do you want to update it? (y/N): " update_var
        if [[ ! $update_var =~ ^[Yy]$ ]]; then
            return 0
        fi
        # Remove existing variable
        vercel env rm "${var_name}" production --yes 2>/dev/null || true
    fi

    # Prompt for value
    if [ "$is_secret" = true ]; then
        read -sp "Enter value for ${var_name}: " var_value
        echo ""
    else
        read -p "Enter value for ${var_name}: " var_value
    fi

    # Add to Vercel
    echo "${var_value}" | vercel env add "${var_name}" production
    echo -e "${GREEN}✅ ${var_name} added successfully${NC}"
}

# Critical Environment Variables

echo ""
echo "=== Supabase Configuration ==="
echo ""

add_env_var "NEXT_PUBLIC_SUPABASE_URL" \
    "Production Supabase URL (e.g., https://abc123.supabase.co)" \
    false

add_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    "Production Supabase anonymous key (public, safe to expose)" \
    true

add_env_var "SUPABASE_SERVICE_ROLE_KEY" \
    "Production Supabase service role key (SECRET, server-side only)" \
    true

echo ""
echo "=== Analytics Configuration ==="
echo ""

add_env_var "NEXT_PUBLIC_POSTHOG_KEY" \
    "PostHog project API key (from posthog.com/project/settings)" \
    true

add_env_var "NEXT_PUBLIC_POSTHOG_HOST" \
    "PostHog host URL (usually https://app.posthog.com)" \
    false

echo ""
echo "=== Error Monitoring Configuration ==="
echo ""

add_env_var "NEXT_PUBLIC_SENTRY_DSN" \
    "Sentry DSN for error tracking (from sentry.io project settings)" \
    true

add_env_var "SENTRY_AUTH_TOKEN" \
    "Sentry auth token for uploading source maps (from sentry.io/settings/auth-tokens)" \
    true

echo ""
echo "=== Application Configuration ==="
echo ""

add_env_var "NEXT_PUBLIC_APP_URL" \
    "Production domain URL (e.g., https://tco.example.com)" \
    false

echo ""
echo "=================================================="
echo "✅ Environment Variables Setup Complete"
echo "=================================================="
echo ""

# Verify all variables
echo "📋 Verifying environment variables..."
echo ""

REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "NEXT_PUBLIC_POSTHOG_KEY"
    "NEXT_PUBLIC_POSTHOG_HOST"
    "NEXT_PUBLIC_SENTRY_DSN"
    "SENTRY_AUTH_TOKEN"
    "NEXT_PUBLIC_APP_URL"
    "NEXT_PUBLIC_VIDEOS_ASKING_QUESTIONS"
    "NEXT_PUBLIC_VIDEOS_NAVIGATION_MODULES"
    "NEXT_PUBLIC_VIDEOS_REFINING_QUESTIONS"
    "NEXT_PUBLIC_VIDEOS_REPORTING_EXPORT"
    "NEXT_PUBLIC_VIDEOS_TAKING_ACTION"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if vercel env ls | grep -q "^${var} "; then
        echo -e "${GREEN}✅ ${var}${NC}"
    else
        echo -e "${RED}❌ ${var} - MISSING${NC}"
        MISSING_VARS+=("$var")
    fi
done

echo ""

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo -e "${GREEN}🎉 All required environment variables are configured!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review deployment runbook: docs/PRODUCTION_DEPLOYMENT_RUNBOOK.md"
    echo "2. Run pre-deployment checks"
    echo "3. Deploy to production: vercel --prod"
else
    echo -e "${RED}⚠️  Missing ${#MISSING_VARS[@]} required variable(s)${NC}"
    echo "Please configure:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

echo ""
echo "=================================================="
echo "📊 Current Environment Variables"
echo "=================================================="
echo ""

vercel env ls

echo ""
echo "=================================================="
echo "🚀 Ready for Production Deployment!"
echo "=================================================="
echo ""
