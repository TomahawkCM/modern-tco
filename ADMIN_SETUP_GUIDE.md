# Admin Access Setup Guide

**Last Updated**: 2025-10-12  
**Status**: Production Ready

## Overview

The Tanium TCO LMS uses a simple email-based admin system. Admin users can access:
- Question bank management (`/admin/questions`)
- AI question generation
- Bulk import/export tools
- User analytics (future)

## Quick Setup

### 1. Configure Admin Emails

Add admin email addresses to your `.env.local` file:

```bash
# .env.local
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,instructor@example.com
```

**Important**: 
- Use comma-separated list for multiple admins
- No spaces between emails
- Emails are case-insensitive
- Changes require server restart

### 2. Restart Development Server

```bash
# Stop server (Ctrl+C)
npm run dev
# Or for production
npm run build && npm start
```

### 3. Test Admin Access

1. Sign in with an admin email
2. Navigate to `/admin/questions`
3. Verify you can see the admin dashboard

## Admin Features

### Question Bank Management
- **Path**: `/admin/questions`
- **Features**:
  - View all questions with filters
  - Create new questions
  - Edit existing questions
  - Delete questions
  - Bulk import from CSV/JSON
  - AI-powered question generation

### AI Question Generation
- **Path**: `/admin/questions/ai-generate`
- **Requires**: Anthropic API key
- **Features**:
  - Generate questions from Tanium documentation
  - Auto-categorize by domain
  - Batch generation support

### Bulk Import
- **Path**: `/admin/questions/bulk-import`
- **Formats**: CSV, JSON
- **Features**:
  - Upload question files
  - Validate before import
  - Preview imported data
  - Error reporting

## Security Model

### How It Works

1. **Environment Variable**: `NEXT_PUBLIC_ADMIN_EMAILS` contains authorized emails
2. **AdminGuard Component**: Wraps admin pages, checks user email
3. **Client-Side Check**: Fast UI feedback
4. **Server-Side**: API routes also validate (recommended)

### Current Implementation

```typescript
// src/components/auth/AdminGuard.tsx
const admins = process.env.NEXT_PUBLIC_ADMIN_EMAILS
  .split(",")
  .map(e => e.trim().toLowerCase());

const isAdmin = admins.includes(user.email.toLowerCase());
```

### Limitations

⚠️ **Current system uses client-side checks only**

- Email list is visible in client bundle
- Not suitable for sensitive operations
- Recommended for internal tools only

### Production Recommendations

For production deployments with sensitive data:

1. **Database-Based Roles**
   ```sql
   -- Add role column to users table
   ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student';
   
   -- Create admin check function
   CREATE FUNCTION is_admin(user_id UUID)
   RETURNS BOOLEAN AS $$
     SELECT role = 'admin' FROM users WHERE id = user_id;
   $$ LANGUAGE SQL;
   ```

2. **Server-Side API Protection**
   ```typescript
   // src/app/api/admin/route.ts
   export async function GET(req: Request) {
     const { user } = await getSession(req);
     if (!isAdmin(user.id)) {
       return new Response('Unauthorized', { status: 403 });
     }
     // ... admin logic
   }
   ```

3. **RLS Policies**
   ```sql
   -- Only admins can modify questions
   CREATE POLICY "questions_admin_only" ON questions
     FOR ALL
     USING (is_admin(auth.uid()));
   ```

## Troubleshooting

### "Access denied" when signed in as admin

**Check**:
1. ✅ Email is in `NEXT_PUBLIC_ADMIN_EMAILS`
2. ✅ Email matches exactly (no typos)
3. ✅ Server has been restarted
4. ✅ Browser cache cleared
5. ✅ Signed in with correct account

**Debug**:
```bash
# Check environment variable is loaded
echo $NEXT_PUBLIC_ADMIN_EMAILS

# Or in browser console (development only)
console.log(process.env.NEXT_PUBLIC_ADMIN_EMAILS)
```

### Admin list is empty

**Cause**: Environment variable not set or empty

**Fix**:
```bash
# .env.local
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com
```

Then restart server.

### Admin pages return 404

**Cause**: Admin pages haven't been created yet, or routing issue

**Check**:
- Files exist in `src/app/admin/questions/`
- No TypeScript errors preventing build
- Run `npm run build` to check for errors

## Adding New Admin Features

### 1. Create Admin Page

```tsx
// src/app/admin/my-feature/page.tsx
import { AdminGuard } from '@/components/auth/AdminGuard';

export default function MyFeaturePage() {
  return (
    <AdminGuard>
      <div>Your admin content here</div>
    </AdminGuard>
  );
}
```

### 2. Add to Admin Navigation

```tsx
// src/components/admin/AdminNav.tsx (if exists)
<Link href="/admin/my-feature">
  <Button>My Feature</Button>
</Link>
```

### 3. Protect API Routes

```typescript
// src/app/api/admin/my-feature/route.ts
import { checkAdmin } from '@/lib/auth';

export async function POST(req: Request) {
  const isAdmin = await checkAdmin(req);
  if (!isAdmin) {
    return new Response('Unauthorized', { status: 403 });
  }
  // ... admin logic
}
```

## Best Practices

### ✅ Do's

- Keep admin email list in `.env.local` (not committed to git)
- Use descriptive admin page paths (`/admin/feature-name`)
- Wrap all admin pages with `<AdminGuard>`
- Test admin access in incognito mode
- Document admin features clearly

### ❌ Don'ts

- Don't hardcode admin emails in code
- Don't commit `.env.local` to git
- Don't expose sensitive data on admin pages
- Don't skip server-side validation in production
- Don't use admin system for PII/PHI applications

## Migration to Role-Based System

For future scalability, consider migrating to a role-based system:

```sql
-- Migration: Add roles
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student';
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin', 'super_admin');
ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;

-- Set existing admins
UPDATE users SET role = 'admin' 
WHERE email IN ('admin@example.com', 'instructor@example.com');
```

Then update `AdminGuard` to check database role instead of env var.

---

## Support

For issues or questions:
- GitHub Issues: [repository-url]
- Documentation: See `/docs` folder
- Email: your-support@example.com

---

**Note**: This guide is for internal tools and development. For production systems handling sensitive data, implement proper role-based access control with server-side validation.
