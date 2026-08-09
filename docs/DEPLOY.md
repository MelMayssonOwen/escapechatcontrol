# Deploy — escapechatcontrol.com

Mirrors the sheetfolk-storefront Coolify pattern (dockerfile build pack, port 80).

## One-time setup (Mel)

1. Register `escapechatcontrol.com` (whois-verified available 2026-07-09 ~21:40 UTC).
2. Create a GitHub repo, push `main`.
3. Resend: create an Audience "escapechatcontrol" → copy its ID.
4. Coolify: new app from repo, build pack dockerfile, exposed port 80,
   FQDN escapechatcontrol.com + www. Env vars:
   - `RESEND_API_KEY` (existing Opsibyte key works; sending domain not needed until the first alert email)
   - `RESEND_AUDIENCE_ID`
   - `TRUST_PROXY=1` (behind Coolify's proxy only — enables x-forwarded-for for rate limiting)

Deferred hardening (fine for launch, revisit if the list grows): double opt-in
confirmation emails (needs verified sending domain), Turnstile on the form.
5. DNS → Coolify host, TLS via Coolify.

## Local dev

`npm run dev` → http://localhost:8787

## Content updates (the product loop)

The site is generated, not hand-authored. Source of truth is
`content/i18n/<locale>.mjs` (en, es, fr, it, pt — same shape in every file,
see the comment at the top of `en.mjs`). Never hand-edit `site/index.html`
or `site/<locale>/index.html` — they're build output and get overwritten.

To update tracker rows / the "LAST VERIFIED" stamp / any copy: edit the
relevant field in **every** `content/i18n/*.mjs` file (English is not the
only live locale), then run `npm run build-site` (or `npm run build`, which
also runs GEO/i18n validation) to regenerate `site/`. Commit the regenerated
`site/` output alongside the `content/` change. Every status change = one
commit + one email to the audience. Next scheduled cycle: September 2026
(CSAR trilogue resumes).

Adding a 6th locale: add it to `LOCALES`/`LOCALE_META` in
`scripts/i18n-locales.mjs`, add `content/i18n/<locale>.mjs` matching the
existing shape, rebuild. hreflang, sitemap alternates, and og:locale are all
derived from that one locale list — nothing else to touch.
