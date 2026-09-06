import { PAGE_CSS } from "./page-css.mjs";
import { LOCALES, LOCALE_META, DEFAULT_LOCALE, localeUrl, buildAlternates } from "./i18n-locales.mjs";

function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function renderHeadLinks(locale) {
  const alternates = buildAlternates(LOCALES);
  return alternates
    .map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.url}">`)
    .join("\n");
}

function renderLangSwitch(locale) {
  const items = LOCALES.map((l) => {
    const meta = LOCALE_META[l];
    if (l === locale) return `<span aria-current="page" lang="${l}">${meta.name}</span>`;
    return `<a href="${meta.path}" lang="${l}" hreflang="${l}">${meta.name}</a>`;
  });
  return `<nav class="langswitch" aria-label="Language / Langue / Idioma / Lingua">${items.join("\n")}</nav>`;
}

function renderJsonLd(locale, c) {
  const url = localeUrl(locale);
  const graph = [
    {
      "@type": "Organization",
      "@id": `${localeUrl(DEFAULT_LOCALE)}#organization`,
      name: c.brand.orgName,
      url: localeUrl(DEFAULT_LOCALE),
      description: c.jsonld.orgDescription,
      sameAs: c.jsonld.sameAs,
    },
    {
      "@type": "Person",
      "@id": `${localeUrl(DEFAULT_LOCALE)}#author`,
      name: c.brand.authorName,
      url: c.jsonld.authorUrl,
      sameAs: [c.jsonld.authorUrl],
    },
    {
      "@type": "WebSite",
      "@id": `${url}#website`,
      url,
      name: c.brand.orgName,
      description: c.jsonld.orgDescription,
      inLanguage: locale,
      publisher: { "@id": `${localeUrl(DEFAULT_LOCALE)}#organization` },
    },
    {
      "@type": "Article",
      "@id": `${url}#article`,
      url,
      mainEntityOfPage: url,
      headline: c.jsonld.articleHeadline,
      description: c.jsonld.articleDescription,
      image: `${localeUrl(DEFAULT_LOCALE)}og-image.png`,
      datePublished: c.dates.published,
      dateModified: c.dates.modified,
      inLanguage: locale,
      isAccessibleForFree: true,
      author: { "@id": `${localeUrl(DEFAULT_LOCALE)}#author` },
      publisher: { "@id": `${localeUrl(DEFAULT_LOCALE)}#organization` },
    },
  ];
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2);
}

