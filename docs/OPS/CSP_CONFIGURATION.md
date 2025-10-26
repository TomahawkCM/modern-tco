# Content Security Policy (CSP) Configuration

## Current CSP Implementation

The CSP is configured in `next.config.js` and is **enabled only in production** to reduce development friction.

### Configured Directives

#### Default Sources
- `default-src 'self'` - Only allow resources from the same origin by default
- `base-uri 'self'` - Restrict base element to same origin
- `frame-ancestors 'self'` - Prevent clickjacking, only allow same-origin embedding

#### Script Sources
- `script-src 'self' https://browser.sentry-cdn.com`
  - Self: Application scripts
  - Sentry: Error tracking SDK

#### Style Sources
- `style-src 'self' 'unsafe-inline'`
  - Self: Application stylesheets
  - Unsafe-inline: Required for styled-components and inline styles

#### Image Sources
- `img-src 'self' data: blob: https://i.ytimg.com https://img.youtube.com`
  - Self: Application images
  - Data/Blob: Base64 images and dynamic images
  - YouTube: Video thumbnails

#### Connect Sources (API/WebSocket)
- `connect-src`:
  - `'self'` - Application APIs
  - `https://${supabaseHost}` - Supabase database (dynamic based on env)
  - `https://*.supabase.co` - Supabase services
  - `wss://*.supabase.co` - Supabase real-time WebSocket
  - `https://us.i.posthog.com` - PostHog analytics
  - `https://*.posthog.com` - PostHog services
  - `https://sentry.io` - Sentry error reporting
  - `https://*.sentry.io` - Sentry services

#### Frame Sources (iframes)
- `frame-src https://www.youtube.com https://www.youtube-nocookie.com`
  - YouTube: Embedded videos
  - YouTube-nocookie: Privacy-enhanced embedded videos

#### Other Sources
- `font-src 'self' data:` - Fonts from self and data URIs
- `worker-src 'self' blob:` - Web Workers and Service Workers
- `object-src 'none'` - No plugins (Flash, Java, etc.)
- `form-action 'self'` - Forms can only submit to same origin

## Security Headers

Additional security headers configured:
- `X-Frame-Options: DENY` - Prevent clickjacking
- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `Referrer-Policy: no-referrer` - Don't leak referrer information
- `Permissions-Policy: geolocation=(), microphone=(), camera=()` - Disable sensitive APIs

## Environment-Specific Configuration

### Development
- CSP is **disabled** in development for better DX
- All security headers except CSP are still applied

### Production
- Full CSP is enforced
- Supabase host is dynamically included based on environment variable
- All third-party services are explicitly allowed

## Testing CSP

1. Build for production: `npm run build`
2. Start production server: `npm start`
3. Check browser console for CSP violations
4. Use browser DevTools Security tab to inspect CSP

## Adding New Services

When adding new services, update the appropriate directive:
1. API endpoints → Add to `connect-src`
2. CDN scripts → Add to `script-src`
3. External images → Add to `img-src`
4. Embedded content → Add to `frame-src`

## CSP Violations Monitoring

CSP violations can be monitored through:
1. Browser console errors during development
2. Sentry error reporting in production (if configured)
3. Consider adding a `report-uri` directive for dedicated CSP violation reporting

## Known Limitations

1. **Inline Styles**: We use `'unsafe-inline'` for styles due to styled-components and Tailwind
2. **Dynamic Scripts**: No `'unsafe-eval'` - dynamic script evaluation is blocked
3. **External Fonts**: Only self-hosted fonts are allowed (no Google Fonts CDN)

## Future Improvements

1. **Nonce-based Scripts**: Implement nonces for inline scripts instead of 'unsafe-inline'
2. **CSP Reporting**: Add `report-uri` or `report-to` for violation monitoring
3. **Stricter Policies**: Remove 'unsafe-inline' for styles by using CSS-in-JS with nonces
4. **Subresource Integrity**: Add SRI hashes for external scripts