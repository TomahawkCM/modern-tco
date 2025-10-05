#!/bin/bash
# Deployment Helper Script for Tanium TCO LMS
# Purpose: Automate pre-deployment checks and setup tasks
# Usage: ./scripts/deployment-helper.sh [check|setup|deploy]

set -e

# Load environment variables from .env.local if it exists
if [ -f ".env.local" ]; then
  set -a  # Automatically export all variables
  source .env.local
  set +a
fi

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
  echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_section() {
  echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}$1${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Check environment variables
check_env_vars() {
  print_section "Checking Environment Variables"

  local missing_vars=()

  # Critical variables
  if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    missing_vars+=("NEXT_PUBLIC_SUPABASE_URL")
  else
    print_status "NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:0:30}..."
  fi

  if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    missing_vars+=("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  else
    print_status "NEXT_PUBLIC_SUPABASE_ANON_KEY: Set (${#NEXT_PUBLIC_SUPABASE_ANON_KEY} chars)"
  fi

  # Optional but recommended
  if [ -z "$NEXT_PUBLIC_SENTRY_DSN" ]; then
    print_warning "NEXT_PUBLIC_SENTRY_DSN: Not set (error tracking disabled)"
  else
    print_status "NEXT_PUBLIC_SENTRY_DSN: Set"
  fi

  if [ -z "$NEXT_PUBLIC_POSTHOG_KEY" ]; then
    print_warning "NEXT_PUBLIC_POSTHOG_KEY: Not set (analytics disabled)"
  else
    print_status "NEXT_PUBLIC_POSTHOG_KEY: Set"
  fi

  if [ -z "$NEXT_PUBLIC_ADMIN_EMAILS" ]; then
    print_warning "NEXT_PUBLIC_ADMIN_EMAILS: Not set (no admin access)"
  else
    print_status "NEXT_PUBLIC_ADMIN_EMAILS: $NEXT_PUBLIC_ADMIN_EMAILS"
  fi

  if [ ${#missing_vars[@]} -gt 0 ]; then
    print_error "Missing critical environment variables:"
    for var in "${missing_vars[@]}"; do
      echo "  - $var"
    done
    return 1
  fi

  print_status "All critical environment variables are set"
  return 0
}

# Run pre-deployment checks
run_checks() {
  print_section "Running Pre-Deployment Checks"

  # Check Node.js version
  NODE_VERSION=$(node --version)
  print_status "Node.js version: $NODE_VERSION"

  # Check TypeScript compilation
  print_status "Checking TypeScript compilation..."
  if npm run typecheck > /dev/null 2>&1; then
    print_status "TypeScript: No errors"
  else
    print_error "TypeScript compilation failed"
    return 1
  fi

  # Check ESLint
  print_status "Running ESLint..."
  if npm run lint:check > /dev/null 2>&1; then
    print_status "ESLint: Passed"
  else
    print_warning "ESLint: Some warnings present (non-blocking)"
  fi

  # Run tests
  print_status "Running test suite..."
  if npm run test -- --silent > /dev/null 2>&1; then
    print_status "Tests: All passing"
  else
    print_error "Tests: Some failures detected"
    return 1
  fi

  # Check for security vulnerabilities
  print_status "Checking for security vulnerabilities..."
  if npm audit --production --audit-level=high 2>&1 | grep -q "found 0 vulnerabilities"; then
    print_status "Security audit: Clean"
  else
    print_warning "Security vulnerabilities detected (run: npm audit for details)"
  fi

  # Check build
  print_status "Testing production build..."
  if npm run build > /dev/null 2>&1; then
    print_status "Production build: Success"
  else
    print_error "Production build failed"
    return 1
  fi

  print_status "All pre-deployment checks passed!"
  return 0
}

# Generate deployment checklist
generate_checklist() {
  print_section "Deployment Checklist"

  cat << EOF
Pre-Deployment Checklist:

Backend/Database:
  [ ] Supabase production project created
  [ ] Database schema deployed
  [ ] RLS policies verified
  [ ] Backups enabled

Monitoring:
  [ ] Sentry account created and DSN configured
  [ ] UptimeRobot monitor set up
  [ ] PostHog analytics configured
  [ ] Vercel Analytics enabled

Security:
  [ ] Security audit completed (see docs/SECURITY_AUDIT_CHECKLIST.md)
  [ ] No hardcoded secrets in code
  [ ] HTTPS enforced
  [ ] Security headers verified

Content:
  [ ] All 140+ questions reviewed by SME
  [ ] All 6 modules validated
  [ ] Videos uploaded and functional

Testing:
  [ ] All tests passing (npm run test)
  [ ] E2E tests run against production build
  [ ] Load testing completed

Vercel Setup:
  [ ] Environment variables configured
  [ ] Custom domain configured (optional)
  [ ] Preview deployments enabled
  [ ] Production deployment ready

Post-Deployment:
  [ ] Smoke tests passed
  [ ] Monitoring alerts configured
  [ ] Team notified
  [ ] Rollback procedure tested

EOF
}

# Setup helper for Vercel environment variables
setup_vercel_env() {
  print_section "Vercel Environment Variables Setup"

  if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI not installed. Install with: npm i -g vercel"
    return 1
  fi

  print_status "Detected Vercel CLI"

  echo "This will help you set up environment variables for Vercel production."
  echo "Make sure you have the values ready from your .env.local file."
  echo ""
  read -p "Continue? (y/n) " -n 1 -r
  echo

  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Setup cancelled"
    return 0
  fi

  # Load from .env.local if exists
  if [ -f ".env.local" ]; then
    print_status "Found .env.local file"
    echo ""
    echo "Add these variables to Vercel:"
    echo ""
    grep -v '^#' .env.local | grep -v '^$' | while IFS= read -r line; do
      VAR_NAME=$(echo "$line" | cut -d '=' -f 1)
      echo "  vercel env add $VAR_NAME production"
    done
    echo ""
    echo "Run the above commands with your values, or use the Vercel dashboard:"
    echo "https://vercel.com/[your-project]/settings/environment-variables"
  else
    print_error ".env.local not found"
    echo "Create .env.local with required variables first"
  fi
}

# Main script logic
case "${1:-check}" in
  check)
    check_env_vars && run_checks
    ;;
  checklist)
    generate_checklist
    ;;
  setup)
    setup_vercel_env
    ;;
  help)
    cat << EOF
Tanium TCO LMS Deployment Helper

Usage: ./scripts/deployment-helper.sh [command]

Commands:
  check      - Run all pre-deployment checks (default)
  checklist  - Display deployment checklist
  setup      - Interactive Vercel environment setup
  help       - Show this help message

Examples:
  ./scripts/deployment-helper.sh                # Run checks
  ./scripts/deployment-helper.sh checklist      # Show checklist
  ./scripts/deployment-helper.sh setup          # Setup Vercel env vars

For full deployment guide, see: docs/PRODUCTION_DEPLOYMENT_GUIDE.md
EOF
    ;;
  *)
    print_error "Unknown command: $1"
    echo "Run './scripts/deployment-helper.sh help' for usage"
    exit 1
    ;;
esac
