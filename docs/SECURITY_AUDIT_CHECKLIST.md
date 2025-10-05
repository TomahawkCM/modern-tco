# Security Audit Checklist - Tanium TCO LMS

**Project**: Modern Tanium TCO Learning Management System
**Audit Date**: TBD
**Auditor**: _______________
**Status**: 🔴 NOT STARTED

---

## 🎯 Security Audit Objective

Ensure the Tanium TCO LMS meets enterprise security standards before production deployment, protecting user data, preventing unauthorized access, and maintaining system integrity.

---

## 🔐 1. Authentication & Authorization

### Authentication Security
- [ ] **Password Requirements** enforced:
  - Minimum 8 characters
  - Mix of uppercase, lowercase, numbers, symbols
  - No common passwords allowed
- [ ] **Session Management**:
  - Sessions expire after inactivity (30 minutes recommended)
  - Secure session cookies (HttpOnly, Secure, SameSite)
  - Session invalidation on logout works
  - No session fixation vulnerabilities
- [ ] **Multi-Factor Authentication** (if implemented):
  - MFA enforced for admin accounts
  - Backup codes provided
  - MFA can be reset securely
- [ ] **Account Lockout** after failed attempts:
  - Account locks after 5 failed login attempts
  - Lockout duration appropriate (15-30 minutes)
  - Admin can unlock accounts
- [ ] **Password Reset Flow**:
  - Reset links expire (1 hour max)
  - One-time use tokens
  - Old password invalidated after reset
  - Email verification required

### Authorization & Access Control
- [ ] **Role-Based Access Control (RBAC)**:
  - User roles properly defined (user, admin, team)
  - Permissions enforced server-side
  - No client-side only authorization
  - Admin routes protected (NEXT_PUBLIC_ADMIN_EMAILS)
- [ ] **Row Level Security (RLS)**:
  - Supabase RLS policies active for all tables
  - Users can only access their own data
  - Team members can only access team data
  - Service role key never exposed to client
- [ ] **API Endpoint Protection**:
  - All sensitive endpoints require authentication
  - Authorization checked on every request
  - No privilege escalation possible
  - Rate limiting in place

### Test Cases
```bash
# Test authentication bypass
curl -X GET http://localhost:3001/api/admin/users
# Expected: 401 Unauthorized

# Test SQL injection in login
curl -X POST http://localhost:3001/api/auth/login \
  -d "email=admin' OR '1'='1&password=anything"
# Expected: Login failed, no SQL injection

# Test session fixation
# 1. Get session ID before login
# 2. Login
# 3. Verify session ID changed
```

**Findings**: _______________________________________________

**Risk Level**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low

**Remediation**: _______________________________________________

---

## 🛡️ 2. Data Protection

### Data Encryption
- [ ] **Data in Transit**:
  - HTTPS enforced on all pages
  - HSTS header set (max-age=31536000)
  - No mixed content warnings
  - TLS 1.2 minimum (TLS 1.3 recommended)
  - Strong cipher suites only
- [ ] **Data at Rest**:
  - Database encryption enabled (Supabase default)
  - Sensitive fields encrypted (if applicable)
  - Backups are encrypted
  - Encryption keys securely managed
- [ ] **Environment Variables**:
  - No secrets in code repository
  - `.env.local` in `.gitignore`
  - Production secrets in Vercel env vars only
  - Service role key never exposed to client

### Personal Data Handling
- [ ] **User Data Collection**:
  - Only necessary data collected
  - Privacy policy displayed (if required)
  - User consent obtained where required
  - Data retention policy defined
- [ ] **Data Export**:
  - Users can export their data (if required)
  - Data export doesn't expose others' data
  - Secure download mechanism
- [ ] **Data Deletion**:
  - Users can delete their accounts (if required)
  - Cascade deletion properly configured
  - Backups purge deleted data (per policy)

### Test Cases
```bash
# Test HTTPS redirect
curl -I http://your-domain.com
# Expected: 301 redirect to https://

# Test HSTS header
curl -I https://your-domain.com
# Expected: Strict-Transport-Security header present

# Test data exposure
# 1. Create user A
# 2. Login as user B
# 3. Try to access user A's data via API
# Expected: 403 Forbidden
```

**Findings**: _______________________________________________

**Risk Level**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low

**Remediation**: _______________________________________________

---

## 🚪 3. Input Validation & Output Encoding

### Input Validation
- [ ] **Form Input Validation**:
  - Client-side validation (UX)
  - Server-side validation (security)
  - Type checking enforced
  - Length limits enforced
  - Special characters sanitized
