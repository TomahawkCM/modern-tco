# PRD Examples

This file contains complete PRD examples for different types of MVPs to illustrate the Launch Planner approach.

## Example 1: Developer Tool (Time Tracker for Devs)

```markdown
# DevTimer - MVP PRD

## Overview
**One-sentence pitch**: A no-frills time tracker for developers who bill hourly and hate timesheets.

## Problem
**User**: Freelance developer or consultant who bills hourly
**Pain**: Forgets to track time, spends 30 minutes every Friday reconstructing their week from Git commits and calendar
**Current solution**: Manual timesheets, Toggl, or just guessing based on commits
**Why it's broken**: 
- Manual entry is easy to forget
- Existing tools have too many features and categories
- Reconstructing time from commits is tedious

## Solution
**Core value**: Automatically suggests time entries based on Git commits and lets you one-click approve them
**User flow**:
1. Connect your GitHub account
2. DevTimer shows commits from this week with suggested time durations
3. Click to approve or adjust the time
4. Export to invoice at end of week

## MVP Scope
**In scope** (Week 1):
- GitHub OAuth connection
- Fetch commits from past 7 days for user's repos
- Display commits with auto-calculated time (based on gaps between commits)
- Manual time adjustment (click to edit)
- Export to CSV for invoicing

**Explicitly out of scope**:
- Multiple repo selection (just use all user's repos)
- Client/project categories (use repo names)
- Invoice generation (just CSV export)
- Time tracking for non-Git work (manual entry)
- Team features
- Historical data beyond 7 days

## Success Metrics
**Primary metric**: User exports a CSV at least once
**Target**: 5 people export a CSV in first 2 weeks
**How to measure**: Track CSV export button clicks in analytics

## Tech Implementation
**Stack**: Next.js + Supabase + Vercel

**Key pages**:
- `/` - Landing + GitHub OAuth button
- `/dashboard` - Week view of commits with time entries
- API route for GitHub webhook (future, not MVP)

**Database schema** (Supabase):
```sql
create table users (
  id uuid primary key default uuid_generate_v4(),
  github_username text not null,
  github_token text not null,
  created_at timestamp default now()
);

create table time_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  repo_name text not null,
  commit_sha text not null,
  commit_message text,
  suggested_minutes integer not null,
  approved_minutes integer,
  entry_date date not null,
  approved boolean default false,
  created_at timestamp default now()
);
```

## Launch Plan
**Week 1**: Build MVP with GitHub integration
**Week 2**: Use it myself, get 4 other freelancer friends to use it
**Decision point**: If 3+ people use it for 2 weeks straight, keep building. Otherwise, pivot or kill.
```

## Example 2: Consumer App (Recipe Remix)

```markdown
# RecipeRemix - MVP PRD

## Overview
**One-sentence pitch**: Paste any recipe URL, instantly get a version with ingredients you actually have.

## Problem
**User**: Home cook who finds recipes online but doesn't have all the ingredients
**Pain**: Has to mentally substitute ingredients or make multiple store trips
**Current solution**: Google "substitute for X" or just guess
**Why it's broken**: 
- Takes 5-10 minutes per recipe to figure out substitutions
- Unsure if substitutions will work
- Often miss ingredients and have to improvise mid-cooking

## Solution
**Core value**: Paste a recipe URL, select missing ingredients, get a remixed recipe with substitutions
**User flow**:
1. Paste recipe URL
2. System extracts ingredients
3. User marks which ingredients they don't have
4. System suggests substitutions for each
5. User gets updated recipe with new ingredients

## MVP Scope
**In scope** (Week 1):
- URL input for recipe
- Parse ingredients from popular recipe sites (AllRecipes, Food Network)
- Display ingredient checklist
- Rule-based substitutions (hardcoded common swaps)
- Display remixed recipe

**Explicitly out of scope**:
- Account creation (stateless, session only)
- Saving recipes
- Complex AI substitutions (use simple rules first)
- Nutrition info
- Shopping list
- Scraping all recipe sites (start with 2-3)
- User-submitted substitutions

## Success Metrics
**Primary metric**: User completes flow (pastes URL → gets remixed recipe)
**Target**: 10 people complete the flow in first week
**How to measure**: Track "View Remixed Recipe" button clicks

## Tech Implementation
**Stack**: Next.js + Supabase + Vercel

**Key pages**:
- `/` - Landing with URL input
- `/remix/[id]` - Ingredient checklist and remixed output

**Database schema** (Supabase):
```sql
create table recipes (
  id uuid primary key default uuid_generate_v4(),
  original_url text not null,
  title text,
  original_ingredients jsonb not null,
  created_at timestamp default now()
);

