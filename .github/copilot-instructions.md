# Copilot Instructions for LionFox TechHub

## Project Overview

LionFox TechHub is a **static marketing website** that promotes free high-performance VPS cloud servers via a Vultr referral programme. It has no build step — the HTML, CSS, and JavaScript files are served directly.

**Live site:** https://lionfoxtechub.pages.dev  
**Hosting:** Cloudflare Pages  
**Deployment:** GitHub Actions workflow at `.github/workflows/deploy.yml` (auto-deploys on push to `main`)

## Repository Structure

```
lionfoxtechub/
├── index.html       # Single-page layout (navbar, hero, features, locations, FAQ, footer)
├── styles.css       # All styles — mobile-first, CSS custom properties for theming
├── script.js        # Vanilla JS: mobile menu, smooth scroll, FAQ accordion, copy links, counters
├── _headers         # Cloudflare security response headers
├── wrangler.toml    # Cloudflare Pages project config
└── .github/
    ├── copilot-instructions.md
    ├── workflows/deploy.yml
    └── ISSUE_TEMPLATE/
```

## Coding Conventions

- **HTML:** Semantic elements, ARIA attributes on interactive controls, `rel="noopener noreferrer"` on all `target="_blank"` links.
- **CSS:** All styles live in `styles.css`. Use existing CSS custom properties (e.g. `--primary`, `--bg-dark`) before adding new ones. Mobile-first with `@media` breakpoints.
- **JavaScript:** Vanilla JS only — no frameworks or build tools. Keep `script.js` self-contained. Use `const`/`let`, arrow functions, and modern DOM APIs.
- **No dependencies:** Do not add `package.json`, npm packages, or any bundler unless the task explicitly requires it.

## Key External URLs (do not change without approval)

| Purpose | URL |
|---|---|
| Vultr referral | `https://www.vultr.com/?ref=9870139-9J` |
| Telegram community | `https://t.me/cloudcomputingtestservers` |

## Testing & Validation

There is no automated test suite. To validate changes:

1. Open `index.html` directly in a browser (no server needed) or use `npx serve .` for a local server.
2. Check mobile responsiveness by resizing the browser.
3. Verify interactive features: mobile hamburger menu, FAQ accordion, copy-link buttons, and smooth scroll.
4. Confirm all external links open correctly and carry `rel="noopener noreferrer"`.

## Deployment

Pushes to `main` trigger the Cloudflare Pages deployment automatically via GitHub Actions. The two required secrets are `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## Security Headers

Security headers are managed in `_headers`. Do not weaken existing `Content-Security-Policy`, `X-Frame-Options`, or other directives.
