# Security Policy

## Supported version

The current `main` branch is the supported version of Mockfolio.

## Data handling

- Uploaded images are decoded and rendered only in the visitor's browser.
- The app does not provide an API, server-side image storage, analytics, authentication, or payment processing.
- Only lightweight editor settings are stored in browser `localStorage`; image data is not persisted.
- Uploads are limited to PNG, JPG, JPEG, and WebP files up to 20MB and 40 million pixels.
- Direct image URL imports must be HTTPS image resources that allow CORS. Requests use `credentials: omit`, enforce the same 20MB limit, and are converted to in-memory data URLs before composition.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use the repository's private security advisory feature and include reproduction steps, the affected browser or deployment URL, and the potential impact.

## Deployment requirements

The repository ships a restrictive browser CSP and uses GitHub's official Pages deployment actions. A custom hosting environment should also configure security headers at the edge, including `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, and `Permissions-Policy` with unused browser features disabled.

Before enabling analytics, authentication, payments, or a backend, perform a separate privacy and security review. Those additions change the app's data-handling model and are intentionally outside the current local-first scope.
