import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(resolve(ROOT, "site/index.html"), "utf8");
const robots = readFileSync(resolve(ROOT, "site/robots.txt"), "utf8");
const sitemap = readFileSync(resolve(ROOT, "site/sitemap.xml"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const jsonLdMatch = html.match(
  /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/,
);
assert(jsonLdMatch, "The server-rendered HTML must contain a JSON-LD block");

const jsonLd = JSON.parse(jsonLdMatch[1]);
const graph = jsonLd["@graph"];
assert(Array.isArray(graph), "JSON-LD must contain an @graph array");

const organization = graph.find((node) => node["@type"] === "Organization");
const website = graph.find((node) => node["@type"] === "WebSite");
const article = graph.find((node) => node["@type"] === "Article");
assert(organization, "JSON-LD must contain an Organization");
assert(website, "JSON-LD must contain a WebSite");
assert(article, "JSON-LD must contain an Article");
assert(
  organization.name === website.name,
  "Organization and WebSite must use the same brand name",
);
assert(
  Array.isArray(organization.sameAs) && organization.sameAs.length > 0,
  "Organization must have at least one verified sameAs URL",
);
for (const sameAs of organization.sameAs) {
  const url = new URL(sameAs);
  assert(url.protocol === "https:", `sameAs URL must use HTTPS: ${sameAs}`);
}

assert(
  html.includes(`<h1>${article.headline}</h1>`),
  "Article headline must match the visible H1",
);
assert(
  html.includes(article.description),
  "Article description must match text in the HTML",
);
assert(
  html.includes(
    `<time datetime="${article.datePublished}">${article.datePublished}</time>`,
  ),
  "Article datePublished must be visible",
);
assert(
  html.includes(
    `<time datetime="${article.dateModified}">${article.dateModified}</time>`,
  ),
  "Article dateModified must be visible",
);

const disallowedSnippetDirectives =
  /noindex|nosnippet|data-nosnippet|noarchive|nocache|max-snippet/i;
assert(
  !disallowedSnippetDirectives.test(html),
  "Snippet-blocking directive found in the citable page",
);

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
  "Sitemap must contain the canonical page",
);
assert(
  sitemap.includes(`<lastmod>${article.dateModified}</lastmod>`),
  "Sitemap lastmod must match the visible Article dateModified",
);

console.log("GEO validation passed");