create table substitution_rules (
  id uuid primary key default uuid_generate_v4(),
  ingredient text not null,
  substitute text not null,
  ratio text
);
```

## Launch Plan
**Week 1**: Build with 2-3 recipe sites, 20 common substitutions
**Week 2**: Share in cooking subreddits, get 10 people to try it
**Decision point**: If people actually cook with the remixed recipes, continue. If not, reassess.
```

## Example 3: B2B Tool (Meeting Transcript Summary)

```markdown
# QuickRecap - MVP PRD

## Overview
**One-sentence pitch**: Paste your Zoom transcript, get a structured summary with action items in 10 seconds.

## Problem
**User**: Product manager or team lead who attends 5+ meetings per day
**Pain**: Spends 15 minutes after each meeting writing up notes and extracting action items
**Current solution**: Manual note-taking during meetings, or paying for AI tools with too many features
**Why it's broken**: 
- Manual summarization is time-consuming
- Existing AI tools require account setup and integrations
- Just want a quick summary, not a full transcript management system

## Solution
**Core value**: Paste transcript, get instant structured summary with action items
**User flow**:
1. Download Zoom transcript (text file)
2. Paste into QuickRecap
3. Get summary broken into: decisions made, action items, key discussion points
4. Copy to Slack/email

## MVP Scope
**In scope** (Week 1):
- Text input for transcript
- AI-powered summary (using Claude API)
- Structured output: decisions, action items, key points
- Copy to clipboard button

**Explicitly out of scope**:
- Direct Zoom integration
- Google Meet support
- Saving summaries
- User accounts
- Team sharing
- Custom summary formats
- Exporting to other tools
- Audio file upload

## Success Metrics
**Primary metric**: User pastes a transcript and copies the summary
**Target**: 20 people use it in first week
**How to measure**: Track summary generations in analytics

## Tech Implementation
**Stack**: Next.js + Supabase + Vercel

**Key pages**:
- `/` - Landing with transcript input
- `/summary/[id]` - Display structured summary

**Database schema** (Supabase):
```sql
create table summaries (
  id uuid primary key default uuid_generate_v4(),
  transcript_text text not null,
  summary_json jsonb not null, -- {decisions: [], action_items: [], key_points: []}
  created_at timestamp default now()
);
```

**API Integration**:
- Use Anthropic Claude API for summarization
- System prompt: "Extract decisions, action items, and key discussion points from this meeting transcript"

## Launch Plan
**Week 1**: Build with Claude API integration
**Week 2**: Share in PM communities, get 20 people to try it
**Decision point**: If people use it more than once, consider adding accounts. If not, reassess the value prop.
```

## Common Patterns Across These PRDs

### What They All Have

1. **Specific user**: Not "people who need X" but "freelancer who bills hourly"
2. **One core action**: Each can be described in 1 sentence
3. **Tight scope**: Explicitly cutting 80% of possible features
4. **Clear success metric**: Simple, countable outcome
5. **One-week timeline**: All are buildable in 5 days
6. **No auth required**: Session-based or stateless to start

### What They All Cut

1. **User accounts** (unless core to product)
2. **Customization** (use sensible defaults)
3. **Integrations** (manual input first)
4. **Social features** (sharing, teams, etc.)
5. **Historical data** (focus on current need)
6. **Advanced features** (saved to v2)

### Red Flags to Avoid

- "We need to support multiple user types" → Pick one user
- "It should work with any [X]" → Start with 2-3 specific cases
- "Users will want to customize [X]" → Give them one good default
- "Eventually we'll add [Y]" → Don't mention future features in MVP PRD
- "This needs to scale to..." → Don't optimize for scale before launch

## Using These Examples

When creating your own PRD:
1. Pick the example closest to your app type
2. Copy the structure exactly
3. Fill in your specifics
4. Read "Explicitly out of scope" and add 10 more items
5. If implementation looks like more than a week, cut scope again

Remember: The goal is to ship something real in 1 week, not to plan the perfect app.
