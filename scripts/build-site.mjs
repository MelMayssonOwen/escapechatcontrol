// Generates site/index.html (en) and site/<locale>/index.html (es, fr, it,
// pt) from content/i18n/*.mjs through the shared renderer, and regenerates
// sitemap.xml with hreflang alternates for every live locale. This is the
// single generation mechanism for the site — never hand-edit the generated
// HTML in site/.
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { renderPage } from "./render-page.mjs";
import { LOCALES, LOCALE_META, DEFAULT_LOCALE, SITE_URL, localePath, buildAlternates } from "./i18n-locales.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = resolve(ROOT, "site");

async function loadContent(locale) {
  const mod = await import(resolve(ROOT, `content/i18n/${locale}.mjs`));
  return mod.default;
}

function outPath(locale) {
  if (locale === DEFAULT_LOCALE) return resolve(SITE, "index.html");
  return resolve(SITE, locale, "index.html");
}

function buildSitemap(contentByLocale) {
  const alternates = buildAlternates(LOCALES);
  const urls = LOCALES.map((locale) => {
    const c = contentByLocale[locale];
    const altLinks = alternates
      .map((a) => `      <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.url}"/>`)
      .join("\n");
    return `  <url>
    <loc>${SITE_URL}${localePath(locale)}</loc>
    <lastmod>${c.dates.modified}</lastmod>
${altLinks}
  </url>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

async function main() {
  const contentByLocale = {};
  for (const locale of LOCALES) {
    contentByLocale[locale] = await loadContent(locale);
  }

  for (const locale of LOCALES) {
    const html = renderPage(locale, contentByLocale[locale]);
    const out = outPath(locale);
    const dir = dirname(out);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(out, html, "utf8");
    console.log(`built ${out.replace(ROOT + "/", "")}`);
  }

  const sitemap = buildSitemap(contentByLocale);
  writeFileSync(resolve(SITE, "sitemap.xml"), sitemap, "utf8");
  console.log("built site/sitemap.xml");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
