// Single source of truth for locale routing, used by the renderer, the
// sitemap generator, and validate-geo. Adding a locale here (plus a
// content/i18n/<locale>.mjs file) is the only step needed to add a language —
// per the i18n playbook, hreflang/sitemap/og:locale must all derive from
// this one list so they can never drift out of sync with each other.

export const SITE_URL = "https://escapechatcontrol.com";

export const DEFAULT_LOCALE = "en";

// EN stays unprefixed at the root; every other locale mirrors it at /<locale>/.
export const LOCALE_META = {
  en: { name: "English", ogLocale: "en_US", path: "/" },
  es: { name: "Español", ogLocale: "es_ES", path: "/es/" },
  fr: { name: "Français", ogLocale: "fr_FR", path: "/fr/" },
  it: { name: "Italiano", ogLocale: "it_IT", path: "/it/" },
  pt: { name: "Português", ogLocale: "pt_PT", path: "/pt/" },
};

// Order controls both the language switcher and og:locale:alternate order.
export const LOCALES = ["en", "es", "fr", "it", "pt"];

export function localePath(locale) {
  const meta = LOCALE_META[locale];
  if (!meta) throw new Error(`Unknown locale: ${locale}`);
  return meta.path;
}

export function localeUrl(locale) {
  return SITE_URL + localePath(locale);
}

// Alternates for hreflang / sitemap xhtml:link — one shared builder so head
// tags and the sitemap can never disagree. `liveLocales` lets a future
// partial rollout (a locale not yet fully translated) be excluded from both
// at once by omitting it from the list passed in.
export function buildAlternates(liveLocales = LOCALES) {
  const alternates = liveLocales.map((locale) => ({
    hreflang: locale,
    locale,
    url: localeUrl(locale),
  }));
  alternates.push({ hreflang: "x-default", locale: "x-default", url: localeUrl(DEFAULT_LOCALE) });
  return alternates;
}
