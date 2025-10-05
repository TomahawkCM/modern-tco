# Modern Tanium TCO - Administrator & Instructor Guide

**Enterprise Learning Management System Administration**

This comprehensive guide provides administrators, instructors, and platform managers with the knowledge to effectively manage and optimize the Modern Tanium TCO Learning Management System.

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Getting Started as Admin](#getting-started-as-admin)
3. [User Management](#user-management)
4. [Content Management](#content-management)
5. [Question Bank Management](#question-bank-management)
6. [Video Content Management](#video-content-management)
7. [Analytics & Reporting](#analytics--reporting)
8. [System Configuration](#system-configuration)
9. [Database Administration](#database-administration)
10. [Security & Compliance](#security--compliance)
11. [Performance Monitoring](#performance-monitoring)
12. [Troubleshooting & Support](#troubleshooting--support)
13. [Best Practices](#best-practices)

---

## Platform Overview

### Architecture Summary

**Modern Tanium TCO LMS** is an enterprise-grade learning platform built with:

- **Frontend**: Next.js 15.5.2 with TypeScript 5.9.2 (strict mode)
- **Database**: Supabase PostgreSQL with Row-Level Security (RLS)
- **UI Framework**: shadcn/ui + Radix UI (WCAG 2.1 AA compliant)
- **State Management**: 11+ React Contexts for sophisticated orchestration
- **Analytics**: PostHog for comprehensive user behavior tracking
- **Deployment**: Vercel with enterprise-grade CI/CD

### Key System Capabilities

- **Assessment Engine**: Weighted scoring aligned with Tanium certification blueprint
- **Spaced Repetition**: Research-backed 2357 method for optimal retention
- **Video System**: Multi-provider integration (YouTube + custom)
- **Gamification**: Points, levels, achievements, and engagement metrics
- **Real-time Features**: Live progress updates and collaborative learning
- **Adaptive Learning**: AI-powered study recommendations

---

## Getting Started as Admin

### Admin Access Levels

The platform supports **three administrative roles**:

| Role | Permissions | Typical Use Case |
|------|------------|------------------|
| **Super Admin** | Full system access, user management, content creation, analytics, configuration | Platform owner, IT administrator |
| **Instructor** | Content creation, question management, student analytics, grading | Tanium instructors, subject matter experts |
| **Content Manager** | Content creation, video management, module editing | Content writers, video producers |

### First-Time Admin Setup

1. **Access Admin Dashboard**: Navigate to `/admin` (requires admin role in database)
2. **Configure System Settings**: Set platform name, branding, exam schedules
3. **Import Initial Content**: Upload course modules, videos, and question banks
4. **Set Up User Groups**: Create cohorts for different training programs
5. **Configure Analytics**: Enable PostHog tracking and custom event definitions
6. **Test All Features**: Verify assessment engine, video playback, and real-time updates

### Admin Dashboard Overview

**Key Sections**:
- **📊 Platform Analytics**: Real-time metrics (active users, completion rates, average scores)
- **👥 User Management**: User list, roles, permissions, activity logs
- **📚 Content Library**: Modules, videos, questions, assessments
- **🎓 Student Progress**: Cohort analytics, individual student tracking, intervention alerts
- **⚙️ System Configuration**: Platform settings, integrations, feature flags
- **🔐 Security & Compliance**: RLS policies, audit logs, data export

---

## User Management

### Creating New Users

**Via Database (Supabase)**:

```sql
-- Create new user with email/password
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('student@example.com', crypt('password', gen_salt('bf')), now());

-- Assign role and metadata
INSERT INTO public.user_profiles (user_id, role, display_name, cohort)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'student@example.com'),
  'student',
  'John Doe',
  '2025-Q1'
);
```

**Via Admin UI** (recommended):
1. Navigate to **Admin → Users → Add New User**
2. Fill in required fields:
   - Email (required, must be unique)
   - Display Name
   - Role (student/instructor/admin)
   - Cohort (optional, for grouping)
   - Exam Date (optional, for personalized scheduling)
3. Click **Create User** - invitation email sent automatically

### User Roles & Permissions

**Role Assignment** (Row-Level Security enforced):

```sql
-- Update user role
UPDATE public.user_profiles
SET role = 'instructor'
WHERE user_id = 'user-uuid-here';

-- Grant specific permissions
INSERT INTO public.user_permissions (user_id, permission)
VALUES ('user-uuid-here', 'create_content');
```

**Available Permissions**:
- `view_analytics` - Access platform analytics and reports
- `create_content` - Create/edit modules, videos, questions
- `manage_users` - Add, edit, delete users
- `configure_system` - Modify platform settings
- `export_data` - Export student data and reports

### Bulk User Import

**CSV Format**:
```csv
email,display_name,role,cohort,exam_date
student1@example.com,Alice Smith,student,2025-Q1,2025-03-15
student2@example.com,Bob Johnson,student,2025-Q1,2025-03-15
instructor@example.com,Carol Williams,instructor,2025-Q1,
```

**Import Process**:
1. Navigate to **Admin → Users → Bulk Import**
2. Upload CSV file (max 1000 users per batch)
3. Review validation results
4. Confirm import - users created and invitation emails sent

### Monitoring User Activity

**Activity Dashboard**:
```sql
-- Recent user activity
SELECT
  up.display_name,
  up.email,
  ua.activity_type,
  ua.created_at
FROM public.user_activity ua
JOIN public.user_profiles up ON ua.user_id = up.user_id
WHERE ua.created_at >= NOW() - INTERVAL '7 days'
ORDER BY ua.created_at DESC
LIMIT 50;
```

**Key Metrics**:
- Last login date
- Total study hours
- Modules completed
- Average assessment score
- Review streak (days)

---

## Content Management

### Module Structure

**File Locations**:
- **MDX Content**: `/src/content/modules/`
- **Module Manifest**: `/src/content/modules/manifest.json`
- **Assets**: `/public/assets/modules/`

**Module Manifest Schema**:
```json
{
  "modules": [
    {
      "id": "asking-questions",
      "title": "Asking Questions",
      "description": "Master Tanium question fundamentals and syntax",
      "domain": "Domain 2: Asking Questions",
      "weight": 0.23,
      "order": 2,
      "duration_minutes": 120,
      "learning_objectives": [
        "Understand Tanium question structure",
        "Write basic sensor queries",
        "Use filters and operators"
      ],
      "prerequisites": ["platform-foundation"],
      "file": "02-asking-questions.mdx",
      "videos": [
        {
          "id": "vid-ask-001",
          "title": "Introduction to Tanium Questions",
          "provider": "youtube",
          "youtubeId": "dQw4w9WgXcQ",
          "duration_seconds": 480
        }
      ]
    }
  ]
}
```

### Creating New Modules

**Step 1: Create MDX File**

Create `/src/content/modules/XX-module-name.mdx`:

```mdx
---
title: "Module Title"
description: "Brief description"
domain: "Domain X: Topic Name"
weight: 0.XX
order: X
---

import { VideoEmbed } from "@/components/videos/VideoEmbed";
import { MicroQuiz } from "@/components/study/MicroQuiz";

# Module Title

## Learning Objectives

After completing this module, you will be able to:

1. Objective 1
2. Objective 2
3. Objective 3

---

## Section 1: Introduction

Content goes here with **markdown** formatting.

<VideoEmbed
  youtubeId="VIDEO_ID_HERE"
  title="Section 1 Video"
  moduleSlug="module-name"
/>

### Subsection 1.1

More content...

<MicroQuiz
  question="What is the correct syntax for a basic Tanium question?"
  options={[
    "Get Computer Name",
    "SELECT Computer Name",
    "QUERY Computer Name",
    "FETCH Computer Name"
  ]}
  correctAnswer={0}
  explanation="Tanium uses 'Get' syntax for querying sensors."
/>

## Section 2: Advanced Topics

Content continues...

---

## Summary

Key takeaways from this module.
```

**Step 2: Update Manifest**

Add module entry to `/src/content/modules/manifest.json`:

```json
{
  "id": "module-name",
  "title": "Module Title",
  "description": "Brief description",
  "domain": "Domain X: Topic Name",
  "weight": 0.XX,
  "order": X,
  "duration_minutes": 90,
  "learning_objectives": ["Objective 1", "Objective 2"],
  "prerequisites": ["prerequisite-module"],
  "file": "XX-module-name.mdx",
  "videos": [/* video objects */]
}
```

**Step 3: Verify Build**

```bash
npm run build
# Should compile successfully with no errors
```

### Editing Existing Modules

**Best Practices**:
- Always test changes locally before deploying to production
- Use `git` for version control and rollback capability
- Update `lastmod` date in sitemap.xml after changes
- Verify all MDX components render correctly
- Test embedded videos and interactive quizzes

**Common MDX Components**:
- `<VideoEmbed>` - Embed YouTube or custom videos
- `<MicroQuiz>` - Interactive knowledge checks
- `<CodeBlock>` - Syntax-highlighted code examples
- `<Callout>` - Info/warning/tip callout boxes
- `<Accordion>` - Collapsible content sections

### Content Versioning

**Git Workflow**:
```bash
# Create feature branch
git checkout -b content/update-asking-questions

# Make changes to MDX files
# Commit with descriptive message
git add src/content/modules/02-asking-questions.mdx
git commit -m "Update Asking Questions: Add advanced filter examples"

# Push and create pull request
git push origin content/update-asking-questions
```

**Rollback Strategy**:
```bash
# Revert to previous version
git revert HEAD
git push origin main

# Or restore specific file
git checkout HEAD~1 -- src/content/modules/02-asking-questions.mdx
```

---

## Question Bank Management

### Question Database Schema

**Table: `practice_questions`**

```sql
CREATE TABLE practice_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- 'multiple_choice', 'true_false', 'multi_select'
  options JSONB NOT NULL, -- Array of answer options
  correct_answer JSONB NOT NULL, -- Index(es) of correct answer(s)
  explanation TEXT,
  domain VARCHAR(100) NOT NULL,
  difficulty VARCHAR(20) NOT NULL, -- 'easy', 'medium', 'hard'
  learning_objective VARCHAR(200),
  tags TEXT[],
  weight DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  active BOOLEAN DEFAULT true
);
```

### Adding New Questions

**Via Admin UI**:
1. Navigate to **Admin → Question Bank → Add New Question**
2. Fill in required fields:
   - **Question Text**: Clear, concise question (avoid ambiguity)
   - **Question Type**: Multiple choice, true/false, or multi-select
   - **Options**: 4-5 answer choices (multiple choice) or True/False
   - **Correct Answer**: Select correct option(s)
   - **Explanation**: Detailed explanation with references
   - **Domain**: Align with certification blueprint (Domain 1-5)
   - **Difficulty**: Easy (recall), Medium (application), Hard (analysis)
   - **Learning Objective**: Specific objective from module
   - **Tags**: Keywords for filtering (e.g., "sensors", "filters", "actions")
   - **Weight**: 0.5-2.0 based on question importance
3. Click **Save** - question added to pool

**Via SQL Insert**:

```sql
INSERT INTO practice_questions (
  question_text,
  question_type,
  options,
  correct_answer,
  explanation,
  domain,
  difficulty,
  learning_objective,
  tags,
  weight,
  created_by
)
VALUES (
  'What is the correct syntax to query all running processes?',
  'multiple_choice',
  '["Get Process Name", "Get Running Process", "Get Process Details", "Get Active Processes"]'::jsonb,
  '0'::jsonb,
  'The correct syntax is "Get Process Name" which returns all running processes. Other options are not valid Tanium sensor queries.',
  'Domain 2: Asking Questions',
  'easy',
  'Write basic sensor queries',
  ARRAY['sensors', 'processes', 'syntax'],
  1.0,
  (SELECT id FROM auth.users WHERE email = 'admin@example.com')
);
```

### Bulk Question Import

**CSV Format**:
```csv
question_text,question_type,option_1,option_2,option_3,option_4,correct_answer,explanation,domain,difficulty,learning_objective,tags
"What is Tanium?","multiple_choice","Endpoint management","Network monitoring","Cloud platform","Database system","0","Tanium is an endpoint management and security platform.","Domain 1: Platform Foundation","easy","Understand Tanium architecture","platform,architecture"
```

**Import Script**:
```bash
# Upload CSV to /admin/questions/import
# System validates format and content
# Preview questions before import
# Confirm import to add to database
```

### Question Quality Standards

**Best Practices**:
- **Clear Language**: Avoid jargon, use simple grammar
- **Specific Focus**: Test one concept per question
- **Plausible Distractors**: Incorrect options should be believable
- **Avoid "All of the Above"**: Creates ambiguity
- **Peer Review**: Have SMEs review questions before activation
- **Difficulty Balance**: 40% easy, 40% medium, 20% hard
- **Regular Updates**: Review questions quarterly for accuracy

**Question Review Workflow**:
```sql
-- Mark questions for review
UPDATE practice_questions
SET active = false, review_needed = true
WHERE id IN (SELECT id FROM questions_flagged_by_students);

-- Review and approve
UPDATE practice_questions
SET active = true, review_needed = false, updated_at = NOW()
WHERE id = 'question-uuid' AND reviewed_by = 'admin-uuid';
```

---

## Video Content Management

### Video Integration Methods

**Method 1: YouTube Videos** (Recommended)

```mdx
<VideoEmbed
  youtubeId="dQw4w9WgXcQ"
  title="Introduction to Tanium Console"
  moduleSlug="platform-foundation"
/>
```

**Method 2: Custom Video URLs**

```mdx
<VideoEmbed
  provider="custom"
  url="https://cdn.example.com/videos/tanium-intro.mp4"
  title="Custom Video"
  moduleSlug="module-slug"
/>
```

### Video Manifest Management

**Location**: `/src/content/modules/manifest.json` → `videos` array

**Video Object Schema**:
```json
{
  "id": "vid-ask-001",
  "title": "Introduction to Tanium Questions",
  "provider": "youtube",
  "youtubeId": "dQw4w9WgXcQ",
  "duration_seconds": 480,
  "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "description": "Learn the fundamentals of Tanium question syntax",
  "learning_objectives": ["Objective 1", "Objective 2"],
  "order": 1
}
```

### Adding New Videos

**Step 1: Upload Video** (if custom hosting)
```bash
# Upload to CDN or video hosting service
aws s3 cp video.mp4 s3://tco-videos/modules/asking-questions/intro.mp4 --acl public-read

# Get public URL
https://cdn.example.com/videos/asking-questions/intro.mp4
```

**Step 2: Add to Manifest**
```json
{
  "id": "vid-ask-002",
  "title": "Advanced Question Filtering",
  "provider": "youtube",
  "youtubeId": "NEW_VIDEO_ID",
  "duration_seconds": 720,
  "order": 2
}
```

**Step 3: Embed in Module**
```mdx
## Advanced Filtering

Watch this video to learn about complex filters:

<VideoEmbed
  youtubeId="NEW_VIDEO_ID"
  title="Advanced Question Filtering"
  moduleSlug="asking-questions"
/>
```

### Video Analytics

**Tracked Metrics**:
- **Impressions**: Number of times video is shown
- **Starts**: Number of times video playback begins
- **Milestones**: 25%, 50%, 75%, 100% completion
- **Total Watch Time**: Cumulative seconds watched
- **Completion Rate**: Percentage of students who finish video
- **Average View Duration**: Mean watch time across all students

**Query Video Analytics**:
```sql
-- Video completion rates by module
SELECT
  v.module_slug,
  v.title,
  COUNT(DISTINCT vp.user_id) as unique_viewers,
  AVG(CASE WHEN vp.completed THEN 1 ELSE 0 END) * 100 as completion_rate,
  AVG(vp.total_watch_time) as avg_watch_time
FROM video_progress vp
JOIN videos v ON vp.youtube_id = v.youtube_id
GROUP BY v.module_slug, v.title
ORDER BY completion_rate DESC;
```

---

## Analytics & Reporting

### Student Performance Reports

**Individual Student Report**:
```sql
-- Comprehensive student performance
SELECT
  up.display_name,
  up.email,
  COUNT(DISTINCT sa.assessment_id) as assessments_taken,
  AVG(sa.score) as average_score,
  AVG(sa.confidence_alignment) as confidence_accuracy,
  SUM(CASE WHEN sa.passed THEN 1 ELSE 0 END) as assessments_passed,
  MAX(sa.created_at) as last_assessment_date
FROM user_profiles up
LEFT JOIN student_assessments sa ON up.user_id = sa.user_id
WHERE up.user_id = 'student-uuid-here'
GROUP BY up.display_name, up.email;
```

**Cohort Performance Report**:
```sql
-- Cohort-level analytics
SELECT
  up.cohort,
  COUNT(DISTINCT up.user_id) as total_students,
  AVG(sp.overall_progress) as avg_progress,
  AVG(sa.score) as avg_score,
  AVG(sp.study_hours) as avg_study_hours,
  SUM(CASE WHEN sp.exam_ready THEN 1 ELSE 0 END) as students_ready
FROM user_profiles up
LEFT JOIN student_progress sp ON up.user_id = sp.user_id
LEFT JOIN student_assessments sa ON up.user_id = sa.user_id
WHERE up.cohort = '2025-Q1'
GROUP BY up.cohort;
```

### Domain-Level Analytics

**Performance by Domain**:
```sql
-- Identify weak domains across all students
SELECT
  domain,
  AVG(score) as avg_domain_score,
  COUNT(*) as total_questions,
  SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_answers,
  STDDEV(score) as score_variance
FROM student_question_responses
GROUP BY domain
ORDER BY avg_domain_score ASC;
```

### Engagement Metrics

**PostHog Integration**:

Access PostHog dashboard at `https://app.posthog.com` for:
- **Session Recordings**: Watch how students navigate the platform
- **Funnels**: Identify drop-off points in learning journey
- **Retention**: Cohort retention analysis (Day 1, 7, 14, 30)
- **Feature Flags**: A/B test new features before full rollout
- **Custom Events**: Track specific interactions (video play, quiz completion)

**Key Events to Monitor**:
- `video_play` - Video engagement
- `assessment_start` - Assessment attempts
- `quiz_correct` - Correct quiz answers
- `module_complete` - Module completion
- `review_session_complete` - Spaced repetition adherence

### Exporting Reports

**CSV Export**:
```sql
-- Export student progress to CSV
COPY (
  SELECT
    up.email,
    up.display_name,
    sp.overall_progress,
    sp.study_hours,
    sp.exam_ready,
    sp.last_activity_date
  FROM user_profiles up
  LEFT JOIN student_progress sp ON up.user_id = sp.user_id
  WHERE up.cohort = '2025-Q1'
) TO '/tmp/cohort_2025q1_progress.csv' WITH CSV HEADER;
```

**Admin UI Export**:
1. Navigate to **Admin → Analytics → Export**
2. Select report type (Student Progress, Assessment Results, Video Analytics)
3. Filter by cohort, date range, or module
4. Choose format (CSV, JSON, PDF)
5. Click **Export** - file downloaded to browser

---

## System Configuration

### Environment Variables

**Location**: `.env.local` (local) or Vercel dashboard (production)

**Required Variables**:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Application Settings
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Modern Tanium TCO
NEXT_PUBLIC_SUPPORT_EMAIL=support@your-domain.com

# Feature Flags
NEXT_PUBLIC_ENABLE_VIDEO_ANALYTICS=true
NEXT_PUBLIC_ENABLE_GAMIFICATION=true
NEXT_PUBLIC_ENABLE_COLLABORATIVE_LEARNING=false

# YouTube API (optional for advanced features)
YOUTUBE_API_KEY=your-youtube-api-key
```

### Feature Flag Management

**Toggle Features**:
```typescript
// src/lib/featureFlags.ts
export const featureFlags = {
  videoAnalytics: process.env.NEXT_PUBLIC_ENABLE_VIDEO_ANALYTICS === 'true',
  gamification: process.env.NEXT_PUBLIC_ENABLE_GAMIFICATION === 'true',
  collaborativeLearning: process.env.NEXT_PUBLIC_ENABLE_COLLABORATIVE_LEARNING === 'true',
  aiRecommendations: process.env.NEXT_PUBLIC_ENABLE_AI_RECOMMENDATIONS === 'true',
};

// Usage in components
if (featureFlags.videoAnalytics) {
  return <VideoAnalyticsDashboard />;
}
```

### Platform Customization

**Branding**:
- **Logo**: Update `/public/logo.svg` and `/public/logo-dark.svg`
- **Favicon**: Update `/public/favicon.ico`
- **Colors**: Edit `tailwind.config.ts` theme colors
- **Font**: Modify `src/app/layout.tsx` font imports

**Email Templates**:
- **Location**: `/src/lib/email/templates/`
- **Templates**: Welcome email, password reset, assessment reminder, achievement notification
- **Customization**: Edit HTML and text versions

---

## Database Administration

### Supabase Dashboard Access

**URL**: https://app.supabase.com/project/YOUR_PROJECT_ID

**Common Admin Tasks**:
1. **SQL Editor**: Run custom queries and migrations
2. **Table Editor**: View/edit data directly
3. **Authentication**: Manage users and auth providers
4. **Storage**: Upload assets and media files
5. **Database**: Monitor performance and connections

### Running Migrations

**Create Migration**:
```sql
-- Create new migration file: supabase/migrations/YYYYMMDDHHMMSS_description.sql

-- Example: Add new column to track certification expiry
ALTER TABLE user_profiles
ADD COLUMN certification_expiry_date TIMESTAMPTZ;

-- Add index for performance
CREATE INDEX idx_user_profiles_cert_expiry
ON user_profiles(certification_expiry_date)
WHERE certification_expiry_date IS NOT NULL;
```

**Apply Migration** (Supabase CLI):
```bash
# Apply pending migrations to local database
supabase db push

# Apply to production (requires service role key)
supabase db push --db-url "postgresql://postgres:[YOUR_PASSWORD]@db.project.supabase.co:5432/postgres"
```

### Database Backups

**Automated Backups** (Supabase):
- **Daily backups**: Retained for 7 days (Pro plan)
- **Point-in-time recovery**: Last 24 hours (Enterprise)

**Manual Backup**:
```bash
# Export entire database
pg_dump -h db.project.supabase.co -U postgres -d postgres > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h db.project.supabase.co -U postgres -d postgres < backup_20250103.sql
```

### Performance Optimization

**Query Optimization**:
```sql
-- Identify slow queries
SELECT
  query,
  calls,
  mean_exec_time,
  stddev_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_student_assessments_user_created
ON student_assessments(user_id, created_at DESC);
```

**Connection Pooling**:
- **Supabase**: Built-in connection pooling via PgBouncer
- **Max Connections**: 60 (Free), 200 (Pro), 500 (Enterprise)
- **Monitor**: Dashboard → Settings → Database → Connection Pooling

---

## Security & Compliance

### Row-Level Security (RLS) Policies

**View RLS Policies**:
```sql
-- List all RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public';
```

**Example RLS Policy**:
```sql
-- Students can only view their own progress
CREATE POLICY "Students view own progress"
ON student_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Instructors can view all student progress
CREATE POLICY "Instructors view all progress"
ON student_progress
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('instructor', 'admin')
  )
);
```

### Data Protection & Privacy

**GDPR Compliance**:
- **Right to Access**: Students can export their data via Settings → Data Export
- **Right to Erasure**: Admin can delete user accounts and all associated data
- **Data Minimization**: Only collect essential data for learning purposes
- **Consent**: Users accept Terms of Service and Privacy Policy on signup

**Data Deletion**:
```sql
-- Delete user and all associated data (GDPR)
BEGIN;
  DELETE FROM student_assessments WHERE user_id = 'user-uuid';
  DELETE FROM student_progress WHERE user_id = 'user-uuid';
  DELETE FROM user_activity WHERE user_id = 'user-uuid';
  DELETE FROM user_profiles WHERE user_id = 'user-uuid';
  DELETE FROM auth.users WHERE id = 'user-uuid';
COMMIT;
```

### Audit Logging

**Track Admin Actions**:
```sql
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log admin action
INSERT INTO admin_audit_log (admin_user_id, action, entity_type, entity_id, changes)
VALUES (
  'admin-uuid',
  'UPDATE_USER_ROLE',
  'user_profile',
  'student-uuid',
  '{"old_role": "student", "new_role": "instructor"}'::jsonb
);
```

---

## Performance Monitoring

### Application Performance

**Vercel Analytics**:
- **Real User Monitoring (RUM)**: Track actual user experience metrics
- **Core Web Vitals**: LCP, FID, CLS scores
- **Page Load Times**: Time to First Byte (TTFB), First Contentful Paint (FCP)
- **Error Tracking**: JavaScript errors and stack traces

**Access**: Vercel Dashboard → Project → Analytics

### Database Performance

**Monitor Query Performance**:
```sql
-- Enable pg_stat_statements extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 10 slowest queries
SELECT
  substring(query, 1, 100) as short_query,
  calls,
  round(total_exec_time::numeric, 2) as total_time_ms,
  round(mean_exec_time::numeric, 2) as avg_time_ms,
  round((100 * total_exec_time / sum(total_exec_time) OVER ())::numeric, 2) as percentage
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

**Database Size Monitoring**:
```sql
-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Error Monitoring (Sentry)

**Configuration**: `sentry.server.config.ts`, `sentry.client.config.ts`, `sentry.edge.config.ts`

**Monitor**:
- **Error Rate**: Errors per minute/hour
- **Performance Issues**: Slow database queries, API calls
- **Release Tracking**: Compare error rates across deployments
- **User Feedback**: Collect user feedback on errors

---

## Troubleshooting & Support

### Common Issues

#### Issue 1: Students Can't Access Content

**Symptoms**: "Access Denied" or empty module list

**Diagnosis**:
```sql
-- Check user role and permissions
SELECT role, active, email_confirmed_at
FROM auth.users
WHERE email = 'student@example.com';

-- Verify RLS policies
SET ROLE postgres;
SELECT * FROM modules; -- Should return all modules
RESET ROLE;
```

**Solution**:
```sql
-- Confirm email if not verified
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'student@example.com';

-- Grant default student role
UPDATE user_profiles
SET role = 'student', active = true
WHERE email = 'student@example.com';
```

#### Issue 2: Video Playback Errors

**Symptoms**: "Video failed to load" or infinite loading

**Diagnosis**:
1. Check browser console for errors (F12 → Console)
2. Verify YouTube video ID is correct and video is public
3. Test video URL directly: `https://www.youtube.com/watch?v=VIDEO_ID`
4. Check Content Security Policy (CSP) headers

**Solution**:
```typescript
// Update CSP to allow YouTube embeds (next.config.js)
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://www.youtube-nocookie.com https://*.youtube.com;"
          }
        ]
      }
    ];
  }
};
```

#### Issue 3: Assessment Scores Not Saving

**Symptoms**: Scores reset after page refresh

**Diagnosis**:
```sql
-- Check if scores are being written to database
SELECT * FROM student_assessments
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC
LIMIT 5;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'student_assessments';
```

**Solution**:
```sql
-- Ensure INSERT policy exists
CREATE POLICY "Students can insert own assessments"
ON student_assessments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Verify user_id is correctly set
-- Check client code: AssessmentContext.tsx
```

### Support Ticket System

**Workflow**:
1. Student submits support request via **Settings → Help**
2. Ticket created in support system (or email to `support@your-domain.com`)
3. Admin reviews ticket in **Admin → Support Tickets**
4. Admin assigns to appropriate team member
5. Resolution tracked and student notified

**Priority Levels**:
- **Critical**: Platform down, security issue, data loss (< 1 hour response)
- **High**: Feature broken, assessment issues, many users affected (< 4 hours)
- **Medium**: Individual user issues, content errors (< 24 hours)
- **Low**: Feature requests, cosmetic issues (< 72 hours)

---

## Best Practices

### Content Creation

1. **Modular Design**: Break content into 10-15 minute modules
2. **Learning Objectives**: Start each module with clear objectives
3. **Multimedia Balance**: Mix video (40%), reading (30%), practice (30%)
4. **Assessment Alignment**: Questions should directly test learning objectives
5. **Progressive Difficulty**: Easy → Medium → Hard within each module
6. **Real-World Examples**: Use actual Tanium use cases and scenarios

### Question Writing

1. **Clear Stems**: Question should be answerable without looking at options
2. **Homogeneous Options**: All answers should be same type/length
3. **Avoid Negatives**: Don't use "Which is NOT correct?" unless necessary
4. **Single Concept**: Test one idea per question
5. **Plausible Distractors**: Wrong answers should reflect common misconceptions
6. **Explanation Quality**: Provide detailed rationale with references

### User Management

1. **Cohort Organization**: Group students by exam date or training program
2. **Regular Monitoring**: Review inactive students weekly
3. **Personalized Outreach**: Contact students falling behind
4. **Automated Reminders**: Send review session reminders via email
5. **Privacy Respect**: Only access individual data when necessary for support

### Performance Optimization

1. **Database Indexes**: Add indexes for frequently queried columns
2. **Connection Pooling**: Use Supabase pooler for high traffic
3. **Image Optimization**: Use Next.js Image component for all images
4. **Code Splitting**: Lazy load non-critical components
5. **CDN Usage**: Serve static assets via Vercel CDN
6. **Caching Strategy**: Cache API responses where appropriate

### Security

1. **Regular Audits**: Review RLS policies quarterly
2. **Least Privilege**: Grant minimum necessary permissions
3. **MFA Enforcement**: Require multi-factor auth for admins
4. **Dependency Updates**: Update npm packages monthly
5. **Penetration Testing**: Annual security assessment
6. **Backup Verification**: Test database restore monthly

---

## Emergency Procedures

### System Outage

**Immediate Actions**:
1. Check Vercel status: https://www.vercel-status.com/
2. Check Supabase status: https://status.supabase.com/
3. Review Sentry for error spike
4. Notify students via email/status page

**Rollback Deployment**:
```bash
# Via Vercel CLI
vercel rollback

# Via Vercel Dashboard
# Deployments → Click previous deployment → "Promote to Production"
```

### Data Corruption

**Immediate Actions**:
1. Identify affected tables/records
2. Disable write access to affected tables
3. Restore from most recent backup
4. Verify data integrity
5. Re-enable write access
6. Notify affected users

**Database Restore**:
```bash
# Restore specific table
pg_restore -h db.project.supabase.co -U postgres -d postgres -t table_name backup.dump

# Verify restoration
psql -h db.project.supabase.co -U postgres -c "SELECT COUNT(*) FROM table_name;"
```

### Security Breach

**Immediate Actions**:
1. **Identify Scope**: Determine what data was accessed
2. **Contain**: Disable compromised accounts, revoke API keys
3. **Investigate**: Review audit logs and access patterns
4. **Notify**: Inform affected users within 72 hours (GDPR)
5. **Remediate**: Patch vulnerability, reset passwords
6. **Document**: Write incident report for compliance

---

## Support Contacts

**Technical Support**:
- Email: support@your-domain.com
- Phone: 1-800-XXX-XXXX
- Hours: 9 AM - 5 PM EST, Monday-Friday

**Emergency Contact** (Critical Issues):
- On-call Engineer: emergency@your-domain.com
- Phone: 1-800-XXX-XXXX (24/7)

**Vendor Support**:
- **Vercel**: support@vercel.com
- **Supabase**: support@supabase.io
- **PostHog**: hey@posthog.com

---

## Appendix

### Useful SQL Queries

```sql
-- Active students in last 7 days
SELECT COUNT(DISTINCT user_id)
FROM user_activity
WHERE created_at >= NOW() - INTERVAL '7 days';

-- Average assessment score by domain
SELECT domain, AVG(score) as avg_score
FROM student_question_responses
GROUP BY domain;

-- Top 10 most-watched videos
SELECT title, SUM(view_count) as total_views
FROM video_progress
GROUP BY title
ORDER BY total_views DESC
LIMIT 10;

-- Students at risk (low progress, exam approaching)
SELECT
  up.display_name,
  up.email,
  up.exam_date,
  sp.overall_progress,
  (up.exam_date - CURRENT_DATE) as days_until_exam
FROM user_profiles up
JOIN student_progress sp ON up.user_id = sp.user_id
WHERE
  up.exam_date IS NOT NULL
  AND sp.overall_progress < 50
  AND (up.exam_date - CURRENT_DATE) < 30
ORDER BY days_until_exam;
```

### API Endpoints

**Admin API**:
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/analytics` - Platform analytics
- `GET /api/admin/reports/:type` - Generate report

**Authentication**: Requires `admin` role and valid session token

---

**Last Updated**: January 2025
**Version**: 1.0
**Maintained By**: Modern Tanium TCO Platform Team