export function renderPage(locale, c) {
  const meta = LOCALE_META[locale];
  const url = localeUrl(locale);
  const ogLocale = meta.ogLocale;
  const altLocaleTags = LOCALES.filter((l) => l !== locale)
    .map((l) => `<meta property="og:locale:alternate" content="${LOCALE_META[l].ogLocale}">`)
    .join("\n");

  const timelineItems = c.timeline
    .map(
      (t) =>
        `      <li><span class="d${t.next ? " next" : ""}">${t.date}</span><p>${t.html}</p></li>`
    )
    .join("\n");

  const scanRows = c.whoScans.rows
    .map(
      (r) =>
        `      <tr><td>${r.service}</td><td><span class="chip ${r.chipClass}">${r.chipLabel}</span></td><td>${r.basis}</td></tr>`
    )
    .join("\n");

  const theaterRows = c.theater.rows
    .map(
      (r) =>
        `      <tr><td>${r.measure}</td><td class="${r.verdictClass}">${r.verdictLabel}</td><td>${r.why}</td></tr>`
    )
    .join("\n");

  const ladderItems = c.ladder.steps
    .map(
      (s) =>
        `    <li><div><h3>${s.h3}</h3><p class="effort">${s.effort}</p><p>${s.html}</p></div></li>`
    )
    .join("\n");

  const sourceItems = c.sources.items
    .map((s) => `    <li><a href="${s.href}">${s.label}</a></li>`)
    .join("\n");

  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${c.meta.title}</title>
<meta name="description" content="${escapeAttr(c.meta.description)}">
<link rel="canonical" href="${url}">
${renderHeadLinks(locale)}
<meta property="og:title" content="${escapeAttr(c.meta.ogTitle)}">
<meta property="og:description" content="${escapeAttr(c.meta.ogDescription)}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="article">
<meta property="og:image" content="${localeUrl(DEFAULT_LOCALE)}og-image.png">
<meta property="og:locale" content="${ogLocale}">
${altLocaleTags}
<meta property="article:published_time" content="${c.dates.published}">
<meta property="article:modified_time" content="${c.dates.modified}">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">
${renderJsonLd(locale, c)}
</script>
<style>${PAGE_CSS}</style>
<script defer src="/stats/script.js" data-website-id="ff4fc1c2-2a81-4907-aee1-2d36c582cbbe" data-host-url="https://escapechatcontrol.com/stats"></script>
</head>
<body>

<header class="dochead">
  <div class="wrap-wide">
    <span><strong>${c.brand.headerName}</strong> · escapechatcontrol.com</span>
    ${renderLangSwitch(locale)}
    <span class="stamp">${c.dochead.status} <time datetime="${c.dates.published}">${c.dates.published}</time> · ${c.dochead.verified} <time datetime="${c.dates.modified}">${c.dates.modified}</time></span>
  </div>
</header>

<main>
<div class="hero"><div class="wrap-wide">
  <p class="eyebrow">${c.hero.eyebrow}</p>
  <h1>${c.jsonld.articleHeadline}</h1>
  <p class="sub">${c.hero.sub}</p>

  <div class="ledger" role="img" aria-label="${escapeAttr(c.ledger.ariaLabel)}">
    <div class="row"><span>${c.ledger.rowLabel}</span><span>${c.ledger.rowLabelRight}</span></div>
    <div class="row"><span class="n alert">314</span><span>${c.ledger.n1Label}</span></div>
    <div class="bar"><div class="fill"></div><div class="threshold"></div></div>
    <div class="row"><span class="n">276</span><span>${c.ledger.n2Label}</span></div>
    <p class="gap">${c.ledger.gapHtml}</p>
  </div>
</div></div>

<section id="what-happened"><div class="wrap">
  <p class="seclabel">${c.whatHappened.seclabel}</p>
  <h2>${c.whatHappened.h2}</h2>
${c.whatHappened.paragraphs.map((p) => `  <p>${p}</p>`).join("\n")}
  <ul class="timeline">
${timelineItems}
  </ul>
  <p class="note">${c.whatHappened.note}</p>
</div></section>

<section id="who-scans"><div class="wrap-wide">
  <p class="seclabel">${c.whoScans.seclabel}</p>
  <h2>${c.whoScans.h2}</h2>
  <div class="wrap" style="padding:0;margin:0 0 6px"><p>${c.whoScans.intro}</p></div>
  <div class="tscroll"><table>
    <thead><tr><th>${c.whoScans.thead.service}</th><th>${c.whoScans.thead.status}</th><th>${c.whoScans.thead.basis}</th></tr></thead>
    <tbody>
${scanRows}
    </tbody>
  </table></div>
  <p class="verified">${c.whoScans.verifiedNote}</p>
</div></section>

<section id="theater"><div class="wrap-wide">
  <p class="seclabel">${c.theater.seclabel}</p>
  <h2>${c.theater.h2}</h2>
  <div class="wrap" style="padding:0;margin:0 0 6px"><p>${c.theater.intro}</p></div>
  <div class="tscroll"><table class="verdict">
    <thead><tr><th>${c.theater.thead.measure}</th><th>${c.theater.thead.verdict}</th><th>${c.theater.thead.why}</th></tr></thead>
    <tbody>
${theaterRows}
    </tbody>
  </table></div>
</div></section>

<section id="ladder"><div class="wrap">
  <p class="seclabel">${c.ladder.seclabel}</p>
  <h2>${c.ladder.h2}</h2>
  <ol class="ladder">
${ladderItems}
  </ol>
</div></section>

<section class="subscribe" id="subscribe"><div class="wrap">
  <p class="seclabel">${c.subscribe.seclabel}</p>
  <h2>${c.subscribe.h2}</h2>
  <p>${c.subscribe.p}</p>
  <form class="subform" id="subform" data-locale="${locale}">
    <label for="email" style="position:absolute;left:-9999px">${c.subscribe.emailLabel}</label>
    <input type="email" id="email" name="email" placeholder="${escapeAttr(c.subscribe.placeholder)}" required autocomplete="email">
    <input type="text" id="website" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;height:1px;width:1px">
    <button type="submit">${c.subscribe.button}</button>
  </form>
  <p class="submsg" id="submsg" role="status" aria-live="polite"></p>
</div></section>

<section class="sources" id="sources"><div class="wrap">
  <p class="seclabel">${c.sources.seclabel}</p>
  <h2>${c.sources.h2}</h2>
  <p>${c.sources.intro}</p>
  <ol>
${sourceItems}
  </ol>
</div></section>
</main>

<footer><div class="wrap-wide">
  <span>${c.footer.tagline}</span>
  <span>${c.footer.builtBy}</span>
</div></footer>

<script>
(function(){
  var form=document.getElementById('subform');
  var msg=document.getElementById('submsg');
  var loc=form.getAttribute('data-locale')||'en';
  var MSG=${JSON.stringify({
    subscribing: c.subscribe.js.subscribing,
    done: c.subscribe.js.done,
    generic: c.subscribe.js.generic,
    network: c.subscribe.js.network,
  })};
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var email=document.getElementById('email').value.trim();
    var hp=document.getElementById('website').value;
    msg.textContent=MSG.subscribing;
    fetch('/api/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email,website:hp,locale:loc})})
      .then(function(r){return r.json().catch(function(){return{};}).then(function(b){return{ok:r.ok,body:b};});})
      .then(function(res){
        if(res.ok){
          msg.textContent=MSG.done;form.reset();
          try{if(window.umami&&typeof window.umami.track==='function'){window.umami.track('lead_submitted',{form:'subscribe',location:window.location.pathname});}}catch(e){}
        }
        else{msg.textContent=(res.body&&res.body.error)||MSG.generic;}
      })
      .catch(function(){msg.textContent=MSG.network;});
  });
})();
</script>
</body>
</html>
`;
}