- [ ] **SQL Injection Prevention**:
  - Parameterized queries used (Supabase ORM)
  - No string concatenation in queries
  - User input never directly in SQL
- [ ] **File Upload Security** (if applicable):
  - File type validation (whitelist, not blacklist)
  - File size limits enforced
  - Uploaded files scanned for malware
  - Files stored outside web root

### Output Encoding
- [ ] **XSS Prevention**:
  - All user input HTML-escaped (React default)
  - No `dangerouslySetInnerHTML` without sanitization
  - Content Security Policy enforced
  - JavaScript escaping in JSON responses
- [ ] **API Response Security**:
  - Error messages don't expose internals
  - Stack traces not shown in production
  - No sensitive data in responses

### Test Cases
```bash
# Test XSS in search
curl "http://localhost:3001/search?q=<script>alert('XSS')</script>"
# Expected: Script tag escaped, not executed

# Test SQL injection
curl "http://localhost:3001/api/questions?domain=1' OR '1'='1"
# Expected: Query fails safely, no injection

# Test command injection (if shell commands used)
curl -X POST http://localhost:3001/api/export \
  -d "format=csv; rm -rf /"
# Expected: Command not executed
```

**Findings**: _______________________________________________

**Risk Level**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low

**Remediation**: _______________________________________________

---

## 🔒 4. Security Headers

### HTTP Security Headers
- [ ] **Content-Security-Policy (CSP)**:
  - CSP header set in production
  - No `unsafe-eval` (unless absolutely necessary)
  - `unsafe-inline` minimized
  - All external sources whitelisted
  - Report-uri configured (optional)
- [ ] **X-Frame-Options**: SAMEORIGIN or DENY
- [ ] **X-Content-Type-Options**: nosniff
- [ ] **Strict-Transport-Security (HSTS)**: max-age=31536000
- [ ] **Referrer-Policy**: no-referrer-when-downgrade
- [ ] **Permissions-Policy**: Restrictive (geolocation=(), camera=(), etc.)

### Test Security Headers
```bash
curl -I https://your-domain.com | grep -E "(Content-Security-Policy|X-Frame-Options|Strict-Transport)"
```

**Expected Output**:
```
Content-Security-Policy: [policy string]
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**Findings**: _______________________________________________

**Risk Level**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low

**Remediation**: _______________________________________________

---

## 🌐 5. API Security

### API Endpoint Security
- [ ] **Rate Limiting**:
  - API rate limits configured (Vercel/Supabase)
  - Prevent brute force attacks
  - Per-user and per-IP limits
  - Appropriate error messages (429 Too Many Requests)
- [ ] **CORS Configuration**:
  - CORS headers restrictive
  - Only allowed origins whitelisted
  - Credentials properly configured
- [ ] **API Authentication**:
  - All sensitive endpoints require auth token
  - Tokens validated server-side
  - Token expiration enforced
  - Refresh tokens properly secured

### API Response Security
- [ ] **Error Handling**:
  - Generic error messages to users
  - Detailed logs server-side only
  - No stack traces exposed
  - Error codes don't reveal system info
- [ ] **Data Exposure**:
  - Only necessary fields returned
  - Pagination enforced (no unbounded queries)
  - Sensitive data never in URL params
  - PII properly masked/redacted

### Test Cases
```bash
# Test rate limiting
for i in {1..100}; do
  curl http://localhost:3001/api/health
done
# Expected: Eventually 429 Too Many Requests

# Test CORS
curl -H "Origin: http://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS http://localhost:3001/api/questions
# Expected: CORS headers deny evil.com

