import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES, LOCALE_META, DEFAULT_LOCALE, localePath, localeUrl, buildAlternates } from "./i18n-locales.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const robots = readFileSync(resolve(ROOT, "site/robots.txt"), "utf8");
const sitemap = readFileSync(resolve(ROOT, "site/sitemap.xml"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const disallowedSnippetDirectives =
  /noindex|nosnippet|data-nosnippet|noarchive|nocache|max-snippet/i;

for (const locale of LOCALES) {
  const htmlPath = locale === DEFAULT_LOCALE ? "site/index.html" : `site/${locale}/index.html`;
  const html = readFileSync(resolve(ROOT, htmlPath), "utf8");
  const url = localeUrl(locale);

  assert(html.includes(`<html lang="${locale}">`), `[${locale}] <html lang> must be "${locale}"`);
  assert(html.includes(`<link rel="canonical" href="${url}">`), `[${locale}] canonical must self-reference ${url}`);

  const jsonLdMatch = html.match(
    /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/,
  );
  assert(jsonLdMatch, `[${locale}] server-rendered HTML must contain a JSON-LD block`);

  const jsonLd = JSON.parse(jsonLdMatch[1]);
  const graph = jsonLd["@graph"];
  assert(Array.isArray(graph), `[${locale}] JSON-LD must contain an @graph array`);

  const organization = graph.find((node) => node["@type"] === "Organization");
  const website = graph.find((node) => node["@type"] === "WebSite");
  const article = graph.find((node) => node["@type"] === "Article");
  assert(organization, `[${locale}] JSON-LD must contain an Organization`);
  assert(website, `[${locale}] JSON-LD must contain a WebSite`);
  assert(article, `[${locale}] JSON-LD must contain an Article`);
  assert(
    organization.name === website.name,
    `[${locale}] Organization and WebSite must use the same brand name`,
  );
  assert(
    Array.isArray(organization.sameAs) && organization.sameAs.length > 0,
    `[${locale}] Organization must have at least one verified sameAs URL`,
  );
  for (const sameAs of organization.sameAs) {
    const sameAsUrl = new URL(sameAs);
    assert(sameAsUrl.protocol === "https:", `[${locale}] sameAs URL must use HTTPS: ${sameAs}`);
  }

  assert(
    html.includes(`<h1>${article.headline}</h1>`),
    `[${locale}] Article headline must match the visible H1 exactly (plain text, no nested tags)`,
  );
  assert(
    html.includes(
      `<time datetime="${article.datePublished}">${article.datePublished}</time>`,
    ),
    `[${locale}] Article datePublished must be visible`,
  );
  assert(
    html.includes(
      `<time datetime="${article.dateModified}">${article.dateModified}</time>`,
    ),
    `[${locale}] Article dateModified must be visible`,
  );

  assert(
    !disallowedSnippetDirectives.test(html),
    `[${locale}] Snippet-blocking directive found in the citable page`,
  );

  // hreflang: every live locale plus x-default must be present, absolute,
  // and self-consistent with the canonical URL.
  const alternates = buildAlternates(LOCALES);
  for (const alt of alternates) {
    assert(
      html.includes(`<link rel="alternate" hreflang="${alt.hreflang}" href="${alt.url}">`),
      `[${locale}] missing hreflang alternate for ${alt.hreflang} -> ${alt.url}`,
    );
  }

  // og:locale must match this page's locale, and every other live locale
  // must appear as og:locale:alternate.
  assert(
    html.includes(`<meta property="og:locale" content="${LOCALE_META[locale].ogLocale}">`),
    `[${locale}] og:locale must be ${LOCALE_META[locale].ogLocale}`,
  );
  for (const other of LOCALES) {
    if (other === locale) continue;
    assert(
      html.includes(`<meta property="og:locale:alternate" content="${LOCALE_META[other].ogLocale}">`),
      `[${locale}] missing og:locale:alternate for ${other}`,
    );
  }

  // Sitemap must contain this locale's URL with a matching lastmod and the
  // same alternate set as the head tags (single source of truth check).
  const urlBlockMatch = sitemap.match(
    new RegExp(`<url>\\s*<loc>${url.replace(/[/.]/g, "\\$&")}</loc>[\\s\\S]*?</url>`),
  );
  assert(urlBlockMatch, `[${locale}] sitemap must contain <loc>${url}</loc>`);
  assert(
    urlBlockMatch[0].includes(`<lastmod>${article.dateModified}</lastmod>`),
    `[${locale}] sitemap lastmod must match the visible Article dateModified`,
  );
  for (const alt of alternates) {
    assert(
      urlBlockMatch[0].includes(`hreflang="${alt.hreflang}" href="${alt.url}"`),
      `[${locale}] sitemap xhtml:link alternates missing ${alt.hreflang}`,
    );
  }

  // Language switcher must be a real crawlable link to every other live locale.
  for (const other of LOCALES) {
    if (other === locale) continue;
    assert(
      html.includes(`href="${localePath(other)}"`),
      `[${locale}] language switcher missing a link to ${other}`,
    );
  }
}

const requiredAgents = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
  "Googlebot",
  "Bingbot",
  "GPTBot",
  "ClaudeBot",
];
for (const agent of requiredAgents) {
  const allowGroup = new RegExp(`User-agent: ${agent}\\nAllow: /(?:\\n|$)`);
  assert(allowGroup.test(robots), `${agent} must be explicitly allowed`);
}
assert(
  !/^Disallow:\s*\/$/im.test(robots),
  "robots.txt must not disallow the whole site",
);
assert(
  robots.includes("Sitemap: https://escapechatcontrol.com/sitemap.xml"),
  "robots.txt must reference the sitemap",
);
assert(
  sitemap.includes("<loc>https://escapechatcontrol.com/</loc>"),
  "Sitemap must contain the canonical (EN) page",
);
assert(
  sitemap.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'),
  "Sitemap must declare the xhtml namespace for hreflang alternates",
);

console.log(`GEO + i18n validation passed for locales: ${LOCALES.join(", ")}`);
