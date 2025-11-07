# Codebase Reference

## Product Overview

**Household Budget App** - A privacy-first, locally-running budget tracker designed specifically for Canadian families.

## Core Value Proposition

The app runs 100% in your browser with zero backend servers or cloud dependencies. All financial data stays completely local (using IndexedDB), ensuring complete privacy. It's built for Canadian banks and includes pre-configured support for common Canadian merchants.

## Technical Stack

- **Frontend**: React 18 with Vite
- **Storage**: IndexedDB via Dexie.js (client-side only)
- **ML Engine**: TensorFlow.js for transaction categorization
- **Charts**: Chart.js for visualizations
- **CSV Parser**: PapaParse for bank statement imports
- **Deployment**: Static hosting (Vercel, Netlify, or local file)

## Key Features

### 1. Smart CSV Import
- Supports BMO Bank and Home Trust credit card formats out of the box
- Also handles generic CSV formats from any Canadian bank
- Automatic duplicate detection
- Date range validation
- Batch import capability

### 2. AI-Powered Transaction Categorization
- Uses TensorFlow.js model that learns from your corrections
- Pre-configured Canadian merchant patterns:
  - Tim Hortons, Loblaws, No Frills
  - Rogers, Bell, Telus
  - Canadian Tire, Shoppers Drug Mart
  - And 50+ more common Canadian merchants
- Gets smarter with every correction you make
- Automatic subcategory detection
- Confidence scoring for each categorization

### 3. Visual Dashboard
- Cash flow overview (income vs expenses)
- Spending by category with pie/bar charts
- Balance trends over time
- Monthly comparisons
- Net worth tracking

### 4. Budget Management
- Create monthly/annual budgets by category
- Track spending vs budget in real-time
- Rollover unused budget amounts
- Visual progress indicators
- Budget templates (50/30/20 rule, custom)

### 5. Transaction Management
- Browse all transactions with filters
- Edit categories, amounts, descriptions
- Split transactions for shared expenses
- Tag transactions for custom organization
- Search by merchant, amount, or date range

### 6. Goals & Savings Planning
- Track multiple financial goals simultaneously
- Emergency fund calculator (3-6 months expenses)
- Debt payoff planner (snowball/avalanche methods)
- House down payment tracker
- Timeline visualization for each goal

### 7. Retirement Planner
- Input current investment portfolio
- Project growth scenarios
- Calculate required monthly savings
- Retirement age "what-if" analysis
- Compound interest visualizations

### 8. Data Privacy & Control
- **Zero external API calls** - Nothing leaves your browser
- **No tracking or analytics** - Complete privacy
- **Backup/Restore** - Export all data as JSON
- **Clear data** - Delete everything with one click
- **Offline capable** - Works without internet after initial load

### 9. Multi-Account Support
- Track checking accounts, savings, credit cards
- Manual balance reconciliation
- Account-level reporting
- Transfer tracking between accounts

## Unique Selling Points

1. **Canadian-First**: Built specifically for Canadian banks and merchants
2. **Privacy-Obsessed**: Data literally never leaves your browser
3. **No Subscription**: Free forever, no hidden costs
4. **Smart Learning**: ML that improves with your usage
5. **Family-Friendly**: Easy enough for non-technical users
6. **Offline-Ready**: No internet required after first load
7. **Open & Transparent**: No vendor lock-in, export anytime

## Target Users

- Privacy-conscious Canadians
- Families managing household budgets together
- People tired of subscription-based budget apps
- Those who want control over their financial data
- Tech-savvy users who appreciate local-first software
- Canadians frustrated with US-centric budget apps

## Technical Differentiators

- **No backend**: Eliminates server costs, security risks, and privacy concerns
- **Browser-native ML**: TensorFlow.js runs categorization without cloud AI
- **IndexedDB storage**: Fast, reliable, and unlimited local storage
- **Static deployment**: Can be hosted anywhere or run as a local file
- **Zero dependencies on external services**: Won't break if APIs change

## Common Use Cases

1. **Monthly Budget Tracking**: Import statements, review spending, adjust budget
2. **Savings Goals**: Plan for vacation, house down payment, emergency fund
3. **Retirement Planning**: Project when you can retire comfortably
4. **Debt Payoff**: Track progress on paying off credit cards, loans
5. **Family Financial Transparency**: Share view of household finances
6. **Tax Preparation**: Export categorized transactions for tax time

## Design Philosophy

- **Local-first**: All data processing happens in your browser
- **Privacy by default**: No accounts, no servers, no tracking
- **Progressive enhancement**: Core features work everywhere
- **Canadian context**: Built for Canadian banks, merchants, and needs
- **Simplicity**: Complex enough to be useful, simple enough to understand