# Test API without auth
curl http://localhost:3001/api/admin/questions
# Expected: 401 Unauthorized
```

**Findings**: _______________________________________________

**Risk Level**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low

**Remediation**: _______________________________________________

---

## 🕵️ 6. Vulnerability Scanning

### Automated Scans
- [ ] **Dependency Scan**:
  ```bash
  npm audit
  ```
  - All critical vulnerabilities fixed
  - High vulnerabilities addressed
  - Medium/low documented and accepted

- [ ] **OWASP ZAP Scan**:
  - Download: https://www.zaproxy.org/
  - Run automated scan against staging
  - Review and address findings
  - No critical issues remaining

- [ ] **Lighthouse Security Audit**:
  ```bash
  npm run lighthouse:all
  ```
  - Best Practices score > 95
  - Security issues addressed

### Manual Testing
- [ ] **Authentication Bypass**:
  - Try accessing protected routes without login
  - Try accessing admin routes as regular user
  - Try accessing other users' data
- [ ] **Session Hijacking**:
  - Try reusing old session tokens
  - Try session tokens in different browser
  - Try manipulating session cookies
- [ ] **CSRF (Cross-Site Request Forgery)**:
  - Submit forms from external site
  - Verify CSRF tokens required
- [ ] **Clickjacking**:
  - Try embedding site in iframe
  - Verify X-Frame-Options prevents it

**Findings**: _______________________________________________

**Risk Level**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low

**Remediation**: _______________________________________________

---

## 📦 7. Third-Party Security

### Dependencies
- [ ] **Package Auditing**:
  - All packages from trusted sources (npm)
  - No packages with known vulnerabilities
  - Dependency licenses reviewed
  - Package lock file committed

### External Services
- [ ] **Supabase Security**:
  - RLS policies active
  - Service role key protected
  - Connection pooling configured
  - Backups enabled and tested
- [ ] **PostHog**:
  - API key protected
  - No PII sent to analytics (if required)
  - Data retention configured
- [ ] **Sentry**:
  - DSN properly configured
  - Sensitive data filtered from errors
  - User context anonymized if needed

**Findings**: _______________________________________________

**Risk Level**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low

**Remediation**: _______________________________________________

---

## 🔍 8. Code Security

### Secure Coding Practices
- [ ] **No Hardcoded Secrets**:
  - Search codebase for API keys
  - Search codebase for passwords
  - Search codebase for tokens
  - All secrets in environment variables
- [ ] **Error Handling**:
  - Try/catch blocks around risky code
  - Errors logged but not exposed
  - Graceful degradation
- [ ] **Logging Security**:
  - No sensitive data in logs
  - Logs properly secured
  - Log rotation configured
  - Audit trail for admin actions

### Search for Security Issues
```bash
# Search for hardcoded secrets
grep -r "sk_live_" . --exclude-dir=node_modules
grep -r "SUPABASE_SERVICE_ROLE_KEY" . --exclude-dir=node_modules
grep -r "password = " . --exclude-dir=node_modules

# Search for dangerous functions
grep -r "dangerouslySetInnerHTML" src/
grep -r "eval(" src/
grep -r "Function(" src/
```

**Findings**: _______________________________________________

**Risk Level**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low

**Remediation**: _______________________________________________

---

## 🚨 9. Incident Response

### Preparedness
- [ ] **Incident Response Plan** documented
- [ ] **Security Contact** designated
- [ ] **Escalation Path** defined
- [ ] **Backup Restoration** procedure tested
- [ ] **Communication Plan** for security incidents

### Monitoring
- [ ] **Error Tracking** (Sentry) configured
- [ ] **Uptime Monitoring** (UptimeRobot) active
- [ ] **Security Alerts** configured
- [ ] **Audit Logs** enabled for admin actions

**Findings**: _______________________________________________

**Risk Level**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low

**Remediation**: _______________________________________________

---

## ✅ Security Audit Summary

### Critical Issues (🔴) - Must fix before launch
1. _______________________________________________
2. _______________________________________________

### High Issues (🟠) - Should fix before launch
1. _______________________________________________
2. _______________________________________________

### Medium Issues (🟡) - Fix soon after launch
1. _______________________________________________
2. _______________________________________________

### Low Issues (🟢) - Nice to have
1. _______________________________________________
2. _______________________________________________

---

## 🎯 Go/No-Go Decision

**Security Status**: [ ] APPROVED FOR PRODUCTION / [ ] NOT APPROVED

**Conditions for Approval**:
- [ ] Zero critical issues
- [ ] All high issues addressed or accepted
- [ ] Medium issues documented with remediation plan
- [ ] Low issues tracked for future fixes

**Security Audit Sign-Off**:

**Security Auditor**: ____________________ (Name, Date)

**Technical Lead Approval**: ____________________ (Name, Date)

**Stakeholder Sign-Off**: ____________________ (Name, Date)

---

## 📅 Re-Audit Schedule

**Next Audit Date**: ____________ (Recommended: Quarterly or after major changes)

**Continuous Monitoring**:
- Weekly: Dependency audit (`npm audit`)
- Monthly: Manual security testing
- Quarterly: Full security audit
- Annually: Third-party penetration testing (recommended)

---

**Audit Template Version**: 1.0
**Last Updated**: October 1, 2025
