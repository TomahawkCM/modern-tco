# Security Headers Configuration

**Date**: December 26, 2024
**Project**: Tanium TCO Learning Management System

## Overview

Comprehensive security headers have been configured for the Tanium TCO LMS to protect against common web vulnerabilities and enhance overall security posture.

## Implemented Security Headers

### 1. X-DNS-Prefetch-Control
- **Value**: `on`
- **Purpose**: Enables DNS prefetching for performance optimization

### 2. X-Content-Type-Options
- **Value**: `nosniff`
- **Purpose**: Prevents MIME type sniffing attacks

### 3. X-Frame-Options
- **Value**: `SAMEORIGIN`
- **Purpose**: Prevents clickjacking attacks by allowing framing only from same origin

### 4. X-XSS-Protection
- **Value**: `1; mode=block`
- **Purpose**: Enables XSS filtering in older browsers

### 5. Referrer-Policy
- **Value**: `strict-origin-when-cross-origin`
- **Purpose**: Controls referrer information sent to external sites

### 6. Permissions-Policy
- **Value**: `camera=(), microphone=(), geolocation=()`
- **Purpose**: Disables access to sensitive browser features

### 7. Content Security Policy (CSP)

Comprehensive CSP configuration that allows only necessary external resources:

#### Allowed Resources by Type:

**Scripts:**
- Self-hosted scripts
- YouTube (for video player)
- PostHog (analytics)
- CDN jsdelivr (for libraries)

**Styles:**
- Self-hosted styles
- Google Fonts
- Inline styles (required for React/Next.js)

**Images:**
- Self-hosted images
- YouTube thumbnails
- Supabase storage
- Data URLs and blobs

**Fonts:**
- Self-hosted fonts
- Google Fonts (gstatic.com)

**Connections:**
- Self (API routes)
- Supabase (database and real-time)
- PostHog (analytics)

**Frames:**
- YouTube embeds (regular and nocookie)

**Media:**
- Self-hosted media
- YouTube videos

## Security Enhancements

### Strict Security Policies:
- `object-src 'none'` - No plugins allowed
- `base-uri 'self'` - Restricts base URL to same origin
- `form-action 'self'` - Forms can only submit to same origin
- `frame-ancestors 'none'` - Prevents framing from any source
- `upgrade-insecure-requests` - Forces HTTPS for all requests

## Testing Security Headers

To verify headers are working:

```bash
# Start production server
npm run build && npm run start

# Check headers
curl -I http://localhost:3000
```

## CSP Violations

If you encounter CSP violations:

1. Check browser console for CSP errors
2. Identify the blocked resource
3. Update CSP policy if resource is legitimate
4. Consider using nonces for inline scripts if needed

## Future Improvements

1. **Remove unsafe-inline**: Implement nonce-based CSP for scripts/styles
2. **Add CSP reporting**: Set up CSP violation reporting endpoint
3. **Implement Subresource Integrity (SRI)**: For external CDN resources
4. **Add Strict-Transport-Security**: When deployed to HTTPS

## External Services Allowed

The CSP policy explicitly allows these external services:

1. **YouTube**: Video content and player
2. **Supabase**: Database and real-time features
3. **PostHog**: Analytics tracking
4. **Google Fonts**: Typography
5. **CDN jsdelivr**: JavaScript libraries

## Compliance

These security headers help achieve:
- OWASP Top 10 protection
- PCI DSS compliance requirements
- GDPR security requirements
- General security best practices

## Maintenance

Review and update security headers:
- When adding new external services
- During security audits
- When new security threats emerge
- Quarterly as part of security review

---

*Security headers configured as part of P1 priority security improvements*