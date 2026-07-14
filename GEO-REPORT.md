# GEO Part A report

## Stack

Custom Node HTTP server serving boot-cached static HTML/CSS/vanilla JavaScript. The guide and tracker are present in the initial HTML response; client JavaScript is used only for the email form.

## Foundation

- `/robots.txt` explicitly allows OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, Claude-SearchBot, Claude-User, Googlebot, Bingbot, GPTBot, and ClaudeBot. It retains the sitemap reference.
- `/sitemap.xml` now exists and uses the visible article modification date for `lastmod`.
- The server-rendered head contains an `Organization`, its configured GitHub repository `sameAs`, a `WebSite`, the visible author, and an `Article` JSON-LD graph with stable IDs.
- Article `datePublished` (`2026-07-09`) and `dateModified` (`2026-07-10`) match visible `<time>` elements. No `FAQPage` was added because there is no visible FAQ, and no `SoftwareApplication` was added because this is a guide/tracker rather than an app product page.
- No `noindex`, `nosnippet`, `data-nosnippet`, `NOARCHIVE`, `NOCACHE`, or restrictive `max-snippet` directive is present.

## Verification

- `npm run build`: pass (server syntax plus GEO validation).
- `npm run typecheck`: pass.
- Request-handler smoke test: all ten named crawler user agents received `200`, the raw citable HTML, and JSON-LD; `/robots.txt` and `/sitemap.xml` also received `200`.
- The Dockerfile runs the same green build validation while constructing the image. Docker daemon access is unavailable in this workspace, so the image build itself was not run here.
